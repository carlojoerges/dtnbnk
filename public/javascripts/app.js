
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
	login = new Login($("<div />").appendTo($("#col2")));
}