// var login = null;
// 
// $(document).ready(function() {
//     $("body").append($.nano.html("/templates/_main.html",null, {callback: bodyLoaded}));
// 
// });
// 
// function bodyLoaded() {
// 	vocablist = new ItemList($("<div />","a").appendTo($("#col1")), {
// 		query: { type: "vocab", backward_items:{type:"tag"}}
// 	});
// 	projectlist = new ItemList($("<div />","a").appendTo($("#col3")), {
// 		query: { type: "project", forward_items:"all"}
// 	});
// 	$("<div />").addClass("edit").Button(function() {
// 		projectlist.add(new Project({},$("<div/>")));
// 	},"New Entry").appendTo("#col2");
// 	$("<div />").addClass("edit").Button(function() {
// 		vocablist.add(new Vocabulary({},$("<div/>")));
// 	},"New Vocabulary").appendTo("#col2");
// 	login = new Login($("<div />").appendTo($("#col2")));
// }

var login = null;
var layoutManager = null;
var app = $.sammy(function() {
	this.get('#/login', function() {
		if (!login) {
			login = new Login($('#login'));
			layoutManager.layout.open("east");
		} else {
			layoutManager.layout.open("east");
		}
	});
	this.get(/\#\/(.*)/, function() {
		layoutManager.layout.close("east");
		$.postJSON("testquery", {type: "project", name: this.params['splat'][0]}, function(resp) {
			respObj = JSON.parse(resp);
			if (respObj && respObj[0]) {
			  el = $("<div/>");
			  el.appendTo(layoutManager.getCenter().empty());
				ob = new Project(respObj[0],el);
			} else {
				layoutManager.getCenter().html("<h1>404<br/>Not found.</h1>")
			}
		});
	});
});

$(function() {
	layoutManager = new LayoutManager($("body"));
	layoutManager.setLayout({
	  west: {
	          type: "ItemList",
	          options: { links: true, query: { type: "project", forward_items:"all"} }
	        }
	});
  $("<div />").addClass("edit").Button(function() {
    projectlist.add(new Project({},$("<div/>")));
  },"New Entry").appendTo("#header").hide();
  $("<div />").addClass("edit").Button(function() {
    vocablist.add(new Vocabulary({},$("<div/>")));
  },"New Vocabulary").appendTo("#header").hide();
  
	app.run('#/');
});