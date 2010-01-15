Login = Class({
	init: function(element) {
		this.element = element;
		this.data = {
			type: "user"
		};
		this.build();
		$("body .edit").hide();
	},
	build: function() {
	  var father = this;
		this.element.append($.nano.html("/templates/_login.html",null, {callback: function(el) {
			$("form .logout",father.element).hide();
			$("form",father.element).submit(function() {
				father.authenticate($(".user",$(this)).val(),$(".password",$(this)).val());
				return false;
			});
			$("form .register",father.element).click(function() {
				father.register($("form .user",father.element).val(),$("form .password",father.element).val());
				return false;
			});
			$("form .logout",father.element).click(function() {
				father.logout();
				return false;
			});
		}}));
	},
	render: function(hash) {
	  parts = hash.split('/');
	  user = parts.shift();
	  var father = this;
	  if (this.data.name && this.data.name == user) {
	    
	  } else {
  		$.postJSON("testquery", {user: user, forward_items: "all"}, function(resp) {
  			respObj = JSON.parse(resp);
        var sorted_items = this.data.include.forward_items.sort(function (a,b) {
  				return (a.sort > b.sort)?0:-1;
  			});
  			$.each(sorted_items, function(i,ob) {
  				var item = makenew(ob);
  				if (ob.type == "tag") {
  					father.addtag(item.element, item.data.id);
  				} else {

  					father.add(item);
  				}
  			});
  			
			});
	    
	  }
    
	},
	loggedIn: function() {
	  if (this.data) return this.data.id; else return null;
	},
	authenticate: function(user, pass) {
		var father = this;
		$.postJSON("testquery", {user: user, password: hex_sha1(pass)}, function(resp) {
			respObj = JSON.parse(resp);
			if (respObj && respObj[0]) {
				father.data = respObj[0];
				flashmessage(father.element, $("<b>Logged in.</b>"));
				$("form .submit",father.element).hide();
				$("form .logout",father.element).show();
				$("body .edit").show();
				$(document).trigger("login");
			} else {
				flashmessage(father.element, $("<b>Something went wrong.</b>"));
			}
		});
	},
	logout: function() {
		this.data = null;
		$("form .submit",this.element).show();
		$("form .logout",this.element).hide();
		flashmessage(this.element, $("<b>Logged out.</b>"));
		$(document).trigger("logout");
	},
	register: function(user, pass) {
		console.log(user);
		console.log(pass);
		var father = this;
		$.postJSON("item", {user: user, password: hex_sha1(pass)}, function(resp) {
			respObj = JSON.parse(resp);
			father.data.id = respObj.id;
			if (father.data.id) flashmessage(father.element, $("<b>Welcome.</b>"));
		});
	}
	
})