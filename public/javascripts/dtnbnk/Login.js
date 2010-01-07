Login = Class({
	init: function(element) {
		this.element = element;
		this.data = {};
		var father = this;
		this.element.append($.nano.html("/templates/_login.html",null, {callback: function(el) {
			$("form .logout",father.element).hide();
			$("form",father.element).submit(function() {
				father.authenticate($(".login",$(this)).val(),$(".password",$(this)).val());
				return false;
			});
			$("form .register",father.element).click(function() {
				father.register($(".login",$(this).parent()).val(),$(".password",$(this).parent()).val());
				return false;
			});
			$("form .logout",father.element).click(function() {
				father.logout();
				return false;
			});
		}}));
		this.authenticate("asdf","asdf");
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
		var father = this;
		$.postJSON("item", {user: user, password: hex_sha1(pass)}, function(resp) {
			respObj = JSON.parse(resp);
			father.data.id = respObj.id;
			if (father.data.id) father.element.append("Registered");
		});
	}
	
})