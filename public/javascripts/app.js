$.postJSON = function(url, data, callback) {
	$.ajax({
		type: "POST",
		url: url,
		cache: false,
		data: "json="+JSON.stringify(data),
		success: callback
	});
};

Item = Class({
	init: function(data) {
		this.data = data || {};
	},
	fetch: function() {
		
	},
	update: function(callback) {
		updateobject = this.data;
		delete updateobject.include;
		var father = this;
		var cb = callback;
		$.postJSON("item", updateobject, function(resp) {
			respObj = JSON.parse(resp);
			father.data.id = respObj.id;
			if (cb) cb();
		});
		
	},
	remove: function() {
		if (this.data.id) {
			$.get("delete/"+this.data.id, null, function(resp) {
				console.log("Removed.");
			});
		}
	},
	associate: function(id) {
		if (this.data.id) {
			$.get("assoc/"+this.data.id+"/"+id, null, function(resp) {
				console.log("Associated.");
			});
		}
	},
	deassociate: function(id) {
		if (this.data.id) {
			$.get("deassoc/"+this.data.id+"/"+id, null, function(resp) {
				console.log("Deassociated.");
			});
		}
	}
	
})

ContentItem = Item.extend({
	remove: function() {
		if (this.parent_item) this.parent_item.remove_child(this);
		this.__super__();
		this.element.remove();
	},
	refreshsort: function(container) {
		this.data.sort = $("> div",container).index(this.element);
		this.update();
	}
});

Tag = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data);
		this.data = $.extend({
			type: "tag",
			name: ""
		}, data || {});
		console.log(this.data);
		this.element = element;
		this.element.addClass("tag");
		this.tagelement = $("<div />").addClass("button").text(this.data.name);
		// TODO: ugly hack to identify tag on droppable
		//el[0].tagId = this.data.id;
		this.tagelement.attr("tagId", this.data.id);
		this.element.append(this.tagelement);
		var father = this;
		this.tagelement.addClass("editable").editable(function(value, settings) { 
			father.data.name = value;
			father.update();
		    return(value);
		  }, { 
		    submit: "",
			width: "none",
			height: "none",
			event     : "dblclick"
		 });
	}
});

H1 = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data);
		this.data = $.extend({
			type: "h1",
			name: ""
		}, data || {});
		this.element = element;
		this.element.addClass("h1");
		var father = this;

		para = $.nano.html("/templates/_h1.html", data, {callback: function(el) {
			$(el).addClass("editable").editable(function(value, settings) { 
				father.data.name = value;
				father.update();
			    return(value);
			  }, { 
			    submit: "",
				width: "none",
				height: "none",
				event     : "dblclick"
			 });
		}});
		this.element.append(para);
		$("<img src='/images/picol_prerelease_16_090307/badge_cancel_16.png' class='delete' />").appendTo(this.element).click(function() {
			father.remove();
		});
		$("<img src='/images/picol_prerelease_16_090307/badge_eject_16.png' class='sort' />").appendTo(this.element);
	}
	
})

Paragraph = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data);
		this.data = $.extend({
			type: "paragraph",
			name: ""
		}, data || {});
		this.element = element;
		this.element.addClass("paragraph");
		var father = this;

		para = $.nano.html("/templates/_paragraph.html", data, {callback: function(el) {
			$(el).addClass("editable").editable(function(value, settings) { 
				father.data.name = value;
				father.update();
			    return(value);
			  }, { 
				type: "textarea",
			    submit: "",
				width: "auto",
				height: "auto",
				event     : "dblclick"
			 });
		}});
		this.element.append(para);
		$("<img src='/images/picol_prerelease_16_090307/badge_cancel_16.png' class='delete' />").appendTo(this.element).click(function() {
			father.remove();
		});
		$("<img src='/images/picol_prerelease_16_090307/badge_eject_16.png' class='sort' />").appendTo(this.element);
	}
	
})

ListItem = Item.extend({
	init: function(data, element) {
		this.__super__(data);
		this.element = element;
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

function makenew(ob) {
	var item = null;
	switch (ob.type) {
		case "vocab": item = new Vocabulary(ob,$("<div/>")); break;
		case "tag": item = new Tag(ob,$("<div/>")); break;
		case "h1": item = new H1(ob,$("<div/>")); break;
		case "paragraph": item = new Paragraph(ob,$("<div/>")); break;
		case "project": item = new Project(ob,$("<div/>")); break;
		default: item = new Item(ob); break;
	}
	return item;
}

Vocabulary = ListItem.extend({
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
		var father = this;
		this.head.addClass("editable").text(this.data.name || "Vocabulary").editable(function(value, settings) { 
			father.data.name = value;
			father.update();
		    return(value);
		  }, { 
		    submit: "",
			width: "none",
			height: "none",
			event     : "dblclick"
		 });
		$("<div />").Button(function() {
			father.add(new Tag({name:"New Tag"},$("<div/>")));
		},"New Tag").appendTo(this.element);
		if (this.data.include && this.data.include.backward_items) {
			var father = this;
			var sorted_items = this.data.include.backward_items.sort(function (a,b) {
				return (a.sort > b.sort)?0:-1;
			});
			console.log(sorted_items);
			$.each(sorted_items, function(i,ob) {
				var item = makenew(ob);
				father.add(item);
			});
		}

	}
})

Project = ListItem.extend({
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
		this.head.addClass("editable").text(this.data.name || "New Project").editable(function(value, settings) { 
			father.data.name = value;
			father.update();
		    return(value);
		  }, { 
		    submit: "",
			width: "none",
			height: "none",
			event     : "dblclick"
		 });
		var father = this;
		this.buttons = $("<div/>").addClass("buttons").insertAfter(this.container);
		this.tags = $("<div/>").addClass("tags").text("Tags:").droppable({ accept: '.tag', hoverClass: 'drophover' }).insertAfter(this.container);
		this.tags.bind('drop', function(event, ui) {
			tagid = $(":first-child",ui.draggable).attr("tagid");
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


ItemList = Class({
	init: function(element, data) {
		this.options = $.extend({
		
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
		$.postJSON("testquery",query,function(data,el) {
			items = JSON.parse(data);
			for (var i=0; i<items.length; i++) {
				var item = makenew(items[i]);
				father.add(item);
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

$.fn.Button = function(callback, title) {
  return this.addClass("button").click(callback).text(title);
};

$(document).ready(function() {
    $("body").append($.nano.html("/templates/_main.html",null, {callback: bodyLoaded}));

});

function bodyLoaded() {
	vocablist = new ItemList($("<div />","a").appendTo($("#col1")), {
		query: { type: "vocab", backward_items:{type:"tag"}}
	});
	projectlist = new ItemList($("<div />","a").appendTo($("#col3")), {
		query: { type: "project", forward_items:"all"}
	});
	$("<div />").Button(function() {
		projectlist.add(new Project({},$("<div/>")));
	},"New Entry").appendTo("#col2");
	$("<div />").Button(function() {
		vocablist.add(new Vocabulary({},$("<div/>")));
	},"New Vocabulary").appendTo("#col2");
}


