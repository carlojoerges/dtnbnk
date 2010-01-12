$.fn.makeeditable = function(father, options, callback) {
	$(this).addClass("editable").editable(callback || function(value, settings) { 
		father.data.name = value;
		father.update();
		return(value);
	}, $.extend({ 
		onblur: "submit",
		submit: "",
		width: "none",
		height: "none",
		event: "dblclick"
		}, options || {}));
		if (!getUser()) $(this).editable("disable");
	}




if (typeof console=='undefined')var console={log:function(){}};
$.postJSON = function(url, data, callback) {
	$.ajax({
		type: "POST",
		url: url,
		cache: false,
		data: "json="+JSON.stringify(data),
		success: callback
	});
};

$.fn.Button = function(callback, title) {
	return this.addClass("button").click(callback).text(title);
};

function flashmessage(el, msg) {
	$(el).append(msg.addClass("overlaymessage").hide().fadeIn("fast").animate({dummy: 1}, 1000).fadeOut("slow", function(){
		$(this).remove();
		}));  
}

function makenew(ob) {
	var item = null;
	switch (ob.type) {
		case "vocab": item = new Vocabulary(ob,$("<div/>")); break;
		case "tag": item = new Tag(ob,$("<div/>")); break;
		case "h1": item = new H1(ob,$("<div/>")); break;
		case "paragraph": item = new Paragraph(ob,$("<div/>")); break;
		case "image": item = new Image(ob,$("<div/>")); break;
		case "project": item = new Project(ob,$("<div/>")); break;
		default: item = new Item(ob); break;
	}
	return item;
}

function getUser() {
	if (login && login.data) return login.data; else return false;
}

function closeKeepAlive() {
  $.ajax({
    async: false,
    type: "GET",
    url: "/close"
  });
}