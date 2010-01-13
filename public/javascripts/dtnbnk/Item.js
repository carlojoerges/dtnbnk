Item = Class({
	init: function(data) {
		this.data = data || {};
		var father = this;
		$(document).bind("login", function(e) {
			if (father.login) father.login(e);
		});
		$(document).bind("logout", function(e) {
			if (father.logout) father.logout(e);
		});
	},
	fetch: function() {
		
	},
	update: function(callback) {
		updateobject = this.data;
		delete updateobject.include;
		delete updateobject.updated_at;
		delete updateobject.created_at;
		var father = this;
		var cb = callback;
		$.postJSON("item", updateobject, function(resp) {
			respObj = JSON.parse(resp);
			father.data.id = respObj.id;
			if (cb) cb();
		});
		
	},
	remove: function() {
		if (this.data.id) {
			$.get("delete/"+this.data.id, null, function(resp) {
				console.log("Removed.");
			});
		}
	},
	associate: function(id, callback) {
	  var father = this;
		var cb = callback;
		if (this.data.id) {
			$.get("assoc/"+this.data.id+"/"+id, null, function(resp) {
				console.log("Associated.");
				if (cb) cb();
			});
		}
	},
	deassociate: function(id) {
		if (this.data.id) {
			$.get("deassoc/"+this.data.id+"/"+id, null, function(resp) {
				console.log("Deassociated.");
			});
		}
	}
	
})