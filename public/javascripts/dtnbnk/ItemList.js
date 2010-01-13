ItemList = Class({
	init: function(element, data) {
		this.options = $.extend({
		  links: false
		}, data || {});
		this.element = element;
		this.items = new Array();
		this.build();
		
	},
	build: function() {
		this.element.empty();
		this.editElement = $("<div />").addClass("edit").appendTo(this.element);
    if (getUser()) this.editElement.show(); else this.editElement.hide();
		this.element.addClass("list");
		this.head = $("<h1/>").appendTo(this.element).text(this.getListClass().pluralize());
		this.container = $((this.options.links)?"<ul />":"<div/>").addClass("content").appendTo(this.element);
		if (this.options.links) this.container.addClass("links");

		var father = this;
		$("<div />").Button(function() {
			el = $("<div/>");
			ob = eval("new "+father.getListClass()+"({}, el)");
			father.add(ob);
		},"New "+this.getListClass()).appendTo(this.editElement);
		$(document).bind("login", function(e) {
			if (father.login) father.login(e);
		});
		$(document).bind("logout", function(e) {
			if (father.logout) father.logout(e);
		});
		
		this.query(this.options.query);
		
	},
	login: function(e) {
		$(this.editElement).show();
		$(".editable",this.element).each(function() {
			$(this).editable("enable");
		});
	},
	logout: function(e) {
		$(this.editElement).hide();
		$(".editable",this.element).each(function() {
			$(this).editable("disable");
		});
		
	},
	getListClass: function() {
	  if (this.options.query && this.options.query.type) return this.options.query.type.titleize();
	  else return "Item";
	},
	query: function(query) {
		var father = this;
		this.items = new Array();
		this.container.empty();
		$.postJSON("testquery",query,function(data,el) {
			items = JSON.parse(data);
			var sorted_items = items.sort(function (a,b) {
				return (a.sort > b.sort)?0:-1;
			});
			$.each(sorted_items, function(i,ob) {
				var item = makenew(ob);

				father.add(item);
			});
	    });
	},
	add: function(obj, linked) {
		this.items.push(obj);
		obj.parent_item = this;
		if (!obj.data.id) {
			console.log("first save the new object");
			obj.update();
		}
		
		if (linked || this.options.links) {
		  this.container.append($("<li/>").append(obj.link));
		  console.log(obj.link.html());
		} else {
		  obj.element.appendTo(this.container);
	  }
	  this.makesortable();
	},
	makesortable: function() {
		var father = this;
		this.container.sortable({handle:'.sort'});
		this.container.bind('sortstop', function(event,ui) {
			$.each(father.items, function(i,ob) {
				ob.refreshsort(father.container);
			});
		});
	},
	remove_child: function(obj) {
		for(var i=0; i<this.items.length;i++ ) { 
		   if(this.items[i]==obj) this.items.splice(i,1); 
		}
	}
})