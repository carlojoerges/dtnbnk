Vocabulary = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "vocab",
			name: "Vocabulary"
		}, data || {});
		this.buildex();
	},
	add: function(obj) {
		this.items.push(obj);
		if (!obj.data.id) {
			var father = this;
			var son = obj;
			obj.update(function() {
				son.associate(father.data.id);
				son.tagelement.attr("tagid", son.data.id);
			});
		}
		obj.element.appendTo(this.container);
		$(".tag",this.container).draggable({revert: "invalid", helper: 'clone'});
	},
	buildex: function() {
		this.element.addClass("box vocabulary");
		this.head = $("<h1/>").appendTo(this.element);
		this.container = $("<div/>").addClass("content").appendTo(this.element);
		var father = this;
		this.head.text(this.data.name || "Vocabulary").makeeditable(this);
		$("<div />").addClass("edit").Button(function() {
			father.add(new Tag({name:"New Tag"},$("<div/>")));
		},"New Tag").appendTo(this.editElement);
		if (this.data.include && this.data.include.backward_items) {
			var father = this;
			var sorted_items = this.data.include.backward_items.sort(function (a,b) {
				return (a.sort > b.sort)?0:-1;
			});
			$.each(sorted_items, function(i,ob) {
				var item = makenew(ob);
				father.add(item);
			});
		}
		this.fetchChildren({backward_items:{type:"tag"}});

	}
})