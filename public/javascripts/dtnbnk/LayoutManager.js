LayoutManager = Class({
	init: function(element, data) {
		this.options = $.extend({
		
		}, data || {});
		this.element = element;
		this.build();
	},
	build: function() {
		this.element.empty();
		$('<div id="header" />').appendTo(this.element);
		$('<div id="login" />').appendTo(this.element);
  	side = $('<div id="sidebar" />').appendTo(this.element);
  	$('<div id="content" />').appendTo(this.element);
  	this.layout = $(this.element).layout({
  	  spacing_open: 0,
  	  spacing_closed: 0,
  	  enableCursorHotkey: false,
      prefix: "db-",
      north__paneSelector: "#header",
  		north__size: 100,
      west__paneSelector: "#sidebar",
  		west__size: 100,
  		west__initClosed: false,
  		west__resizable: false,
  		east__paneSelector: "#login",
  		east__size: 300,
  		east__initClosed: true,
  		east__resizable: false,
  		center__paneSelector: "#content"
  	});
  	this.layout.allowOverflow(side);
		this.getNorth().append("<h1>db</h1>");
	},
	setLayout: function(layout) {
	  if (layout.west) {
	    container = $("<div/>").appendTo(this.getWest());
	    eval("new "+layout.west.type+"(container, layout.west.options)");
	  }
	},
	getNorth: function() {
    return this.layout.panes.north;
  },
  getCenter: function() {
    return this.layout.panes.center;
  },
	getWest: function() {
    return this.layout.panes.west;
  },
	getEast: function() {
    return this.layout.panes.east;
  }
})