ContentItem = Item.extend({
	init: function(data, element) {
		this.__super__(data);
		this.element = element;
		this.container = null;
		this.editElement = $("<div />").addClass("edit").appendTo(this.element);

		if (getUser()) this.editElement.show(); else this.editElement.hide();
		this.items = new Array();
		this.itemsLoaded = false;
		this.queueUrl = null;
		this.queueCb = null;
		
	},
	fetchChildren: function(includetype) {
	  var father = this;
	  
	  if (this.data.id) $.postJSON("testquery", _.extend({id: this.data.id},includetype || {forward_items:"all"}), function(resp) {
  		respObj = JSON.parse(resp);
  		if (respObj && respObj[0]) {
  		  if (respObj[0].include && respObj[0].include.forward_items) {
  		   	var sorted_items = respObj[0].include.forward_items.sort(function (a,b) {
    				return (a.sort > b.sort)?0:-1;
    			});
  		   	$.each(sorted_items, function(i,ob) {
            var item = makenew(ob);
            father.add(item);
    			});  		   	
  		  }  		  
  		  if (respObj[0].include && respObj[0].include.backward_items) {
  		    var sorted_items = respObj[0].include.backward_items.sort(function (a,b) {
    			return (a.sort > b.sort)?0:-1;
    		});
          $.each(sorted_items, function(i,ob) {
            var item = makenew(ob);
            father.add(item);
    			});  		   	
  		  }
  		}
		father.itemsLoaded = true;
		if (father.queueCb) {
			father.queueCb(father.queueUrl);
		}
  	});
	},
	render:function(url, callback) {
		this.queueCb = callback || this.show;
		if (!this.itemsLoaded) {
			this.queueUrl = url;
		} else {
			this.queueUrl = null;
			this.queueCb(url);
			this.queueCb = null;
		}
	},
	show: function(url) {
		//default callback
	},
	findFirst: function(type) {
    var res = false;
	  $.each(this.items, function(i,ob) {
			if (!res && ob.data.type == type) res = ob;
		});
    return res;
	},
	findById: function(id) {
	  if (id) {
	    var res = false;
  	  $.each(this.items, function(i,ob) {
  			if (!res && ob.data.id == id) res = ob;
  		});
      return res;
	  }
	},
	getListClass: function() {
	  if (this.data.children) return this.data.children.titleize();
	  else return "Item";
	},
	remove: function() {
		if (this.parent_item) this.parent_item.remove_child(this);
		this.__super__();
		this.element.remove();
	},
	remove_allchildren: function() {
	  console.log("removeall");
	  console.log(this.items);
    //    $.each(this.items, function(i,ob) {
    //  console.log(ob);
    //  console.log("r");
    // });
	},
	remove_children: function(types) {
	  if (!types) this.remove_allchildren(); else {
	    $.each(this.items, function(i,ob) {
  			if (types.indexOf(ob.data.type)) ob.remove();
  		});
	  }
	},
	remove_child: function(obj) {
		this.deassociate(obj.data.id);
		for(var i=0; i<this.items.length;i++ ) { 
		   if(this.items[i]==obj) this.items.splice(i,1); 
		}
	},
	add: function(obj) {
		this.items.push(obj);
		obj.parent_item = this;
		
		if (this.container) {
			obj.element.appendTo(this.container);
		}

		if (!obj.data.id) {
			var father = this;
			var son = obj;
			obj.update(function() {
				father.associate(son.data.id, function() {
				  son.refreshsort(father.container);
				});
			});
		}
		if (this.container) this.makesortable();
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
		if (this.link) $(".edit",this.link).show();
		$(".editable",this.element).each(function() {
			$(this).editable("enable");
		});
	},
	logout: function(e) {
		$(this.editElement).hide();
		if (this.link) $(".edit",this.link).hide();
		$(".editable",this.element).each(function() {
			$(this).editable("disable");
		});
		
	}
});
