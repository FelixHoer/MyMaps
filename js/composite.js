
//### Component ###

MM.component = function(){
  var parent = MM.property();
  var selected = MM.property();
  var data = MM.properties({
    type: null,
    name: 'unspecified',
    visible: true,
    removeable: true
  });

  var appendTo = function(par, position){
    parent.set(par);
    parent.get().append(that, position);
  };

  var remove = function(){
    parent.get().onChildRemoved(that);
  };

  var that = {
      // fields
      parent: parent,
      data: data,
      selected: selected,
      // methods
      appendTo: appendTo,
      remove: remove
  };

  return that;
};

//### Container ###

MM.container = function(){
  var that = MM.component();
  var data = that.data;

  data.init({
    items: []
  });

  // public

  var append = function(item, position){
    if(position === null || position === undefined)
      data.items.get().push(item);
    else
      data.items.get().splice(position, 0, item);
  };

  var onChildRemoved = function(item){
    var index = $.inArray(item, data.items.get());
    if(index >= 0)
      data.items.get().splice(index, 1);
  };

  var pub = {
    append: append,
    onChildRemoved: onChildRemoved
  };

  return combine(that, pub);
};

//### Property ###

MM.property = function(initValue, changeListeners){
  var value = initValue || null;
  var listeners = changeListeners || [];

  // public

  var get = function(){
    return value;
  };

  var set = function(val){
    value = val;
    notifyChangeListeners(val);
  };

  var toggle = function(){
    set(!get());
  };

  var notifyChangeListeners = function(val){
    for(var i = 0; i < listeners.length; i++)
      listeners[i](val);
  };

  var addChangeListener = function(listener){
    listeners.push(listener);
    return function(){
      removeChangeListener(listener);
    };
  };

  var removeChangeListener = function(listener){
    for(var i = 0; i < listeners.length; )
      if(listener === listeners[i])
        listeners.splice(i, 1);
      else
        i++;
  };

  return {
    get: get,
    set: set,
    toggle: toggle,
    notifyChangeListeners: notifyChangeListeners,
    addChangeListener: addChangeListener,
    removeChangeListener: removeChangeListener
  };
};

//### Properties ###

MM.properties = function(inits){

  var init = function(inits){
    for(var key in inits)
      if(that[key] === undefined)
        that[key] = MM.property(inits[key]);
      else
        that[key].set(inits[key]); 
  };

  var toObj = function(){
    var obj = {};
    for(var key in that)
      if(typeof that[key] !== 'function'){
        var item = that[key].get()
        if(key === 'items'){
          var items = [];
          for(var i = 0; i < item.length; i++)
            items.push(item[i].data.toObj());
          obj[key] = items;
        }else{
          obj[key] = item;
        }
      }
    return obj;
  };

  var that = {
    init: init,
    toObj: toObj
    // + propertyName: property
  };
  
  inits && init(inits);

  return that;
};
