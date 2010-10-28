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
  
  // The namespace where the methods keywords will be attached to.
  // This will be the window in the context of the browser or exports in Node.
  var namespace = (typeof window !== 'undefined' && window) ||
                  (typeof exports !== 'undefined' && exports) ||
                  this;
  
  // The current scope to define Classes, Modules, and Methods on.
  var currentScope = namespace;
  
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
        if (!isKeywordProperty(method)) {
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
  var addMethods = function(object, methods) {
    if (object == null || methods == null) {
      return;
    }
    
    var oldScope = currentScope;
    currentScope = object;
    
    if (typeof methods === 'function') {
      methods.call(object);
    }
    else {
      for (var name in methods) {
        namespace.def(name, methods[name]);
      }
    }
    
    currentScope = oldScope;
  };
  
  // If necessary add a `callSuper` method to access the superclass's method.
  var addCallSuper = function(definition, superDefinition) {
    if (typeof superDefinition === 'function' &&
        typeof definition === 'function' &&
        callsSuper(definition)) {
          
      return function() {
        var definitionArgs = arguments,
            currentSuper   = this.callSuper;
        
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
  
  // Test to see if the given property is a keyword that shouldn't be added.
  var isKeywordProperty = function(method) {
    return (/\b(prototype|superclass)\b/).test(method);
  };
    
  //----------------------------------
  //  Public Methods
  //----------------------------------
  
  // Creates a new Class. The Class will be defined on the _current scope_, which will
  // be either the `window` or a Module. Optionally you can pass in a Superclass as the first argument.
  namespace.classify = function() {
    var object, definition, superclass;
    
    if (arguments.length === 3) {
      superclass = arguments[0];
      object     = arguments[1];
      definition = arguments[2];
    }
    else {
      object     = arguments[0];
      definition = arguments[1];
    }
    
    if (typeof object === 'string') {
      if (typeof currentScope[object] === 'undefined') {
        currentScope[object] = buildClass(object, superclass);
      }
      object = currentScope[object];
    }
    
    var oldClass = currentClass;
    currentClass = object.prototype;
    addMethods(object, definition);
    currentClass = oldClass;
    
    return object;
  };
  
  // Defines a new method. The method will be defined on the _current scope_, which will
  // be either the `window`, a Class, or Module. Within the method definition, `this` will
  // refer to the _current scope_. Optionally, you can set the object to define the method on as the
  // first argument.
  namespace.def = function() {
    var object, name, definition;
    
    if (arguments.length === 3) {
      object     = arguments[0];
      name       = arguments[1];
      definition = arguments[2];
    }
    else {
      object     = currentClass || currentScope;
      name       = arguments[0];
      definition = arguments[1];
    }

    definition   = addCallSuper(definition, object[name]);
    object[name] = definition;
    
    return object[name];
  };
  
  // Creates a new Module. Modules can be used as namespaces for other Modules
  // and Classes. They can also be used as a collection of method definitions
  // to be included into other Classes.
  namespace.module = function(name, definition) {
    if (typeof currentScope[name] === 'undefined') {
      currentScope[name] = {};
      currentScope[name].toString = function() { return name; };
    }
    
    addMethods(currentScope[name], definition);
    
    return currentScope[name];
  };
  
  // Includes the given Module methods into either the current Class or, optionally, the
  // given Class Definition. The included methods will be available on the instance of the Class.
  namespace.include = function() {
    var object, definition;
    
    if (arguments.length === 2) {
      object     = arguments[0];
      definition = arguments[1];
      
      if (typeof object === 'string') {
        object = currentScope[object];
      }
    }
    else {
      object     = currentClass || currentScope;
      definition = arguments[0];
    }
    
    addMethods(object, definition);
  };
  
  // Extends the current Class or, optionally, the given Class Definition with the given
  // Module methods. The methods wil be available as Class methods.
  namespace.extend = function() {
    var oldClass = currentClass;
    currentClass = null;
    namespace.include.apply(this, arguments);
    currentClass = oldClass;
  };
  
  // Creates a alias for the given Method, Class, or Module definition.
  namespace.alias = function(alias, method) {
    var object = currentClass || currentScope;
    object[alias] = object[method];
  };

})();
