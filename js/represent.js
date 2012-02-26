// requires composite only property, MM.data

MM.represent = (function(){
	
	//### TreeItem ###
	
	var treeItem = function(that){
		var element = MM.property();
		var data = that.data;
		var removeListeners = null;
	
		// private
	
		var render = function(){
			element.set($('#' + data.type.get() + 'Template').tmpl(data.toObj()));
			
			if(data.removeable.get() !== true)
				element.get().find('.delete').hide();
		};
	
		var registerElementListeners = function(){
			var select = falsy(function(){
				MM.data.tree.setSelected(that);
			});
	
			var changeName = falsy(function(event){
				var updateAdapter = function(e){
					data.name.set($(e.target).val());
				};
	
				var input = $(document.createElement('input'))
					.val(data.name.get())
					.blur(updateAdapter)
					.keyup(function(e){ // onEnter
						if(e.which == 13) updateAdapter(e); 
					});
				$(event.target).html(input);
				input.focus();
			});
	
			element.get().children('span').click(select).dblclick(changeName);
			element.get().children('.delete').click(falsy(that, 'remove'));
			element.get().children('.visible').click(falsy(data.visible.toggle));
		};
		
		var registerPropertyListeners = function(){
			return [
			                       
				data.name.addChangeListener(function(value){
					element.get().children('span').text(value);
				}),
			
				that.selected.addChangeListener(function(selected){
					var func = (selected === true ? 'addClass' : 'removeClass');
					element.get().children('span')[func]('selected');
				}),
			
				data.visible.addChangeListener(function(visible){
					var add = (visible === false || data.visible.get() === false);
					element.get().children('.visible').addClass(!add+'').removeClass(add+'');
				})
			
			];
		};
	
		// public
	
		var remove = function(){
			that.selected.get() && MM.data.tree.setSelected(null);
			element.get().remove();
			for(var i = 0; i < removeListeners.length; i++)
				removeListeners[i]();
		};
	
		// constructor
	
		that = combine(that, {
			element: element,
			remove: remove
		});
	
		render();
		registerElementListeners();
		removeListeners = registerPropertyListeners();
	
		return that;
	
	};
	
	//### TreeContainer ###
	
	var treeContainer = function(that){
		var data = that.data;
		var removeListeners = [];
	
		treeItem(that);
	
		// private
	
		var registerElementListeners = function(){
			that.element.get().children('.open').click(falsy(data.open.toggle));
		};

		var registerPropertyListeners = function(){
			return [

    		data.open.addChangeListener(function(open){
    			var func = (open === false ? 'addClass' : 'removeClass');
    			that.element.get().children('.open')[func]('false');
    			that.element.get().children('ul')[func]('hidden');
    		}),
    	
    		data.visible.addChangeListener(function(visible){
    			$.each(data.items.get(), function(index, item){ 
    				item.data.visible.notifyChangeListeners(visible);
    			});
    		})
    		
			];
		};
		
		// public
	
		var append = function(item, index){
			var html = item.element.get();
			if(index === null || index === undefined || index === 0){
				that.element.get().children('ul').append(html);
			}else{
				var old = data.items.get()[index-1];
				old.element.get().after(html);
			}
		};
	
		var remove = function(){
			while(data.items.get().length > 0)
				data.items.get()[0].remove();
			for(var i = 0; i < removeListeners.length; i++)
				removeListeners[i]();
		};
	
		// constructor
	
		data.init({
			open: true
		});
	
		registerElementListeners();
		removeListeners = registerPropertyListeners();
	
		var pub = {
			append: append,
			remove: remove
		};
	
		return combine(that, pub);
	};
	
	//### Marker ###
	
	var marker = function(that, options){
		var marker = MM.property();
		var data = that.data;
		var removeListeners = null;
	
		// private
	
		var render = function(){
			var obj = data.toObj();
	
			var markerOptions = {
				position: new google.maps.LatLng(obj.position.lat, obj.position.lng), 
				map: MM.data.map, 
				title: obj.name
			};
			if(options && options.markerOptions)
				markerOptions = override(markerOptions, options.markerOptions);
	
			marker.set(new google.maps.Marker(markerOptions));
		};
	
		var registerMapListeners = function(){
			google.maps.event.addListener(marker.get(), 'click', function(){
				MM.data.tree.setSelected(that);
			});
		};
		
		var registerPropertyListeners = function(){
			return [

				data.visible.addChangeListener(function(visible){
					marker.get().setMap(visible === true ? MM.data.map : null);
				})
    		
			];
		};
	
		// public
	
		var remove = function(){
			marker.get().setMap(null);
			for(var i = 0; i < removeListeners.length; i++)
				removeListeners[i]();
		};
	
		// constructor
	
		that = combine(that, {
			marker: marker,
			remove: remove
		});
	
		render();
		registerMapListeners();
		removeListeners = registerPropertyListeners();
	
		return that;
	};
	
	//### InfoBox ###
	
	var infoBox = function(that){
		var infoBox = MM.property();
		var data = that.data;
		var removeListeners = null;
		var removeContentListeners = [];
	
		// private
	
		var addChangeListener = function(key){
			var removeFunc = data[key].addChangeListener(function(value){
				if(infoBox.get()){
					var box = $(infoBox.get().getContent());
					box.find('input[placeholder="'+key+'"]').val(value);
				}
			});
			removeContentListeners.push(removeFunc);
		};
	
		var createContent = function(){
			var form = {
				name: data.name.get(), 
				elements: {}
			};
			addChangeListener('name');
	
			for(var key in data)
				if($.inArray(key, ['name', 'type', 'position', 'visible', 'init', 'toObj', 'removeable']) < 0){
					form.elements[key] = data[key].get();
					addChangeListener(key);
				}
	
			var node = $('<div />')
			
			node.addClass('infobox')
				.append($('#infoTemplate').tmpl(form))
				.find('input')
				.change(function(){
					data[$(this).attr('placeholder')].set($(this).val());
				});
	
			return node[0];
		};
	
		var render = function(){
			infoBox.set(new google.maps.InfoWindow({
				content: createContent()
			}));
			infoBox.get().open(MM.data.map, that.marker.get());
		};
	
		var registerMapListeners = function(){
			google.maps.event.addListener(infoBox.get(), 'closeclick', function(){
				infoBox.set(null);
			});
		};
		
		var registerPropertyListeners = function(){
			return [
			        
				that.selected.addChangeListener(function(selected){
					if(selected === true && infoBox.get() === null){
						render();
						registerMapListeners();
					}
				})
				
			];
		};
		
		var remove = function(){
			if(infoBox.get())
				infoBox.get().close();
			for(var i = 0; i < removeContentListeners.length; i++)
				removeContentListeners[i]();
			for(var i = 0; i < removeListeners.length; i++)
				removeListeners[i]();
		};
	
		// constructor
	
		removeListeners = registerPropertyListeners();
	
		that = combine(that, {
			infoBox: infoBox,
			remove: remove
		});
	
		return that;
	};
	
	//### Polyline ###
	
	var polyline = function(that){
		var polyline = MM.property();
		var data = that.data;
		var removeListeners = null;
	
		// private
	
		var render = function(){
			polyline.set(new google.maps.Polyline({
				path: [],
				strokeColor: '#0000FF',
				strokeOpacity: 0.5,
				strokeWeight: 4,
				map: MM.data.map
			}));
		};
		
		var registerPropertyListeners = function(){
			return [
			
				data.visible.addChangeListener(function(visible){
					polyline.get().setMap(visible === true ? MM.data.map : null);
				})
			
			];
		};
	
		// public
	
		var append = function(item, index){
			var pos = item.data.position.get();
			var path = polyline.get().getPath();
			var latLng = new google.maps.LatLng(pos.lat, pos.lng);
			if(index === null || index === undefined)
				path.push(latLng);
			else
				path.insertAt(index, latLng);
		};
	
		var findIndex = function(item){
			var index = null;
			var path = polyline.get().getPath();
			var pos = item.data.position.get();
	
			path.forEach(function(element, i){
				if(element.lat() === pos.lat && element.lng() === pos.lng)
					index = i;
			});
	
			return index;
		};
	
		var onChildRemoved = function(item){
			var index = findIndex(item);
			
			if(index !== null && index !== undefined) 
				polyline.get().getPath().removeAt(index);
			else 
				alert('couldnt remove waypoint');
		};
		
		var remove = function(){
			polyline.get().setMap(null);
			for(var i = 0; i < removeListeners.length; i++)
				removeListeners[i]();
		};
	
		// constructor
	
		that = combine(that, {
			// fields
			polyline: polyline,
			// methods
			append: append,
			remove: remove,
			onChildRemoved: onChildRemoved,
			findIndex: findIndex
		});
	
		render();
		removeListeners = registerPropertyListeners();
	
		return that;
	};

	//### outline ###
	
	return {
		treeContainer: treeContainer,
		treeItem: treeItem,
		marker: marker,
		infoBox: infoBox,
		polyline: polyline
	};

})();
