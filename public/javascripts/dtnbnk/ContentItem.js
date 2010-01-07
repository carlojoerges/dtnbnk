ContentItem = Item.extend({
	init: function(data, element) {
		this.__super__(data);
		this.element = element;
		this.editElement = $("<div />").addClass("edit").appendTo(this.element);
	},
	remove: function() {
		if (this.parent_item) this.parent_item.remove_child(this);
		this.__super__();
		this.element.remove();
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
