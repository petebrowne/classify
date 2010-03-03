//--------------------------------------------------------------------------
//
//  Classify.js, version 0.5.1
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

  // The current Object to define Classes, Modules, and Methods on.
  currentObject = window,
  
  // The current Class to define Methods on.
  currentClass = null,
  
  // Flag to signal when we are initializing a superclass during inheritance
  inheriting = false,
  
  // Test to see if a function contains a call to `_super`
  containsSuper = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
  
//----------------------------------
//  Public Methods
//----------------------------------

/**
 * classify([superclass][, name][, definition]) -> null
 *   - superclass (Class): Optional superclass to inherit from.
 *   - name (String): Name of the Class.
 *   - definition (Function): The Class definition, containing method definitions.
 *
 * Creates a new Class. The Class will be defined on the _current object_, will will
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
  
  if (!currentObject[name] || typeof currentObject[name] !== "function") {
    currentObject[name] = buildClass(superclass);
  }
  
  withCurrentClass(currentObject[name], function() {
    withCurrentObject(currentClass.prototype, function() {
      definition.call(currentClass);
    });
  });
};

/**
 * def([object][, name][, definition]) -> null
 *   - object (Object): Optional object to define the method on. Defaults to the current object scope.
 *   - name (String): Name of the Method.
 *   - definition (Function): The Method Definition.
 *
 * Defines a new method. The method will be defined on the _current object_, which will
 * be either the `window`, a Class, or Module. Within the method definition, `this` will
 * refer to the _current object_. Optionally, you can set the object to define the method on as the
 * first argument.
 */
namespace.def = function(objectOrName, definitionOrName, definition) {
  var object, name;
  
  if (definition === undefined) {
    object     = currentObject;
    name       = objectOrName;
    definition = definitionOrName;
  }
  else {
    object = objectOrName;
    name   = definitionOrName;
  }
  
  definition   = addSuperMethod(name, definition);
  object[name] = definition;
};

/**
 * module(name, definition) -> null
 *   - name (String): Name of the Module.
 *   - definition (Function): The Module Definition.
 *
 * Creates a new Module. Modules can be used as namespaces for other Modules
 * and Classes. They can also be used as a collection of method definitions
 * to be included into other Classes.
 */
namespace.module = function(name, definition) {
  if (currentObject[name] === undefined) {
    currentObject[name] = {};
  }
  
  withCurrentObject(currentObject[name], function() {
    definition.call(currentObject);
  });
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
    object = (currentClass) ? currentClass.prototype : currentObject;
  }
  else {
    name = moduleOrName;
    object = currentObject[name];
    
    if (object.prototype) {
      object = object.prototype;
    }
  }
  
  addModule(object, module);
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
    object = currentObject[name];
  }
  
  addModule(object, module);
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
  currentObject[aliasName] = currentObject[name];
};

//----------------------------------
//  Internal Methods
//----------------------------------

// Changes the current object temporarily during the execution of the block.
var withCurrentObject = function(newObject, block) {
    var oldObject = currentObject;
    currentObject = newObject;
    block.call();
    currentObject = oldObject;
  },
  
  // Changes the current class temporarily during the execution of the block
  withCurrentClass = function(newClass, block) {
    currentClass = newClass;
    block.call();
    currentClass = null;
  },
  
  // Builds a new Class, with optional inheritance.
  buildClass = function(superclass) {
    var newClass = function() {
      if (!inheriting && this.initialize !== undefined) {
        this.initialize.apply(this, arguments);
      }
    }
    
    if (superclass) {
      inheriting = true;
      newClass.prototype = new superclass();
      inheriting = false;
    }
    
    newClass.superclass  = superclass;
    newClass.constructor = newClass;
    
    return newClass;
  },
  
  // Add the given module's methods to the object.
  addModule = function(object, module) {
    if (object === undefined || module === undefined) {
      return;
    }
    
    for (var name in module) {
      object[name] = module[name];
    }
  },
  
  // If necessary add a `_super` method to access the superclass's method.
  addSuperMethod = function(name, definition) {
    var superclass = currentClass !== null
      && currentClass.superclass !== undefined
      && currentClass.superclass.prototype;
    
    if (superclass
      && typeof definition === "function"
      && typeof superclass[name] === "function"
      && containsSuper.test(definition)) {
        
      return function() {
        this._super = superclass[name];
        var result  = definition.apply(this, arguments);       
        this._super = undefined;
       
        return result;
      };
    }
    
    return definition;
  };

})(window);
