Tag = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "tag",
			name: ""
		}, data || {});
		this.element.addClass("tag");
		this.tagelement = $("<div />").addClass("button").text(this.data.name);
		this.tagelement.attr("tagId", this.data.id);
		this.element.append(this.tagelement);
		this.tagelement.makeeditable(this);
	}
});
