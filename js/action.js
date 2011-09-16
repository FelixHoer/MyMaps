// requires MM.tree, MM.data

MM.action = (function(){
	
	//################################## MANAGER #################################
	
	//## ActionManager ##
	
	var manager = function(){
		var action = null;
	
		// public
	
		var setAction = function(nextAction){
			if(action === nextAction){
				setAction(null); // reset
				return;
			}
			
			if(action){
				action.button.removeClass('selected');
				action.disable();
			}

			action = nextAction;

			if(action){
				action.button.addClass('selected');
				action.enable();
			}
		};
	
		// constructor
	
		var buttonset = $('#buttonset');
		var actionNames = ['marker', 'layer', 'polyline'];
		for(var i = 0; i < actionNames.length; i++){
			var key = actionNames[i];
			var action = actions[key]();
			
			action.button = $('#actionTemplate').tmpl({name: key})
				.appendTo(buttonset)
				.button({
					icons: {primary: key+'-icon'}, 
					text: false
				})
				.click(
					(function(action){
						return function(){
							setAction(action);
							return false;
						};
					})(action)
				);
		}
		buttonset.buttonset();
	
		return {
			setAction: setAction
		};
	};
	
	//################################## ACTIONS #################################

	var actions = (function(){
		
		//### PolylineAction ###
	
		var polyline = function(){   
		
			// private
		
			var findOrCreateSelected = function(){
				var selected = MM.data.tree.getSelected();
				if(!selected || (selected.data.type.get() !== 'polyline' && 
						selected.data.type.get() !== 'waypoint')){
					selected = MM.tree.polyline({name: 'new polyline'});
					selected.appendTo(MM.data.tree.findParentLayer());
					MM.data.tree.setSelected(selected);
				}
				return selected;
			};
		
			// public
		
			var cursorPart = helpers.cursor('waypoint');
		
			var firstSelectionPart = (function(){
				var noop = function(){};
		
				return {
					enable: findOrCreateSelected,
					disable: noop
				};
			})();
		
			var listenerPart = helpers.mapListener({
				click: function(event) {
					var selected = findOrCreateSelected();
		
					var parent, position;
					if(selected.data.type.get() === 'polyline'){
						parent = selected;
						position = undefined;
					}else{
						parent = selected.parent.get();
						position = parent.findIndex(selected) + 1;
					}
		
					selected = MM.tree.waypoint({
						position: {lat: event.latLng.lat(), lng: event.latLng.lng()}
					});
					selected.appendTo(parent, position);
					MM.data.tree.setSelected(selected);
				}
			});
		
			return helpers.compose([cursorPart, firstSelectionPart, listenerPart]);
		};
		
		//### MarkerAction ###
		
		var marker = function(){    
			var cursorPart = helpers.cursor('marker');
		
			var listenerPart = helpers.mapListener({
				click: function(event) {
					MM.tree.marker({
						name: 'new marker',
						position: {lat: event.latLng.lat(), lng: event.latLng.lng()}
					}).appendTo(MM.data.tree.findParentLayer());
				}
			});
		
			return helpers.compose([cursorPart, listenerPart]);
		};
		
		//### LayerAction ###
		
		var layer = function(){    
			var createLayer = function(){
				var item = MM.tree.layer({name: 'new layer'});
				item.appendTo(MM.data.tree.findParentLayer());
				MM.data.tree.setSelected(item);
				MM.data.actionManager.setAction(null);
			};
			var noop = function(){};
		
			return {
				enable: createLayer,
				disable: noop
			};
		};
		
		//### outline ###
		
		return {
			marker: marker,
			layer: layer,
			polyline: polyline
		};
		
	})();
	
	//################################# HELPERS ##################################
	
	var helpers = (function(){
	
		//### CompositeAction ###
		
		var compose = function(parts){
			var allParts = function(funcName){
				return function(){
					for(var i = 0; i < parts.length; i++)
						parts[i][funcName]();
				};
			};
		
			return {
				enable: allParts('enable'),
				disable: allParts('disable')
			};
		};
		
		//### MapListenerAction ###
		
		var mapListener = function(obj){
			var listeners = null;
		
			// public
		
			var createListeners = function(){
				listeners = [];
				for(var key in obj)
					listeners.push(google.maps.event.addListener(MM.data.map, key, obj[key]));
			};
			var removeListeners = function(){
				if(listeners !== null)
					for(var i = 0; i < listeners.length; i++)
						google.maps.event.removeListener(listeners[i]);
				listeners = null;
			};
		
			return {
				enable: createListeners,
				disable: removeListeners
			};
		};
		
		//### CursorAction ###
		
		var cursor = function(type){
			var cursor = null;
		
			// public
		
			var cursorPart = (function(){
				var createCursor = function(){
					cursor =  $(document.createElement('div'))
						.addClass(type + '-cursor')
						.addClass('hidden')
						.appendTo('#map');
				};
				var removeCursor = function(){
					if(cursor !== null)
						cursor.remove();
					cursor = null; 
				};
		
				return {
					enable: createCursor,
					disable: removeCursor
				};
			})();
		
			var listenerPart = mapListener({
				mousemove: function(event) {
					cursor.css({ top: event.pixel.y + 'px', left: event.pixel.x + 'px' });
				},
				mouseover: function(event) {
					cursor.removeClass('hidden');
				},
				mouseout: function(event) {
					cursor.addClass('hidden');
				}
			});
		
			return compose([cursorPart, listenerPart]);
		};
		
		//### outline ###
		
		return {
			compose: compose,
			mapListener: mapListener,
			cursor: cursor
		};
		
	})();
	
	//### outline ###
	
	return {
		manager: manager
	};

})();