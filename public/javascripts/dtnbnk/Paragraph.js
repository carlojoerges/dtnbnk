Paragraph = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "paragraph",
			name: ""
		}, data || {});
		this.element.addClass("paragraph");
		var father = this;

		para = $.nano.html("/templates/_paragraph.html", data, {callback: function(el) {
			$(el).makeeditable(father,{type: "textarea", width: "auto",	height: "auto"});
		}});
		this.element.append(para);
		$("<img src='/images/picol_prerelease_16_090307/badge_cancel_16.png' class='delete' />").appendTo(this.editElement).click(function() {
			father.remove();
		});
		$("<img src='/images/picol_prerelease_16_090307/badge_eject_16.png' class='sort' />").appendTo(this.editElement);
	}
	
})
