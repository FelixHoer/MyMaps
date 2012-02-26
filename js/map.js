
// TODO upload: check if possible (html5)
// TODO download: check if download is possible

var MM = (function(){
  
  var setup = function(){
    var data = MM.data = {};

    setupMap(data);
    
    loadData(function(json){
      setupBar(data, json);
    });

    return data;
  };
	
	var setupMap = function(data, options){
		var mapOptions = defaults(options || {}, {
			zoom: 13,
			center: new google.maps.LatLng(47.079475, 15.439224), // Graz
			disableDefaultUI: true,
			mapTypeControl: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		data.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	};
	
	var setupBar = function(data, json){
		$('#barTemplate').tmpl().dialog({
			dialogClass: 'sidebar', 
			title: 'Layers', 
			position: ['left', 'center'],
			width: 220, 
			height: 400
		});
		
		createJSONExport();
		
		data.tree = MM.tree.tree('tree', json);
		data.actionManager = MM.action.manager();
	};
	
	var createJSONExport = function(){
		
		var displaySaveDialog = function(){
		  
	    var createJSON = function(){
	      var json = JSON.stringify(MM.data.tree.getRoot().data.toObj());
	      json = json.replace(/(\[|\{)/g, '$1\n');
	      json = json.replace(/(\]|\})/g, '\n$1');
	      json = json.replace(/,"/g, ',\n"');
	      return json;
	    };
	    
	    var displayJSON = function(json){
	      $('#jsonExportTemplate').tmpl({ json: json }).dialog({
	        dialogClass: 'json-modal',
	        width: 400, 
	        modal: true,
	        resizable: false,
	        title: 'JSON-Data',
	        buttons: {
	          Ok: function() {
	            $(this).dialog('destroy');
	            $(this).remove();
	            closeSaveDialog();
	          }
	        }
	      });
	    };
	    
	    var closeSaveDialog = function(){
	      $(saveDialog).dialog('destroy');
        $(saveDialog).remove();
	    };
	    
		  var saveDialog = $('#saveTemplate').tmpl().dialog({
	      title: 'Save Map', 
	      width: 400, 
	      height: 250,
	      modal: true,
	      resizable: false,
        buttons: {
          Cancel: closeSaveDialog
        }
	    });
		  
		  $('#save-json').click(function(){
        displayJSON(createJSON());
        return false;
      });
		  
		  $('#save-download').click(function(){
        var uri = 'data:application/octet-stream,' + encodeURIComponent(createJSON());
        var newWindow = window.open(uri);
        newWindow.close();
        closeSaveDialog();
        return false;
      });
		};
    
    var saveButton = $('<a>Save</a>')
      .attr('href', '#')
      .addClass('save')
      .click(function(){
        displaySaveDialog();
        return false;
      });
		
		$('#bar').parent().find('.ui-dialog-titlebar').append(saveButton);
	};
	
	var loadData = function(callback){
	  
		var loadDialog = $('#loadTemplate').tmpl().dialog({
			title: 'MyMaps', 
			width: 400, 
			height: 250,
			modal: true
		});
		
		var onComplete = function(data){
			callback(data);
			
			loadDialog.dialog('destroy');
			loadDialog.remove();
		};
		
		$('#load-new').click(function(){
			var empty = {
			  type: 'layer',
			  name: 'root',
			  items: [],
			  removeable: false
			};
			onComplete(empty);
		});
		
		$('#load-json').click(function(){
			var remove = function(){
				$(this).dialog('destroy');
				$(this).remove();
			};
			
			var loadJSON = function() {
				try{
					var json = JSON.parse($(this).find('textarea').val());
					onComplete(json);
				}catch(err){
					alert('the entered data was not valid: ' + err);
				}
				remove.call(this);
			};
			
			$('#jsonImportTemplate').tmpl().dialog({
				dialogClass: 'json-modal',
				width: 400, 
				modal: true,
				resizable: false,
				title: 'JSON-Data',
				buttons: {
					Load: loadJSON,
					Cancel: remove
				}
			});
			
		});
		
		$('#load-file').change(function(evt){
			var files = evt.target.files;
			if(files.length !== 1){
				alert('Please select one previously generated JSON-File');
				return;
			}
			var file = files[0];
			var reader = new FileReader();
			reader.onerror = function(e){
				alert('Error: Can not read selected file.');
			};
			reader.onload = function(e){
				console.log(e);
				console.log(e.target.result);
			};
			reader.readAsText(file);
		});
	};
	
	return {
		setup: setup
	};
	
})();

$(MM.setup);
