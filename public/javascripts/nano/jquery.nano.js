/* Nano Templates (Tomasz Mazur, Jacek Becela) */

(function($){
  $.nano = function(template, data){
    return template.replace(/\{([\w\.]*)}/g, function(str, key){
      var keys = key.split("."), value = data[keys.shift()]
      $.each(keys, function(){ value = value[this] })
      return value
    })
  }
  $.fn.nano = function(data){
    return this.html($.nano(this.html(), data));
  }
  $.extend($.nano, {
    cache: {},
    queue: {},
    callback: null,
    html: function(url, data, options) {
      if ($.nano.cache[url]) {
		
		el = $($.nano($.nano.cache[url], data));
		console.log(el);
		if (options.callback) options.callback(el);
		return el;
	  }
      var guid = (((1+Math.random())*0x10000)|0).toString(16);
      var options = $.extend(true, {guid: guid, data: data, element: "div"}, options);
      if ($.nano.queue[url]) {
        $.nano.queue[url].push(options);
      } else {
        $.nano.queue[url] = [options];
        $.get(url, function(html, textStatus) {
          
          $.nano.cache[url] = html;
          $.each($.nano.queue[url], function(i, row){
            el = $($.nano(html, row.data));
			$("#nano-"+row.guid).replaceWith(el);
			if (row.callback) row.callback(el);
          });
        }, "html");
      }
      return $.nano('<{element} id="nano-{guid}"/>', options);
    }
  });
})(jQuery)