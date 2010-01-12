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
		this.element.addClass("list");
		this.head = $("<h1/>").appendTo(this.element).text(this.options.query.type+"s" || "Items");
		this.container = $("<div/>").addClass("content").appendTo(this.element);
		this.query(this.options.query);
		
	},
	query: function(query) {
		var father = this;
		this.items = new Array();
		this.container.empty();
		var links = null;
		if (this.options.links) {
		  links = $("<ul />").appendTo(this.container);
		}
		$.postJSON("testquery",query,function(data,el) {
			items = JSON.parse(data);
			for (var i=0; i<items.length; i++) {
				if (father.options.links) {
				  links.append($("<li/>").append($("<a/>").text(items[i].name).attr("href",items[i].url || "#")));
				} else {
				  var item = makenew(items[i]);
  				father.add(item);
				}
				
			}
	    });
	},
	add: function(obj) {
		this.items.push(obj);
		if (!obj.data.id) {
			console.log("first save the new object");
			obj.update();
		}
		obj.parent_item = this;
		obj.element.appendTo(this.container);
	},
	remove_child: function(obj) {
		for(var i=0; i<this.items.length;i++ ) { 
		   if(this.items[i]==obj) this.items.splice(i,1); 
		}
	}
})