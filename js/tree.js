// requires represent, composite

MM.tree = (function(){
	
	//#### Builder ####
	
	var build = function(obj, parent){
		if(obj.type === undefined)
			return null;
		
		var cons = functions[obj.type];
		if(cons === undefined)
			return null;
		
		var element = cons(obj);
		element.appendTo(parent);
		return element;
	};
	
	//#### Tree ####
	
	var tree = function(id, data){
		var root = null;
		var selected = null;
	
		// public
	
		var append = function(item){
			if(root === null)
				root = item;
			$('#'+id).append(item.element.get());
		};
	
		var setSelected = function(item){
			if(item === selected)
				return;
			
			selected && selected.selected.set(false);
			selected = item;
			item && item.selected.set(true);
		};
	
		var getSelected = function(){
			return selected || root;
		};
	
		var getRoot = function(){
			return root;
		};
	
		var findParentLayer = function(){
			var candidate = getSelected();
			while(candidate.data.type.get() !== 'layer')
				candidate = candidate.parent.get();
			return candidate;
		};
	
		var noop = function(){};
	
		var that = {
			append: append,
			setSelected: setSelected,
			getSelected: getSelected,
			getRoot: getRoot,
			findParentLayer: findParentLayer,
			onChildRemoved: noop
		};
	
		build(data, that);
		return that;
	}
	
	//#### Marker ####
	
	var marker = function(obj){
		var that = MM.component();
	
		that.data.init(merge({
			type: 'marker'
		}, obj));
	
		// constructor
	
		MM.represent.treeItem(that);
		MM.represent.marker(that);
		MM.represent.infoBox(that);
	
		return that;
	};
	
	//#### Layer ####
	
	var layer = function(obj){
		var that = MM.container();
		var data = that.data;
	
		var items = obj.items || [];
		delete obj.items; // if there were any
	
		data.init(merge({
			type: 'layer',
			open: true
		}, obj));
	
		// constructor
	
		MM.represent.treeContainer(that);
	
		$.each(items, function(index, item){
			build(item, that);
		});
	
		return that;
	};
	
	//#### Waypoint ####
	
	var waypoint = function(obj){
		var that = MM.component();
	
		that.data.init(merge({
			type: 'waypoint'
		}, obj));
	
		// constructor
	
		MM.represent.treeItem(that);
	
		var markerOptions = {
			icon: new google.maps.MarkerImage(
				'images/dot.png',
				new google.maps.Size(11, 11),
				new google.maps.Point(0, 0), // origin
				new google.maps.Point(6, 6) // anchor
			) 
		};
		MM.represent.marker(that, { markerOptions: markerOptions });
	
		return that;
	};
	
	//#### Polyline ####
	
	var polyline = function(obj){
		var that = MM.container();
		var data = that.data;
	
		var items = obj.items || [];
		delete obj.items; // if there were any
	
		data.init(merge({
			type: 'polyline',
			open: true
		}, obj));
	
		// constructor
	
		MM.represent.treeContainer(that);
		MM.represent.polyline(that);
	
		$.each(items, function(index, item){
			build(item, that);
		});
	
		return that;
	};
	
	//### outline ###
	
	var functions = {
		tree: tree,
		marker: marker,
		layer: layer,
		waypoint: waypoint,
		polyline: polyline
	};
	
	return functions;
	
})();