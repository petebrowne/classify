Classify
========

_A Ruby-like Module & Class Inheritance Library for Javascript_

Classify is a simple, reusable library for Javascript Class Inheritance without any dependencies. It also includes a Ruby-like system of Modules for namespacing and bundling methods. It's a good fit along side frameworks like [jQuery](http://jquery.com/) for complex Javascript applications.

Classify's syntax is inspired by [Foundation.js](http://github.com/grockit/june/blob/master/vendor/foundation.js) and uses concepts from John Resig's [Simple Class Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) and [Prototype](http://www.prototypejs.org/).

### Features:

* Full Inheritance, with access to the super method
* Module Namespacing
* Add Module methods to Classes, Objects, and globally


Using Classify
--------------
  
### Classes

To make a class use the `classify` method, which is available globally:

    classify('Dog', function() {});
    
    var dog = new Dog();

This will create a `Dog` class without any methods. To define new methods, use the `def` method:

    classify('Dog', function() {
      def('bark', function() {
        return 'ruff';
      });
      
      def('fetch', function(object) {
        return object;
      });
    });
    
    var dog = new Dog();
    dog.bark(); // 'ruff'
    dog.fetch('stick'); // 'stick'
  
To define a constructor, define a method named `'initialize'`:

    classify('Dog', function() {
      def('initialize', function(name) {
        this.name = name;
      });
    });
    
    var dog = new Dog('Sparky');
    alert(dog.name); // 'Sparky'
  
#### Inheritance

To inherit from another class, just pass the class to the `classify` method:

    classify('Animal', function() {
      def('speak', function() {
        return 'Hello';
      });
    });
    
    classify(Animal, 'Dog', function() {
      def('speak', function() {
        return this.callSuper() + ', ruff';
      });
    });
    
    var animal = new Animal();
    animal.speak(); // 'Hello'
    
    var dog = new Dog();
    dog.speak(); // 'Hello, ruff'
  
You have access to the super method by using `this.callSuper` within the method definition. The super method will automatically get the arguments from the method definition, but you can also override them if need be:

    classify('Vehicle', function() {
      def('go', function(distance) {
        return distance / this.speed;
      });
    });
    
    classify(Vehicle, 'Car', function() {
      def('go', function(distance) {
        if (this.hasFuel) {
          this.callSuper();
        }
        else {
          this.callSuper(0);
        }
      });
    });
    
    var car = new Car();
    car.speed = 100;
    car.go(500); // 0
    car.hasFuel = true;
    car.go(500); // 5

#### Reopening

Classes can be reopened to add more methods or even to redefine methods:

    classify('Dog', function() {
      def('bark', function() {
        return 'ruff';
      });
    });
    
    classify(Dog, function() {
      def('bark', function() {
        return 'meow';
      });
      
      def('fetch', function(object) {
        return object;
      });
    });
    
    var dog = new Dog();
    dog.bark(); // 'meow'
    dog.fetch('stick'); // 'stick'
    
Native classes can also be reopened:

    classify(String, function() {
      def('dasherize', function() {
        return this.replace(/_/g, '-');
      });
    });
    
### Modules

You define modules by using the `module` function:

    module('Animals', function() {});
    
#### Namespaces

You can use modules to namespace classes:

    module('Animals', function() {
      classify('Dog', function() {});
      
      module('Felines', function() {
        classify('Cat', function() {});
      });
    });
    
    var dog = new Animals.Dog();
    var cat = new Animals.Felines.Cat();
    
#### Methods

Methods defined on modules behave like class methods:

    module('Inflector', function() {
      def('dasherize', function(string) {
        return string.replace(/_/g, '-');
      });
    });
    
    Inflector.dasherize('underscored_name'); // 'underscored-name'
    
_Note: This is actually different than the Ruby Module implementation. This was done to simplify the code._
    
#### Include

Modules methods can be included into classes:

    module('Inflector', function() {
      def('dasherize', function() {
        return this.replace(/_/g, '-');
      });
    });
    
    classify(String, function() {
      include(Inflector);
    });
    
    // or alternatively (if class is already defined):
    // include(String, Inflector);
    
    var string = 'underscored_name';
    string.dasherize(); // 'underscored-name'
    
#### Extend

Module methods can be added as class methods using `extend`:

    module('Inflector', function() {
      def('dasherize', function(string) {
        return string.replace(/_/g, '-');
      });
    });
    
    classify(String, function() {
      extend(Inflector);
    });
    
    // or alternatively (if class is already defined):
    // extend(String, Inflector);
    
    String.dasherize('underscored_name'); // 'underscored-name'
    
Class Methods can also be added using `extend`:

    classify(String, function() {
      extend(function() {
        def('dasherize', function(string) {
          return string.replace(/_/g, '-');
        });
      });
    });
    
    String.dasherize('underscored_name'); // 'underscored-name'
    
### Alias

Methods can be aliased with other names using `alias`:

    classify(String, function() {
      alias('upcase', 'toUpperCase');
    });
    
    'upcase'.upcase(); // 'UPCASE';
  

Copyright
---------

Copyright (c) 2009 [Peter Browne](http://petebrowne.com). See LICENSE for details.