Collection = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "collection"
		}, data || {});
		this.possibleChildren = ['Vocabulary', 'Project'];
		this.overviewElement = $("<div/>");
		this.build();
	},
	show: function(uri) {
	    if (uri.length) {
	      ob = this.findById(parseInt(uri));
			console.log(uri);
	      if (ob) {
			//alert("add fin")
	        layoutManager.getCenter().empty().append(ob.element);
	      } else {
	        layoutManager.getCenter().empty().append("<h1>Not found.</h1>");
	      }
	    } else {
	      layoutManager.getCenter().empty().append(this.overviewElement);
	    }
	},
	build: function() {
		this.element.empty();
		this.editElement = $("<div />").addClass("edit").appendTo(this.element);
		this.element.addClass("list box");

		var father = this;
		$(document).bind("login", function(e) {
			if (father.login) father.login(e);
		});
		$(document).bind("logout", function(e) {
			if (father.logout) father.logout(e);
		});
		this.makeButtons();
    this.fetchChildren();
	},
	add: function(obj) {
	  // switch (obj.data.type) {
	  //   case "project":
	  //     this.overviewElement.append(obj.link);
	  //     break;
	  //   case "vocab":
	  //     break;
	  // }
	  // this.__super__(obj);
	
		this.items.push(obj);
		obj.parent_item = this;
		
		if (this.container && obj.data.type == "project") {
			obj.element.appendTo(this.container);
		}
		if (obj.data.type == "project") this.overviewElement.append(obj.link);

		if (!obj.data.id) {
			var father = this;
			var son = obj;
			obj.update(function() {
				father.associate(son.data.id, function() {
				  son.refreshsort(father.container);
				});
			});
		}
		if (this.container) this.makesortable();
	
	
	
	},
	makeButtons: function() {
	  var father = this;
		$.each(this.possibleChildren, function(i,ob) {
			$("<div />").Button(function() {
  			el = $("<div/>");
  			ob = eval("new "+ob+"({}, el)");
  			father.add(ob);
  		},"New "+ob).appendTo(father.editElement);
		});
		
		
	}
});
