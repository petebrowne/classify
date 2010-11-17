describe('#classify', function() {
  describe('when creating a class', function() {
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
    
    var vehicle;
    beforeEach(function() {
      vehicle = new Vehicle(2, 10);
    });
    
    it('creates an instance of the Class', function() {
      expect(vehicle).toBeAnInstanceOf(Vehicle);
    });
      
    it('sets the constructor property to the class', function() {
      expect(vehicle.constructor).toBe(Vehicle);
    });
    
    it('creates a class with an initializer', function() {
      expect(vehicle.wheels).toEqual(2);
    });
    
    it('adds instance methods', function() {
      vehicle.accelerate(10);
      expect(vehicle.speed).toEqual(20);
    });
    
    it('scopes the Class definition to the Class', function() {
      expect(Vehicle.types).toEqual([ 'Bike', 'Car' ]);
    });
    
    it('adds Class methods using #extend', function() {
      var vehicles = Vehicle.manufacture(10, 2, 10);
      expect(vehicles.length).toEqual(10);
      expect(vehicles[0].wheels).toEqual(2);
    });
    
    it('changes .toString() to return the name of the Class', function() {
      expect(Vehicle.toString()).toEqual('Vehicle');
    });
    
    it('changes #toString() to include the name of the Class', function() {
      expect(vehicle.toString()).toEqual('[object Vehicle]');
    });
    
    describe('with a superclass', function() {
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
      
      var car;
      beforeEach(function() {
        car = new Car(100);
      });
    
      it('creates an instance of the parent class', function() {
        expect(car).toBeAnInstanceOf(Vehicle);
      });
    
      it('creates an instance of the class', function() {
        expect(car).toBeAnInstanceOf(Car);
      });
      
      it('sets the constructor property to the class', function() {
        expect(car.constructor).toBe(Car);
      });
      
      it('inherits methods from the superclass', function() {
        expect(car.accelerate(50)).toEqual(150);
      });
      
      it('accesses superclass methods using #callSuper', function() {
        expect(car.wheels).toEqual(4);
        car.fuelUp();
        expect(car.go(500)).toEqual(5);
      });
      
      it('allows override of default parameters when using #callSuper', function() {
        expect(car.hasFuel).toBeFalsy();
        expect(car.go(500)).toEqual(0);
      });
      
      it('inherits class methods', function() {
        var cars = Car.manufacture(10, 100);
        expect(cars.length).toEqual(10);
        expect(cars[0].speed).toEqual(100);
      });
      
      it('does not inerit class properties', function() {
        expect(Car.types).toBeUndefined();
      });
    });
  });
    
  describe('when reopening a class', function() {
    classify('Dog', function() {
      def('bark', function() {
        return 'ruff';
      });
    });
    
    classify(Dog, function() {
      def('fetch', function() {
        return 'stick';
      });
    });
    
    var dog;
    beforeEach(function() {
      dog = new Dog();
    });
    
    it('retains original methods', function() {
      expect(dog.bark()).toEqual('ruff');
    });
    
    it('adds new methods', function() {
      expect(dog.fetch()).toEqual('stick');
    });
  });
  
  describe('when extending a native class', function() {
    it('adds new methods', function() {
      classify(String, function() {
        def('include', function(pattern) {
          return this.indexOf(pattern) > -1;
        });
      });
      
      expect(('testing').include('test')).toBeTruthy();
    });
  });
});
