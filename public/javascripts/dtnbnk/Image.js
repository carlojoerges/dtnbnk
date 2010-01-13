Image = ContentItem.extend({
	init: function(data, element) {
		this.__super__(data, element);
		this.data = $.extend({
			type: "image",
			name: ""
		}, data || {});
		this.element.addClass("image");
		var father = this;
    $("<form id='upload' action='/upload' enctype='multipart/form-data' method='post'><input type='file' class='multi' name='userfile[]' /><input type='submit' value='Submit' /></form>").appendTo(this.editElement);
		
		$("form",father.element).submit(function() {
      $(this).ajaxSubmit({ 
          data: {id: father.data.id},
          url:        '/upload', 
          beforeSubmit: function(form, jqobj, opts) {
            return true;
          },
          success: function(resp) { 
            respObj = JSON.parse(resp);
        		father.data = respObj;
        		father.refresh();
      }});
			return false;
		});
		
		para = $.nano.html("/templates/_image.html", data, {callback: function(el) {
			if (el.attr("src") == "undefined") el.hide();
		}});
		this.element.append(para);
		$("<img src='/images/picol_prerelease_16_090307/badge_cancel_16.png' class='delete' />").appendTo(this.editElement).click(function() {
			father.remove();
		});
		$("<img src='/images/picol_prerelease_16_090307/badge_eject_16.png' class='sort' />").appendTo(this.editElement);
		
	},
	refresh: function() {
	  $("> img",this.element).attr("src",this.data.file).show();
	}
	
})
