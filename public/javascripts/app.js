var login = null;
var user = null;
var layoutManager = null;
var url = null;

function isCurrentUser(hash) {
  if (user && (user.data && user.data.user == hash)) return true; else return false;
}

function fetchUser(theuser) {
  $.postJSON("testquery", {user: theuser, forward_items:"all"}, function(resp) {
		respObj = JSON.parse(resp);
		if (respObj && respObj[0]) {
		  el = $("<div/>");
			user = new User(respObj[0],el);
			renderUser();
		} else {
			layoutManager.getCenter().html("<h1>404<br/>Not found.</h1>")
		}
	});  
}

function renderUser() {
  parts = url.split('/');
  urluser = parts.shift();
  user.render(parts.join('/'));
}

function routing(hash) {
  url = hash;
  parts = url.split('/');
  urluser = parts.shift();
  console.log("is current "+urluser+" "+isCurrentUser(urluser));
  if(isCurrentUser(urluser)) {
    renderUser();
  } else {
    fetchUser(urluser);
  }
}

var app = $.sammy(function() {
	this.get(/\#\/admin\/(.*)/, function() {
		if (!login) {
			login = new Login($('#login'));
			layoutManager.layout.open("east");
		} else {
			layoutManager.layout.open("east");
		}
		routing(this.params['splat'][0]);
	});
	this.get(/\#\/(.*)/, function() {
		if (login && login.loggedIn()) {
		  this.redirect('#/admin', this.params['splat'][0]);
		} else {
		  layoutManager.layout.close("east");
      routing(this.params['splat'][0]);
	  }
	});
});

$(function() {
	layoutManager = new LayoutManager($("body"));
  // layoutManager.setLayout({
  //   west: {
  //           type: "ItemList",
  //           options: { links: true, query: { type: "page",forward_items:"all"} }
  //         }
  // });
  // $("<div />").addClass("edit").Button(function() {
  //   projectlist.add(new Project({},$("<div/>")));
  // },"New Entry").appendTo("#header").hide();
  // $("<div />").addClass("edit").Button(function() {
  //   vocablist.add(new Vocabulary({},$("<div/>")));
  // },"New Vocabulary").appendTo("#header").hide();
  
	app.run('#/');
});