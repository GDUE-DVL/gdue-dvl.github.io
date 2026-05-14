from __future__ import annotations

import html
import re
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "people" / "people.md"
HTML_FILE = BASE_DIR / "people.html"
IMAGE_DIR = BASE_DIR / "images"
PLACEHOLDER_IMAGE = "https://placehold.co/150x200/eee/999?text=Photo"

SECTION_MARKERS = {
    "teachers": ("<!-- AUTO_TEACHERS_START -->", "<!-- AUTO_TEACHERS_END -->", "教师团队"),
    "students": ("<!-- AUTO_STUDENTS_START -->", "<!-- AUTO_STUDENTS_END -->", "学生团队"),
}

FIELD_ALIASES = {
    "编号": "id",
    "照片": "image",
    "身份": "title",
    "职称": "title",
    "年级专业": "title",
    "班级": "title",
    "年级": "grade",
    "专业": "major",
    "研究方向": "research",
    "资料": "details",
    "邮箱": "email",
    "email": "email",
    "Email": "email",
}


def split_field(item: str) -> tuple[str, str] | None:
    for sep in ("：", ":"):
        if sep in item:
            key, value = item.split(sep, 1)
            return key.strip(), value.strip()
    return None


def parse_people_md(path: Path) -> dict[str, list[dict[str, str]]]:
    sections: dict[str, list[dict[str, str]]] = {"teachers": [], "students": []}
    current_section: str | None = None
    current_member: dict[str, str] | None = None

    def flush_member() -> None:
        nonlocal current_member
        if current_section and current_member:
            sections[current_section].append(normalize_member(current_member))
        current_member = None

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith(">"):
            continue

        if line.startswith("## "):
            flush_member()
            if "教师" in line:
                current_section = "teachers"
            elif "学生" in line:
                current_section = "students"
            else:
                current_section = None
            continue

        if line.startswith("### "):
            flush_member()
            if current_section:
                current_member = {"name": line[4:].strip()}
            continue

        if current_member and line.startswith("- "):
            field = split_field(line[2:].strip())
            if not field:
                continue
            key, value = field
            normalized_key = FIELD_ALIASES.get(key, key)
            current_member[normalized_key] = value

    flush_member()
    return sections


def normalize_member(member: dict[str, str]) -> dict[str, str]:
    member = {key: value.strip() for key, value in member.items() if value.strip()}

    if "title" not in member:
        grade = member.get("grade", "")
        major = member.get("major", "")
        member["title"] = f"{grade}{major}".strip()

    member["image"] = resolve_image(member)
    return member


