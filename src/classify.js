//--------------------------------------------------------------------------
//
//  Classify.js, version 0.9.1
//
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
  var buildClass = function(superclass) {
    var newClass = function() {
      if (!inheriting && typeof this.initialize !== 'undefined') {
        this.initialize.apply(this, arguments);
      }
    };
    
    if (superclass) {
      inheriting = true;
      newClass.prototype = new superclass();
      for (var method in superclass) {
        if (!isKeywordProperty(method)) {
          namespace.def(newClass, method, superclass[method]);
        }
      }
      inheriting = false;
    }
    
    newClass.superclass  = superclass;
    newClass.constructor = newClass;
    
    return newClass;
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
  var addSuperMethod = function(name, definition) {
    var superclass = currentClass !== null &&
      typeof currentClass.superclass !== 'undefined' &&
      currentClass.superclass.prototype;
    
    if (superclass &&
      typeof definition === 'function' &&
      typeof superclass[name] === 'function' &&
      callsSuper(definition)) {
      
      return function() {
        var definitionArgs = arguments,
            currentSuper   = this.callSuper;
        
        this.callSuper = function() {
          var superArgs = (arguments.length > 0) ? arguments : definitionArgs;
          return superclass[name].apply(this, superArgs);
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
    return (/\b(prototype|superclass|constructor)\b/).test(method);
  };
    
  //----------------------------------
  //  Public Methods
  //----------------------------------
  
  // Creates a new Class. The Class will be defined on the _current scope_, which will
  // be either the `window` or a Module. Optionally you can pass in a Superclass as the first argument.
  namespace.classify = function() {
    var name, definition, superclass, klass;
    
    if (arguments.length === 3) {
      superclass = arguments[0];
      name       = arguments[1];
      definition = arguments[2];
    }
    else {
      name       = arguments[0];
      definition = arguments[1];
    }
    
    if (typeof name === 'string') {
      if (typeof currentScope[name] === 'undefined') {
        currentScope[name] = buildClass(superclass);
      }
      klass = currentScope[name];
    }
    else {
      klass = name;
    }
    
    currentClass = klass;
    addMethods(klass.prototype, definition);
    currentClass = null;
    
    return klass;
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
      object     = currentScope;
      name       = arguments[0];
      definition = arguments[1];
    }
    
    definition   = addSuperMethod(name, definition);
    object[name] = definition;
    
    return object[name];
  };
  
  // Creates a new Module. Modules can be used as namespaces for other Modules
  // and Classes. They can also be used as a collection of method definitions
  // to be included into other Classes.
  namespace.module = function(name, definition) {
    if (typeof currentScope[name] === 'undefined') {
      currentScope[name] = {};
    }
    
    addMethods(currentScope[name], definition);
    
    return definition;
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
    
    if (typeof object.prototype !== 'undefined') {
      object = object.prototype;
    }
    
    addMethods(object, definition);
  };
  
  // Extends the current Class or, optionally, the given Class Definition with the given
  // Module methods. The methods wil be available as Class methods.
  namespace.extend = function() {
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
  
  // Creates a alias for the given Method, Class, or Module definition.
  namespace.alias = function(alias, method) {
    currentScope[alias] = currentScope[method];
  };

})();
