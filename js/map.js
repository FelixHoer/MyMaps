
var MM = (function(){
	
	var setup = function(json, options){
		var data = MM.data = {};

		var mapOptions = defaults(options, {
			zoom: 13,
			center: new google.maps.LatLng(47.079475, 15.439224), // Graz
			disableDefaultUI: true,
			mapTypeControl: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		data.map = new google.maps.Map(document.getElementById('map'), mapOptions);
		
		data.tree = MM.tree.tree('tree', json);
		
		data.actionManager = MM.action.manager();

		return data;
	};
	
	return {
		setup: setup
	};
	
})();

MM.createJSONExport = function(){
	var createJSON = function(){
		var json = JSON.stringify(MM.data.tree.getRoot().data.toObj());
		json = json.replace(/(\[|\{)/g, '$1\n');
		json = json.replace(/(\]|\})/g, '\n$1');
		json = json.replace(/,"/g, ',\n"');
		return json;
	};
	
	var displayJSON = function(json){
		var element = $('#jsonTemplate').tmpl({ json: json }).dialog({
			dialogClass: 'json-modal',
			width: 400, 
			height: 400,
			modal: true,
			resizable: false,
			position: ['center', 'center'],
			title: 'JSON-Data',
			buttons: {
				Ok: function() {
					$(this).dialog('destroy');
					element.remove();
				}
			}
		});
	};
	
	$('<a></a>')
		.attr('href', '#')
		.addClass('save')
		.appendTo('.ui-dialog-titlebar')
		.click(function(){
			var json = createJSON();
			displayJSON(json);
			return false;
		});
};

$(function(){

	$('#bar').dialog({
		dialogClass: 'sidebar', 
		title: 'Layers', 
		position: ['left', 'center'],
		width: 220, 
		height: 400
	});

	MM.setup(data, {});
	
	MM.createJSONExport();
	
});
