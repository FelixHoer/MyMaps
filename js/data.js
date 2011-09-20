/*
	
	data = layer

	component: is abstrace
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

var data = {
  type: 'layer',
  name: 'root',
  items: [],
  removeable: false
};
