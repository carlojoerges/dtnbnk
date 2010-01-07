ListItem = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.element = element;
		this.editElement = $("<div />").addClass("edit").appendTo(this.element);
		this.items = new Array();
		this.build();
	},
	remove: function() {
		this.__super__();
		this.element.remove();
		if (this.parent_item) this.parent_item.remove_child(this);
	},
	remove_child: function(obj) {
		this.deassociate(obj.data.id);
		for(var i=0; i<this.items.length;i++ ) { 
		   if(this.items[i]==obj) this.items.splice(i,1); 
		}
	},
	build: function() {
		this.element.addClass("box project");
		this.head = $("<h1/>").appendTo(this.element).text("ListItem");
		this.container = $("<div/>").addClass("content").appendTo(this.element);
	},
	add: function(obj) {
		this.items.push(obj);
		if (!obj.data.id) {
			console.log("first save the new object");
			var father = this;
			var son = obj;
			obj.update(function() {
				father.associate(son.data.id);
			});
		}
		obj.element.appendTo(this.container);
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
	}
});