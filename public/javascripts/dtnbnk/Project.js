Project = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "project"
		}, data || {});
		this.buildex();
	},
	addtag: function(tag, tagid) {
		$(this.tags).append(tag);
		var father = this;
		$("<img src='/images/picol_prerelease_16_090307/badge_cancel_16.png' class='delete' />").appendTo(tag).click(function() {
			$(this).parent().remove();
			father.deassociate(tagid);
		});
	},
	buildex: function() {
		this.element.addClass("box project");
		this.head = $("<h1/>").appendTo(this.element);
		this.container = $("<div/>").addClass("content").appendTo(this.element);
		this.head.text(this.data.name || "New Project").makeeditable(this);
		var father = this;
		this.buttons = this.editElement;
		this.tags = $("<div/>").addClass("tags").text("Tags:").droppable({ accept: '.tag', hoverClass: 'drophover' }).insertAfter(this.container);
		this.tags.bind('drop', function(event, ui) {
			tagid = $(".button",ui.draggable).attr("tagId");
			tag = ui.draggable.clone();
			father.associate(tagid);
			father.addtag(tag, tagid);
		});
		
		$("<div />").Button(function() {
			father.update();
		},"Save").appendTo(this.buttons);
		$("<div />").Button(function() {
			father.remove();
		},"Delete").appendTo(this.buttons);
		$("<div />").Button(function() {
			father.add(new Paragraph({name:"Paragraph"},$("<div/>")));
		},"New Paragraph").appendTo(this.buttons);
		$("<div />").Button(function() {
			father.add(new H1({name:"Heading"},$("<div/>")));
		},"New Heading").appendTo(this.buttons);
		$("<div />").Button(function() {
			father.add(new Image({},$("<div/>")));
		},"New Image").appendTo(this.buttons);
		if (this.data.include && this.data.include.forward_items) {
			var father = this;
			var sorted_items = this.data.include.forward_items.sort(function (a,b) {
				return (a.sort > b.sort)?0:-1;
			});
			$.each(sorted_items, function(i,ob) {
				var item = makenew(ob);
				if (ob.type == "tag") {
					father.addtag(item.element, item.data.id);
				} else {
					
					father.add(item);
				}
			});
			this.makesortable();
			
		}

	}
})