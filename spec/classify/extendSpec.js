describe('#extend', function() {
  describe('when used within #classify', function() {
    describe('when given a module', function() {
      it('adds class methods', function() {
        module('Algebra', function() {
          def('add', function(start, value) {
            return start + value;
          });
        });
        
        classify('MathClass', function() {
          extend(Algebra);
        });
        
        expect(MathClass.add(2, 2)).toEqual(4);
      });
    });
    
    describe('when given methods', function() {
      it('adds class methods', function() {
        classify('MathClass', function() {
          extend(function() {
            def('subtract', function(start, value) {
              return start - value;
            });
          });
        });
        
        expect(MathClass.subtract(2, 2)).toEqual(0);
      });
    
      it('scopes to the Class object', function() {
        classify('MathClass', function() {
          extend(function() {
            this.PI = 3.14;
          });
        });
        
        expect(MathClass.PI).toEqual(3.14);
      });
    });
  });
  
  describe('when used on Classes', function() {
    it('adds class methods', function() {
      extend(String, {
        include : function(string, pattern) {
          return string.indexOf(pattern) > -1;
        }
      });
        
      expect(String.include('testing', 'test')).toBeTruthy();
    });
  });
  
  describe('when used on objects', function() {
    it('adds instance methods', function() {
      var object = {};
      
      extend(object, {
        testing : function() {
          return 'working';
        }
      });
        
      expect(object.testing()).toEqual('working');
    });
  });
});
