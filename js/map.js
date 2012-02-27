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
      
      $('#save-json a').click(function(){
        displayJSON(createJSON());
        return false;
      });
      
      // not supported by IE 6 + 7
      if($.browser.msie && $.browser.version.charAt(0) < 8){
        $('#save-download').css({backgroundColor: '#fdd'});
        $('#save-download a')
          .html('Download JSON is <b>not supported</b> by IE')
          .click(function() {
            return false;
          });
        return;
      }
      
      $('#save-download a').click(function(){
        var uri = 'data:application/octet-stream,' + encodeURIComponent(createJSON());
        var newWindow = window.open(uri);
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
    /*
      the callback expects a layer object as only parameter
    
      component: is abstract
        type: predefined string (layer | marker | polyline | ...)
        name: string
        visible: boolean (if undefined assumed true)
      
      layer: is a component
        items: component[]
        open: boolean
      
      marker: is a component
        position: position
        address: string (optional)
      
      polyline: is a component
        items: waypoint[]
      
      waypoint: is a component
        position: position
    
      position:
        lat: num
        lng: num
    */
    
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
    
    $('#load-new a').click(function(){
      var empty = {
        type: 'layer',
        name: 'root',
        items: [],
        removeable: false
      };
      onComplete(empty);
    });
    
    $('#load-json a').click(function(){
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
    
    if($.browser.msie){
      $('#load-upload').css({backgroundColor: '#fdd'});
      $('#load-upload input').remove();
      $('#load-upload a').html('Upload JSON is <b>not supported</b> by IE');
      return;
    }
    
    // chrome: File-API only works when served by web-server
    $('#load-upload input').change(function(evt){
      if(!window.File || !window.FileReader || !window.FileList){
        alert('Error: The File-API is not supported by your browser!');
        return;
      }
      
      if(!evt || !evt.target || !evt.target.files){
        alert('Error: No File was selected or your browser does not support the File-API.');
        return;
      }
      
      var files = evt.target.files;
      if(files.length !== 1){
        alert('Please select a previously generated JSON-File');
        return;
      }
      
      var file = files[0];
      var reader = new FileReader();
      
      reader.onerror = function(e){
        alert('Error: Can not read selected file.');
      };
      
      reader.onload = function(e){
        try{
          var json = JSON.parse(e.target.result);
          onComplete(json);
        }catch(err){
          alert('the entered data was not valid: ' + err);
        }
      };
      
      reader.readAsText(file);
    });
  };
  
  return {
    setup: setup
  };
  
})();

$(MM.setup);
