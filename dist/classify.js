//--------------------------------------------------------------------------
//
//  Classify.js, version 0.7.0
//
//  Copyright (c) 2010, Peter Browne
//
//--------------------------------------------------------------------------

(function(window, undefined) {
  
//----------------------------------
//  Internal Properties
//----------------------------------

// The namespace where the methods keywords will be attached to
var namespace = window,

  // The current scope to define Classes, Modules, and Methods on.
  currentScope = window,
  
  // The current Class to define Methods on.
  currentClass = null,
  
  // Flag to signal when we are initializing a superclass during inheritance
  inheriting = false;
  
//----------------------------------
//  Public Methods
//----------------------------------

/**
 * classify([superclass][, name][, definition]) -> Class
 *   - superclass (Class): Optional superclass to inherit from.
 *   - name (String): Name of the Class.
 *   - definition (Function): The Class definition, containing method definitions.
 *
 * Creates a new Class. The Class will be defined on the _current scope_, will will
 * be either the `window` or a Module. Optionally you can pass in a Superclass as the first argument.
 */
namespace.classify = function(superclassOrName, definitionOrName, definition) {
  var superclass, object, name;
  
  if (definition === undefined) {
    name       = superclassOrName;
    definition = definitionOrName;
  }
  else {
    superclass = superclassOrName;
    name       = definitionOrName;
  }
  
  if (currentScope[name] === undefined) {
    currentScope[name] = buildClass(superclass);
  }
  
  currentClass = currentScope[name];
  addMethods(currentClass.prototype, definition);
  currentClass = null;
  
  return currentScope[name];
};

/**
 * def([object][, name][, definition]) -> Function
 *   - object (Object): Optional object to define the method on. Defaults to the current scope.
 *   - name (String): Name of the Method.
 *   - definition (Function): The Method Definition.
 *
 * Defines a new method. The method will be defined on the _current scope_, which will
 * be either the `window`, a Class, or Module. Within the method definition, `this` will
 * refer to the _current scope_. Optionally, you can set the object to define the method on as the
 * first argument.
 */
namespace.def = function(objectOrName, definitionOrName, definition) {
  var object, name;
  
  if (definition === undefined) {
    object     = currentScope;
    name       = objectOrName;
    definition = definitionOrName;
  }
  else {
    object = objectOrName;
    name   = definitionOrName;
  }
  
  definition   = addSuperMethod(name, definition);
  object[name] = definition;
  
  return object[name];
};

/**
 * module(name, definition) -> Module
 *   - name (String): Name of the Module.
 *   - definition (Function): The Module Definition.
 *
 * Creates a new Module. Modules can be used as namespaces for other Modules
 * and Classes. They can also be used as a collection of method definitions
 * to be included into other Classes.
 */
namespace.module = function(name, definition) {
  if (currentScope[name] === undefined) {
    currentScope[name] = {};
  }
  
  addMethods(currentScope[name], definition);
  
  return definition;
};

/**
 * include([name][, module]) -> null
 *   - name (String): The name of the defintion to include the Module into.
 *   - module (Module or Object): The Module (or Object) to add to the current object scope.
 *
 * Includes the given Module methods into either the current Class or, optionally, the
 * given Class Definition. The included methods will be available on the instance of the Class.
 */
namespace.include = function(moduleOrName, module) {
  var object, name;
  
  if (module === undefined) {
    module = moduleOrName;
    object = (currentClass) ? currentClass.prototype : currentScope;
  }
  else {
    name = moduleOrName;
    object = currentScope[name];
    
    if (object.prototype) {
      object = object.prototype;
    }
  }
  
  addMethods(object, module);
};

/**
 * extend([name][, module]) -> null
 *   - name (String): The name of the defintion to extend with the Module.
 *   - module (Module or Object): The Module (or Object) to add to the current object scope.
 *
 * Extends the current Class or, optionally, the given Class Definition with the given
 * Module methods. The methods wil be available as Class methods.
 */
namespace.extend = function(nameOrModule, module) {
  var object, name;
  
  if (module === undefined) {
    if (currentClass !== null) {
      module = nameOrModule;
      object = currentClass;
    }
  }
  else {
    name   = nameOrModule;
    object = currentScope[name];
  }
  
  addMethods(object, module);
};

/**
 * alias(aliasName, name) -> null
 *   - aliasName (String): The name of the alias
 *   - name (String): The name of the definition to alias. Could be
 *       a reference to a Method, Class, or Module.
 *
 * Creates a alias for the given Method, Class, or Module definition.
 */
namespace.alias = function(aliasName, name) {
  currentScope[aliasName] = currentScope[name];
};

//----------------------------------
//  Internal Methods
//----------------------------------
  
// Builds a new Class, with optional inheritance.
var buildClass = function(superclass) {
    var newClass = function() {
      if (!inheriting && this.initialize !== undefined) {
        this.initialize.apply(this, arguments);
      }
    };
    
    if (superclass) {
      inheriting = true;
      newClass.prototype = new superclass();
      inheriting = false;
    }
    
    newClass.superclass  = superclass;
    newClass.constructor = newClass;
    
    return newClass;
  },
  
  // Add the given methods to the object.
  addMethods = function(object, methods) {
    if (object === undefined || methods === undefined) {
      return;
    }
    
    var oldScope = currentScope;
    currentScope = object;
    
    if (typeof methods === "function") {
      methods.call(object);
    }
    else {
      for (var name in methods) {
        def(name, methods[name]);
      }
    }
    
    currentScope = oldScope;
  },
  
  // If necessary add a `callSuper` method to access the superclass's method.
  addSuperMethod = function(name, definition) {
    var superclass = currentClass !== null
      && currentClass.superclass !== undefined
      && currentClass.superclass.prototype;
    
    if (superclass
      && typeof definition === "function"
      && typeof superclass[name] === "function"
      && callsSuper(definition)) {
      
      return function() {
        var args = arguments,
            currentSuper = this.callSuper;
        
        this.callSuper = function() {
          for (var i = 0, l = arguments.length; i < l; i++) {
            args[i] = arguments[i];
          }
          return superclass[name].apply(this, args);
        };
        
        var result = definition.apply(this, arguments);       
        this.callSuper = currentSuper;
        
        return result;
      };
    }
    
    return definition;
  },
  
  // Test to see if a function contains a call to `callSuper`
  callsSuper = function(method) {
    return /\bcallSuper\b/.test(method.toString());
  };

})(window);