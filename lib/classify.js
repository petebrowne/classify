//--------------------------------------------------------------------------
//
//  Classify.js, version 0.1
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
 */
namespace.classify = function(superclassOrName, definitionOrName, definition) {
  var superclass, object, name;
  
  if (definition == undefined) {
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
 */
namespace.def = function(objectOrName, definitionOrName, definition) {
  var object, name;
  
  if (definition == undefined) {
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
 */
namespace.module = function(name, definition) {
  if (!currentObject[name]) {
    currentObject[name] = {};
  }
  
  withCurrentObject(currentObject[name], function() {
    definition.call(currentObject);
  });
};

/**
 * include([...modules]) -> null
 *   - modules (Modules or Objects): Any number of Modules (or Objects)
 *     to add to the current object scope.
 */
namespace.include = function(moduleOrName, module) {
  var object, name;
  
  if (module) {
    name = moduleOrName;
    object = currentObject[name];
    
    if (object.prototype) {
      object = object.prototype;
    }
  }
  else {
    module = moduleOrName;
    object = (currentClass) ? currentClass.prototype : currentObject;
  }
  
  addModule(object, module);
};

/**
 * extend([...modules]) -> null
 *   - modules (Modules or Objects): Any number of Modules (or Objects)
 *     to add to the current Class as Class Methods.
 */
namespace.extend = function(nameOrModule, module) {
  var object, name;
  
  if (module) {
    name   = nameOrModule;
    object = currentObject[name];
  }
  else if (currentClass) {
    module = nameOrModule;
    object = currentClass;
  }
  
  addModule(object, module);
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
  
  // Builds a new Class, with an optional inheritance.
  buildClass = function(superclass) {
    var newClass = function() {
      if (!inheriting && this.initialize) {
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
    if (!object || !module) {
      return;
    }
    
    for (var name in module) {
      object[name] = module[name];
    }
  },
  
  // If necessary add a `_super` method to access the superclass's method.
  addSuperMethod = function(name, definition) {
    var superclass = currentClass
      && currentClass.superclass
      && currentClass.superclass.prototype;
    
    if (superclass
      && typeof definition === "function"
      && typeof definition === "function"
      && containsSuper.test(definition)) {
        
      return (function(name, definition) {
        return function() {
          var temp    = this._super;
          this._super = superclass[name];
          var result  = definition.apply(this, arguments);       
          this._super = temp;
         
          return result;
        };
      })(name, definition);
    }
    
    return definition;
  };

})(window);