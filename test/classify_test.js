Screw.Unit(function() {
  
  //----------------------------------
  //  #def
  //----------------------------------
  
  describe("#def", function() {
    var WORKING = "working",
      testMethod = function() { return WORKING; };
    
    describe("used globally", function() {
      it("should define a global method", function() {
        def("globalMethod", testMethod);
        
        expect(globalMethod()).to(equal, WORKING);
      });
    });
    
    describe("on a given object", function() {
      it("should define a method on the object", function() {
        var object = {};
        def(object, "method", testMethod);
        
        expect(object.method()).to(equal, WORKING);
      });
    });
  });
  
  //----------------------------------
  //  #classify
  //----------------------------------
  
  describe("#classify", function() {
    describe("creating a class", function() {
      var vehicle;
      
      before(function() {
        classify("Vehicle", function() {
          def("initialize", function(wheels, speed) {
            this.wheels = wheels;
            this.speed  = speed;
          });
          
          def("go", function(distance) {
            return distance / this.speed;
          });
          
          def("accelerate", function(speed) {
            this.speed += speed;
            return this.speed;
          });
          
          def(this, "types", function() {
            return [ "Bike", "Car" ];
          });
        });
        
        vehicle = new Vehicle(2, 10);
      });
      
      it("should create an instance of the class", function() {
        expect(vehicle instanceof Vehicle).to(be_true);
      });
      
      it("should create a class with an initializer", function() {
        expect(vehicle.wheels).to(equal, 2);
      });
      
      it("should create methods on the prototype", function() {
        vehicle.accelerate(10);
        expect(vehicle.speed).to(equal, 20);
      });
      
      it("should create class methods", function() {
        expect(Vehicle.types()).to(equal, [ "Bike", "Car" ]);
      });
      
      describe("with a superclass", function() {
        var car;
        
        before(function() {
          classify(Vehicle, "Car", function() {
            def("fuelUp", function() {
              this.hasFuel = true;
            });
            
            def("go", function(distance) {
              if (this.hasFuel) {
                return this._super(distance);
              }
              else {
                throw new Error("Car must have fuel to go...");
              }
            });
          });
          
          car = new Car(4, 100);
        })
      
        it("should create an instance of the parent class", function() {
          expect(car instanceof Vehicle).to(be_true);
        });
      
        it("should create an instance of the class", function() {
          expect(car instanceof Car).to(be_true);
        });
        
        it("should inherit methods from the superclass", function() {
          expect(car.accelerate(50)).to(equal, 150);
        });
        
        it("should access superclass methods using super", function() {
          car.fuelUp();
          expect(car.go(500)).to(equal, 5);
        });
      });
    });
      
    describe("reopening a class", function() {
      var dog;
      
      before(function() {
        classify("Dog", function() {
          def("bark", function() {
            return "ruff";
          });
        });
        
        classify("Dog", function() {
          def("fetch", function() {
            return "stick";
          });
        });
        
        dog = new Dog();
      });
      
      it("should retain original methods", function() {
        expect(dog.bark()).to(equal, "ruff");
      });
      
      it("should add new methods", function() {
        expect(dog.fetch()).to(equal, "stick");
      });
    });
    
    describe("extending a native class", function() {
      it("should add new methods", function() {
        classify("String", function() {
          def("include", function(pattern) {
            return this.indexOf(pattern) > -1;
          });
        });
        
        expect(("testing").include("test")).to(be_true);
      });
    });
  });
  
  //----------------------------------
  //  #module
  //----------------------------------
  
  describe("#module", function() {
    describe("used as a namespace", function() {
      before(function() {
        module("UI", function() {
          classify("Tabs", function() {
            def("initialize", function(selector) {
              this.selector = selector;
            });
          });
          
          module("Elements", function() {
            def("build", function(element) {
              return element;
            });
          });
        });
      });
      
      it("should namespace classes", function() {
        expect(new UI.Tabs(".tabs").selector).to(equal, ".tabs");
      });
      
      it("should namespace other modules", function() {
        expect(UI.Elements.build("something")).to(equal, "something");
      });
    });
    
    describe("a module with methods", function() {
      before(function() {
        module("Algebra", function() {
          def("add", function(start, value) {
            return start + value;
          });
        });
      });
      
      it("should be able to call the methods through the namespace", function() {
        expect(Algebra.add(2, 2)).to(equal, 4);
      });
    });
  });
  
  //----------------------------------
  //  #include
  //----------------------------------
  
  describe("#include", function() {
    before(function() {
      module("Algebra", function() {
        def("add", function(start, value) {
          return start + value;
        });
      });
    });
    
    describe("used globally", function() {
      it("should make module methods available globally", function() {
        include(Algebra);
        expect(add(2, 2)).to(equal, 4);
      });
    });
    
    describe("used within #classify", function() {
      it("should make module methods available to classes", function() {
        classify("MathClass", function() {
          include(Algebra);
        });
        
        expect(new MathClass().add(2, 2)).to(equal, 4);
      });
    });
    
    describe("used on classes", function() {
      it("should add the methods to the prototype", function() {
        include("String", {
          include : function(pattern) {
            return this.indexOf(pattern) > -1;
          }
        });
          
        expect(("testing").include("test")).to(be_true);
      });
    });
  });
  
  //----------------------------------
  //  #extend
  //----------------------------------
  
  describe("#extend", function() {
    describe("used within #classify", function() {
      it("should add class methods to a class", function() {
        module("Algebra", function() {
          def("add", function(start, value) {
            return start + value;
          });
        });
        
        classify("MathClass", function() {
          extend(Algebra);
        });
        
        expect(MathClass.add(2, 2)).to(equal, 4);
      });
    });
    
    describe("used on classes", function() {
      it("should add the methods as class methods", function() {
        extend("String", {
          include : function(string, pattern) {
            return string.indexOf(pattern) > -1;
          }
        });
          
        expect(String.include("testing", "test")).to(be_true);
      });
    });
  });
});