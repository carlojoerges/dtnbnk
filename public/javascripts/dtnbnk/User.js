User = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "user"
		}, data || {});
		this.buildex();

	},
	show: function(uri) {
		parts = uri.split('/');
	    type = parts.shift();
	    switch(type) {
	      case "collection":
	        ob = this.findFirst("collection");
	        if (ob) ob.render(parts.join("/"));
	        break;
		  default: 
			layoutManager.getCenter().empty().html("<h1>Hello.</h1>");
    	}
    
	},
	buildex: function() {
    var father = this;
    $("<div />").addClass("edit").Button(function() {
      father.container = layoutManager.getWest();
      father.add(new Collection({},$("<div/>")));
    },"New Collection").appendTo(layoutManager.getNorth());

	  //layoutManager.getCenter().html("<h1>Hello.</h1>");
	  
	  if (this.data.include && this.data.include.forward_items) {
			$.each(this.data.include.forward_items, function(i,ob) {
				var item = makenew(ob);
				father.container = layoutManager.getWest();
				father.add(item);
			});	
			this.itemsLoaded = true;
		}
	}
});
