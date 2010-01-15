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
	render: function(uri) {
    layoutManager.getCenter().children().remove();

    if (uri.length) {
      ob = this.findById(parseInt(uri));
      if (ob) {
        layoutManager.getCenter().append(ob.element);
      } else {
        layoutManager.getCenter().append("<h1>Not found.</h1>");
      }
    } else {

      layoutManager.getCenter().append(this.overviewElement);
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
	  switch (obj.data.type) {
	    case "project":
	      this.container = null;
	      this.overviewElement.append(obj.link);
	      break;
	    case "vocab":
	      this.container = this.element;
	      break;
	  }
	  this.__super__(obj);
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