def resolve_image(member: dict[str, str]) -> str:
    image = member.get("image", "")
    if image:
        return image.replace("\\", "/")

    member_id = member.get("id", "")
    for ext in (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"):
        candidate = IMAGE_DIR / f"{member_id}{ext}"
        if candidate.exists():
            return f"images/{member_id}{ext}"

    return PLACEHOLDER_IMAGE


def build_member_card(member: dict[str, str], photo_class: str, indent: str) -> str:
    name = html.escape(member.get("name", ""))
    title = html.escape(member.get("title", ""))
    image = html.escape(member.get("image", PLACEHOLDER_IMAGE))
    research_parts = [member.get("research", ""), member.get("details", "")]
    research = "<br>".join(html.escape(part) for part in research_parts if part)
    email = html.escape(member.get("email", ""))

    if photo_class == "member-photo-box":
        onerror = f"this.src='{PLACEHOLDER_IMAGE}'"
    else:
        fallback = "👨‍🏫" if member.get("id", "").startswith("t-") else "🎓"
        onerror = f"this.style.display='none';this.parentNode.innerText='{fallback}'"

    email_html = ""
    if email:
        email_html = f'\n{indent}    <div class="member-contact">Email: {email}</div>'

    return "\n".join(
        [
            f'{indent}<div class="member-card">',
            f'{indent}  <div class="{photo_class}">',
            f'{indent}    <img src="{image}" alt="{name}" onerror="{onerror}">',
            f"{indent}  </div>",
            f'{indent}  <div class="member-info">',
            f'{indent}    <div class="member-name">{name}</div>',
            f'{indent}    <div class="member-title">{title}</div>',
            f'{indent}    <div class="member-research">{research}</div>{email_html}',
            f"{indent}  </div>",
            f"{indent}</div>",
        ]
    )


def build_member_grid(members: list[dict[str, str]], photo_class: str, indent: str) -> str:
    card_indent = indent + "  "
    cards = "\n\n".join(build_member_card(member, photo_class, card_indent) for member in members)
    if cards:
        return f'{indent}<div class="member-grid">\n{cards}\n{indent}</div>'
    return f'{indent}<div class="member-grid"></div>'


def find_grid_bounds(content: str, heading_text: str) -> tuple[int, int, str]:
    heading_index = content.find(heading_text)
    if heading_index == -1:
        raise ValueError(f"找不到页面小节：{heading_text}")

    grid_start = content.find('<div class="member-grid"', heading_index)
    if grid_start == -1:
        raise ValueError(f"找不到 {heading_text} 后面的成员网格")

    line_start = content.rfind("\n", 0, grid_start) + 1
    indent = re.match(r"[ \t]*", content[line_start:grid_start]).group(0)

    div_pattern = re.compile(r"</?div\b[^>]*>", flags=re.IGNORECASE)
    depth = 0
    for match in div_pattern.finditer(content, grid_start):
        token = match.group(0)
        if token.lower().startswith("</div"):
            depth -= 1
        else:
            depth += 1
        if depth == 0:
            return grid_start, match.end(), indent

    raise ValueError(f"无法确定 {heading_text} 成员网格的结束位置")


def replace_section(content: str, section: str, grid_html: str) -> str:
    start_marker, end_marker, heading_text = SECTION_MARKERS[section]
    marker_pattern = re.compile(
        rf"^[ \t]*{re.escape(start_marker)}.*?^[ \t]*{re.escape(end_marker)}",
        flags=re.DOTALL | re.MULTILINE,
    )

    existing_marker = marker_pattern.search(content)
    if existing_marker:
        line = existing_marker.group(0).splitlines()[0]
        indent = re.match(r"[ \t]*", line).group(0)
        block = f"{indent}{start_marker}\n{grid_html}\n{indent}{end_marker}"
        return marker_pattern.sub(block, content, count=1)

    grid_start, grid_end, indent = find_grid_bounds(content, heading_text)
    block = f"{indent}{start_marker}\n{grid_html}\n{indent}{end_marker}"
    return content[:grid_start] + block + content[grid_end:]


def main() -> int:
    if not DATA_FILE.exists():
        print(f"错误：找不到数据文件 {DATA_FILE}")
        return 1
    if not HTML_FILE.exists():
        print(f"错误：找不到页面文件 {HTML_FILE}")
        return 1

    sections = parse_people_md(DATA_FILE)
    content = HTML_FILE.read_text(encoding="utf-8")
    photo_class = "member-photo-box" if "member-photo-box" in content else "member-photo"

    for section in ("teachers", "students"):
        _, _, heading = SECTION_MARKERS[section]
        grid_start, _, indent = find_grid_bounds(content, heading)
        grid_indent = re.match(r"[ \t]*", content[content.rfind("\n", 0, grid_start) + 1 : grid_start]).group(0)
        grid_html = build_member_grid(sections[section], photo_class, grid_indent)
        content = replace_section(content, section, grid_html)

    HTML_FILE.write_text(content, encoding="utf-8", newline="\n")
    print(f"已从 {DATA_FILE.relative_to(BASE_DIR)} 更新 {HTML_FILE.name}")
    print(f"教师：{len(sections['teachers'])} 人；学生：{len(sections['students'])} 人")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
