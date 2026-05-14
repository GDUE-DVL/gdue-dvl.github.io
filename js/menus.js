//头部初始化
function headInit()
{
	$('#undefined-sticky-wrapper').html(
		'<div class="navbar navbar-custom sticky" role="navigation">'
			+'<div class="container" style="min-width: 970px;">'
				+'<div class="row">'
					+'<!-- Navbar-header -->'
					+'<div class="navbar-header col-xs-4">'
						+'<!-- Responsive menu button -->'
						+'<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">'
			              	+'<i class="ti-menu"></i>'
			          	+'</button>'
						+'<!-- LOGO -->'
						+'<a class="logo smooth-link" href="index.html">'
							+'<img src="img/logo.png"'
								+'alt="logo">'
						+'</a>'
					+'</div>'
					+'<!-- end navbar-header -->'
					+'<!-- menu -->'
					+'<div class="navbar-collapse collapse col-xs-8 right" id="navbar-menu">'
						+'<!-- search -->'
						+'<div style="overflow:hidden;margin-bottom: 20px;">'
							+'<form class="form-inline" style="padding: 15px;">'
								+'<!-- Tq -->'
								+'<div class="right"><img src="img/T_logo.png" /></div>'								
							+'</form>'
						+'</div>'
						+'<!-- Navbar left -->'
						+'<ul class="nav navbar-nav navbar-right">'
							+'<li>'
								+'<a href="index.html">'
									    +'Home'
								+'</a>'
							+'</li>'
							+'<li class="dropdown">'
								+'<a id="dLabelResearch" class="btn-default dropdown-toggle" data-target="#"  href="research.html" data-hover="dropdown"  role="button" aria-haspopup="true" aria-expanded="false">'
									+'Research'
									+'<span class="caret"></span>'
								+'</a>'
								
								+'<ul class="dropdown-menu" id="research2Menu" aria-labelledby="dLabelResearch">'
								+'</ul>'
							+'</li>'
							+'<li class="dropdown">'
								+'<a id="dLabelPeople" class="btn-default dropdown-toggle" data-target="#"  href="peoples.html" data-hover="dropdown"  role="button" aria-haspopup="true" aria-expanded="false">'
									+'People'
									/*+'<span class="caret"></span>'*/
								+'</a>'
								/*+'<ul class="dropdown-menu" id="people2Menu" aria-labelledby="dLabelPeople">'
								+'</ul>'*/
							+'</li>'
							+'<li>'
								+'<a href="publications.html">Publications</a>'
							+'</li>'
							+'<li class="dropdown">'
								+'<a id="dLabel" data-target="#" href="news.html" class="btn-default dropdown-toggle" data-hover="dropdown"  role="button" aria-haspopup="true" aria-expanded="false">'
									+'News & Events'
									+'<span class="caret"></span>'
								+'</a>'
								+'<ul class="dropdown-menu" aria-labelledby="dLabel">'
									+'<li><a href="news.html?news">News</a></li>'
									+'<li><a href="news.html?events">Events</a></li>'
								+'</ul>'
							+'</li>'
						+'</ul>'
					+'</div>'
					+'<!--/Menu -->'
				+'</div>'
			+'</div>'
			+'<!-- end container -->'
		+'</div>'
	);
}

//获取人的类型菜单项
function getMenuPeopleType()
{
	$.ajax({
		type:"get",
		url:apiPrefix + "people/getPeopleType",
		async:true,
		success : function(result){
			if(result.errorCode != 200)
			{
				return false;
			}
			else
			{
				var typeList = result.data.list;
				var typeHtml = "";
				for(var key in typeList)
				{
					//typeHtml += '<li><a href="kpeoples.html?'+key+'">'+typeList[key].replace("_"," ")+'</a></li>';
				}
				$("#people2Menu").html(typeHtml);
			}
		}
	});
}
//获取出版物
function getMenuPubType()
{
	$.ajax({
		type:"get",
		url:apiPrefix + "publications/getPublicationType",
		async:true,
		success : function(result){
			
		}
	});
}

//获取研究类型
function getMenuResearchType()
{
	$.ajax({
		type:"get",
		url:apiPrefix + "research/typeLists",
		async:true,
		success : function(result){
			if(result.errorCode != 200)
			{
				return false;
			}
			else
			{
				var typeList = result.data.list;
				var typeHtml = "";
				for(var i = 0; i < typeList.length; i++)
				{
					typeHtml += '<li><a href="research.html?'+typeList[i].id+'">'+typeList[i].name+'</a></li>';
				}
				$("#research2Menu").html(typeHtml);
			}
		}
	});
}

//加载菜单
function getMeuns2()
{
	headInit();
	getMenuPeopleType();
	getMenuResearchType();
}
	
getMeuns2();

function footerInit()
{
	var footerHtml = ''
	+'<div class="container">'
		+'<div class="row" id="coope" style="text-align:center;">'
		+'</div>'
		+'<div class="row">'
			+'<div class="col-md-8 col-md-offset-2">'
			+	'<div class="row" style="margin:0;text-align:center;">'
			+		'<address class="indexContact">'
			+		'</address>'
			+	'</div>'
			+	'<div class="row" style="margin:0;text-align:center;">'
			+	  'Copyright©2016'
			+	  '<span class="tone"><a href="http://www.tsinghua.edu.cn/publish/newthu/index.html" target="_blank"> Tsinghua University</a></span>'
			+	  '<span><a href="http://www.beian.miit.gov.cn" target="_blank"> 京ICP备17006999号&nbsp;</a></span>'
			+	'</div>'
			+	'<div class="row recordcode" style="margin-top:15px;text-align:center;">'
			+		'<a style="display: inline-flex;" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010802022904" target="_blank">'
			+			'<i></i>京公网安备11010802022904号'
			+		'</a>'
			+	'</div>'
			+'</div>'
		+'</div>'
	+'</div>';
	
	return footerHtml;
}

function getFooterInfo()
{
	$.ajax({
		type:"get",
		url:apiPrefix+'home/homeContent',
		async:true,
		success : function(result){
			$("#footer").html(footerInit());
			var dataList;
			var welcomeHtml;
			var contactHtml = "";
			if(result.errorCode > 0)
			{
				dataList = result.data.list[0];
				//合作伙伴
				var _coope = result.data.list["logo"];
				
				if(dataList.address){
					contactHtml += dataList.address + '<br/>';
				}
				if(dataList.secretary1){
					contactHtml += 'Secretary:' + dataList.secretary + '<br/>';
				}
				if(dataList.phone1){
					contactHtml += 'Phone No.:' + dataList.phone + '<br/>';
				}
				if(dataList.email1){
					contactHtml += 'Email:<span class="tone">' + dataList.email + '</span><br/>';
				}
				
				var _coopeHtml = "";
				for (var index = 0; index < _coope.length; index++) {
					_coopeHtml += '<div  class="footer-coope" style="display: inline-block;margin-right:10px;">'
								+		'<a target="_blank" style="display:inline-block;margin:8px 0;" href="'+ _coope[index].url +'"><img src="'+ _coope[index].picurl +'" alt="'+ _coope[index].url +'"></a>'
								+   '</div>';
				}
			}
			$('#coope').html(_coopeHtml);
			$('.indexContact').html(contactHtml);
			$('.image').viewer();
		}
	});
}
getFooterInfo();


var initLang = function(){
	$(".loadingMore a").text("load more ...");
}

initLang();
