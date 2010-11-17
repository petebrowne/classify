describe('#module', function() {
  describe('when used as a namespace', function() {
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
    
    it('namespaces classes', function() {
      expect(new UI.Tabs('.tabs').selector).toEqual('.tabs');
    });
    
    it('namespaces other modules', function() {
      expect(UI.Elements.build('something')).toEqual('something');
    });
    
    it('changes .toString() to return the name of the class', function() {
      expect(UI.toString()).toEqual('UI');
    });
    
    it('changes .toString() to return the full name of the class, including modules', function() {
      expect(UI.Tabs.toString()).toEqual('UI.Tabs');
      expect(UI.Elements.toString()).toEqual('UI.Elements');
      expect(UI.Elements.toString(false)).toEqual('Elements');
    });
  });
  
  describe('with methods', function() {
    module('Algebra', function() {
      def('add', function(start, value) {
        return start + value;
      });
    });
    
    it('adds methods to the module', function() {
      expect(Algebra.add(2, 2)).toEqual(4);
    });
  });
  
  describe('when reopening a module', function() {
    module(Algebra, function() {
      def('subtract', function(start, value) {
        return start - value;
      });
    });
    
    it('retains original methods', function() {
      expect(Algebra.add(2, 2)).toEqual(4);
    });
    
    it('adds new methods', function() {
      expect(Algebra.subtract(4, 2)).toEqual(2);
    });
  });
  
  describe('within a class', function() {
    it('creates a module on the class', function() {
      classify('Something', function() {
        module('Complex', function() {
          def('isWorking', function() {
            return true;
          });
        });
      });
      
      expect(Something.Complex.isWorking()).toBe(true);
    });
  });
});
