ContentItem = Item.extend({
	init: function(data, element) {
		this.__super__(data);
		this.element = element;
		this.editElement = $("<div />").addClass("edit").appendTo(this.element);
		this.items = new Array();
	},
	remove: function() {
		if (this.parent_item) this.parent_item.remove_child(this);
		this.__super__();
		this.element.remove();
	},
	remove_child: function(obj) {
		this.deassociate(obj.data.id);
		for(var i=0; i<this.items.length;i++ ) { 
		   if(this.items[i]==obj) this.items.splice(i,1); 
		}
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
		obj.parent_item = this;
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
	},
	refreshsort: function(container) {
		this.data.sort = $("> div",container).index(this.element);
		this.update();
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
		
	}
});
