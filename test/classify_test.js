Screw.Unit(function() {
  
  //----------------------------------
  //  #def
  //----------------------------------
  
  describe('#def', function() {
    var WORKING = 'working',
      testMethod = function() { return WORKING; };
    
    describe('used globally', function() {
      it('should define a global method', function() {
        def('globalMethod', testMethod);
        
        expect(globalMethod()).to(equal, WORKING);
      });
    });
    
    describe('on a given object', function() {
      it('should define a method on the object', function() {
        var object = {};
        def(object, 'method', testMethod);
        
        expect(object.method()).to(equal, WORKING);
      });
    });
  });
  
  //----------------------------------
  //  #classify
  //----------------------------------
  
  describe('#classify', function() {
    describe('creating a class', function() {
      var vehicle;
      
      before(function() {
        classify('Vehicle', function() {
          extend(function() {
            def('manufacture', function(number, wheels, speed) {
              var vehicles = [];
              for (var i = 0; i < number; i++) {
                vehicles.push(new this(wheels, speed));
              }
              return vehicles;
            });
          });
          
          this.types = [ 'Bike', 'Car' ];
          
          def('initialize', function(wheels, speed) {
            this.wheels = wheels;
            this.speed  = speed;
          });
          
          def('go', function(distance) {
            return distance / this.speed;
          });
          
          def('accelerate', function(speed) {
            this.speed += speed;
            return this.speed;
          });
        });
        
        vehicle = new Vehicle(2, 10);
      });
      
      it('should create an instance of the class', function() {
        expect(vehicle instanceof Vehicle).to(be_true);
      });
      
      it('should create a class with an initializer', function() {
        expect(vehicle.wheels).to(equal, 2);
      });
      
      it('should create methods on the prototype', function() {
        vehicle.accelerate(10);
        expect(vehicle.speed).to(equal, 20);
      });
      
      it('should be scoped to the class instance', function() {
        expect(vehicle.types).to(equal, [ 'Bike', 'Car' ]);
      });
      
      it('should create class methods using #extend', function() {
        var vehicles = Vehicle.manufacture(10, 2, 10);
        expect(vehicles.length).to(equal, 10);
        expect(vehicles[0].wheels).to(equal, 2);
      });
      
      describe('with a superclass', function() {
        var car;
        
        before(function() {
          classify(Vehicle, 'Car', {
            initialize : function(speed) {
              this.callSuper(4, speed);
            },
            
            fuelUp : function() {
              this.hasFuel = true;
            },
            
            go : function(distance) {
              if (this.hasFuel) {
                return this.callSuper();
              }
              else {
                return this.callSuper(0);
              }
            }
          });
          
          car = new Car(100);
        })
      
        it('should create an instance of the parent class', function() {
          expect(car instanceof Vehicle).to(be_true);
        });
      
        it('should create an instance of the class', function() {
          expect(car instanceof Car).to(be_true);
        });
        
        it('should inherit methods from the superclass', function() {
          expect(car.accelerate(50)).to(equal, 150);
        });
        
        it('should access superclass methods using #callSuper', function() {
          expect(car.wheels).to(equal, 4);
          car.fuelUp();
          expect(car.go(500)).to(equal, 5);
        });
        
        it('should allow override of default parameters when using #callSuper', function() {
          expect(car.hasFuel).to(be_false);
          expect(car.go(500)).to(equal, 0);
        });
        
        it('should inherit class methods', function() {
          var cars = Car.manufacture(10, 100);
          expect(cars.length).to(equal, 10);
          expect(cars[0].speed).to(equal, 100);
        });
      });
    });
      
    describe('reopening a class', function() {
      var dog;
      
      before(function() {
        classify('Dog', function() {
          def('bark', function() {
            return 'ruff';
          });
        });
        
        classify('Dog', function() {
          def('fetch', function() {
            return 'stick';
          });
        });
        
        dog = new Dog();
      });
      
      it('should retain original methods', function() {
        expect(dog.bark()).to(equal, 'ruff');
      });
      
      it('should add new methods', function() {
        expect(dog.fetch()).to(equal, 'stick');
      });
    });
    
    describe('extending a native class', function() {
      it('should add new methods', function() {
        classify('String', function() {
          def('include', function(pattern) {
            return this.indexOf(pattern) > -1;
          });
        });
        
        expect(('testing').include('test')).to(be_true);
      });
    });
  });
  
  //----------------------------------
  //  #module
  //----------------------------------
  
  describe('#module', function() {
    describe('used as a namespace', function() {
      before(function() {
        module('UI', function() {
          classify('Tabs', function() {
            def('initialize', function(selector) {
              this.selector = selector;
            });
          });
          
          module('Elements', function() {
            def('build', function(element) {
              return element;
            });
          });
        });
      });
      
      it('should namespace classes', function() {
        expect(new UI.Tabs('.tabs').selector).to(equal, '.tabs');
      });
      
      it('should namespace other modules', function() {
        expect(UI.Elements.build('something')).to(equal, 'something');
      });
    });
    
    describe('a module with methods', function() {
      before(function() {
        module('Algebra', function() {
          def('add', function(start, value) {
            return start + value;
          });
        });
      });
      
      it('should be able to call the methods through the namespace', function() {
        expect(Algebra.add(2, 2)).to(equal, 4);
      });
    });
  });
  
  //----------------------------------
  //  #include
  //----------------------------------
  
  describe('#include', function() {
    before(function() {
      module('Algebra', function() {
        def('add', function(start, value) {
          return start + value;
        });
      });
    });
    
    describe('used globally', function() {
      it('should make module methods available globally', function() {
        include(Algebra);
        expect(add(2, 2)).to(equal, 4);
      });
    });
    
    describe('used within #classify', function() {
      it('should make module methods available to classes', function() {
        classify('MathClass', function() {
          include(Algebra);
        });
        
        expect(new MathClass().add(2, 2)).to(equal, 4);
      });
    });
    
    describe('used on classes', function() {
      it('should add the methods to the prototype', function() {
        include('String', {
          include : function(pattern) {
            return this.indexOf(pattern) > -1;
          }
        });
          
        expect(('testing').include('test')).to(be_true);
      });
    });
  });
  
  //----------------------------------
  //  #extend
  //----------------------------------
  
  describe('#extend', function() {
    describe('used within #classify', function() {
      it('should add class methods to a class', function() {
        module('Algebra', function() {
          def('add', function(start, value) {
            return start + value;
          });
        });
        
        classify('MathClass', function() {
          extend(Algebra);
        });
        
        expect(MathClass.add(2, 2)).to(equal, 4);
      });
      
      it('should be able to add class methods with a function definition', function() {
        classify('MathClass', function() {
          extend(function() {
            def('subtract', function(start, value) {
              return start - value;
            });
          });
        });
        
        expect(MathClass.subtract(2, 2)).to(equal, 0);
      });
      
      it('should be scoped to the class object', function() {
        classify('MathClass', function() {
          extend(function() {
            this.PI = 3.14;
          });
        });
        
        expect(MathClass.PI).to(equal, 3.14);
      });
    });
    
    describe('used on classes', function() {
      it('should add the methods as class methods', function() {
        extend('String', {
          include : function(string, pattern) {
            return string.indexOf(pattern) > -1;
          }
        });
          
        expect(String.include('testing', 'test')).to(be_true);
      });
    });
  });
  
  //----------------------------------
  //  #alias
  //----------------------------------
  
  describe('#alias', function() {
    it('should create an alias for the given method', function() {
      classify('Dog', function() {
        def('bark', function() {
          return 'ruff';
        });
        alias('speak', 'bark');
      });
      
      expect(new Dog().speak()).to(equal, 'ruff');
    });
  });
  
});
