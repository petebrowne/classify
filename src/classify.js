//--------------------------------------------------------------------------
//
//  Classify.js, {{ version }}
//  Copyright (c) 2010, Peter Browne
//
//--------------------------------------------------------------------------

(function() {
  
  //----------------------------------
  //  Internal Properties
  //----------------------------------
  
  // The namespace where the keyword methods will be attached to.
  var namespace = (typeof window !== 'undefined' && window) || this;
  
  // The current scope to define Classes, Modules, and Methods on.
  var currentObject = namespace;
  
  // The current Class to define Methods on.
  var currentClass = null;
  
  // Flag to signal when we are initializing a superclass during inheritance
  var inheriting = false;
  
  //----------------------------------
  //  Internal Methods
  //----------------------------------
    
  // Builds a new Class, with optional inheritance.
  var buildClass = function(name, superclass) {
    var Class = function() {
      if (!inheriting && typeof this.initialize !== 'undefined') {
        this.initialize.apply(this, arguments);
      }
    };
    
    if (superclass != null) {
      inheriting = true;
      Class.prototype = new superclass();
      for (var method in superclass) {
        if (typeof superclass[method] === 'function') {
          namespace.def(Class, method, superclass[method]);
        }
      }
      inheriting = false;
    }
    
    Class.superclass = superclass;
    Class.prototype.constructor = Class;
    Class.toString = function() { return name; };
    
    return Class;
  };
  
  // Add the given methods to the object.
  var addDefinition = function(withClass, withObject, definition) {
    if (withObject == null || definition == null) {
      return;
    }
    
    var oldClass  = currentClass;
    var oldObject = currentObject;
    
    currentClass  = withClass;
    currentObject = withObject;
    
    if (typeof definition === 'function') {
      definition.call(withObject);
    }
    else {
      for (var name in definition) {
        namespace.def(name, definition[name]);
      }
    }
    
    currentClass  = oldClass;
    currentObject = oldObject;
  };
  
  // If necessary add a `callSuper` method to access the superclass's method.
  var addCallSuper = function(definition, superDefinition) {
    if (typeof superDefinition === 'function' &&
        typeof definition === 'function' &&
        callsSuper(definition)) {
          
      return function() {
        var definitionArgs = arguments;
        var currentSuper   = this.callSuper;
        
        this.callSuper = function() {
          var superArgs = (arguments.length > 0) ? arguments : definitionArgs;
          return superDefinition.apply(this, superArgs);
        };
        
        var result = definition.apply(this, definitionArgs);       
        this.callSuper = currentSuper;
        
        return result;
      };
    }
    
    return definition;
  };
  
  // Test to see if a function contains a call to `callSuper`
  var callsSuper = function(method) {
    return (/\bcallSuper\b/).test(method.toString());
  };
    
  //----------------------------------
  //  Public Methods
  //----------------------------------
  
  // Creates a new Class. The Class will be defined on the _current scope_, which will
  // be either the `window` or a Module. Optionally you can pass in a Superclass as the first argument.
  namespace.classify = function(superclass, object, definition) {
    if (typeof definition === 'undefined') {
      definition = object;
      object     = superclass;
      superclass = null;
    }
    
    if (typeof object === 'string') {
      if (typeof currentObject[object] === 'undefined') {
        currentObject[object] = buildClass(object, superclass);
      }
      object = currentObject[object];
    }
    
    addDefinition(object.prototype, object, definition);
    
    return object;
  };
  
  // Defines a new method. The method will be defined on the _current scope_, which will
  // be either the `window`, a Class, or Module. Within the method definition, `this` will
  // refer to the _current scope_. Optionally, you can set the object to define the method on as the
  // first argument.
  namespace.def = function(object, name, definition) {
    if (typeof definition === 'undefined') {
      definition = name;
      name       = object;
      object     = currentClass || currentObject;
    }

    object[name] = addCallSuper(definition, object[name]);
    
    return object[name];
  };
  
  // Creates a new Module. Modules can be used as namespaces for other Modules
  // and Classes. They can also be used as a collection of method definitions
  // to be included into other Classes.
  namespace.module = function(name, definition) {
    if (typeof currentObject[name] === 'undefined') {
      currentObject[name] = {};
      currentObject[name].toString = function() { return name; };
    }
    
    addDefinition(null, currentObject[name], definition);
    
    return currentObject[name];
  };
  
  // Includes the given Module methods into either the current Class or, optionally, the
  // given Class Definition. The included methods will be available on the instance of the Class.
  namespace.include = function(object, definition) {
    if (typeof definition === 'undefined') {
      definition = object;
      object     = currentClass || currentObject;
    }
    else if (typeof object === 'string') {
      object = currentObject[object];
    }
    
    addDefinition(currentClass, object, definition);
  };
  
  // Extends the current Class or, optionally, the given Class Definition with the given
  // Module methods. The methods wil be available as Class methods.
  namespace.extend = function(object, definition) {
    if (typeof definition === 'undefined') {
      definition = object;
      object     = currentObject;
    }
    else if (typeof object === 'string') {
      object = currentObject[object];
    }
    
    addDefinition(null, object, definition);
  };
  
  // Creates a alias for the given Method, Class, or Module definition.
  namespace.alias = function(alias, method) {
    var object = currentClass || currentObject;
    
    object[alias] = object[method];
  };

})();
