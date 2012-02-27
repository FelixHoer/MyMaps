//add all items from std to "obj", which are not already defined there
var merge = function(std, obj){
  obj = obj || {};

  for(var key in std)
    if(!(key in obj))
      obj[key] = std[key];
  return obj;
};

var defaults = function(obj, def){
  return merge(def, obj);
};

//copy all items from "nu" to "obj", possibly overriding
var override = function(obj, nu){
  obj = obj || {};

  for(var key in nu)
    obj[key] = nu[key];
  return obj;
};
var extend = override;

var combine = (function(){
  
  var chain = function(oldf, newf){
    return function(){
      newf.apply(null, arguments);
      oldf.apply(null, arguments);
    };
  };

  var isFunction = function(f){
    return f && typeof f === "function";
  };
  
  return function(obj, sec){
    obj = obj || {};

    for(var key in sec)
      if(isFunction(obj[key]) && isFunction(sec[key]))
        obj[key] = chain(obj[key], sec[key]);
      else
        obj[key] = sec[key];

    return obj;
  };
  
})();

var falsy = function(){
  var chain = arguments;
  return function(){
    var func = chain[0];
    for(var i = 1; i < chain.length; i++)
      func = func[chain[i]];

    func.apply(this, arguments);
    return false;
  };
};
