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
    
    it('changes .toString() to return the name of the Class', function() {
      expect(UI.toString()).toEqual('UI');
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
});
