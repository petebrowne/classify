describe('#def', function() {
  describe('when used globally', function() {
    it('adds a global method', function() {
      def('globalMethod', function() {
        return 'working';
      });
      
      expect(globalMethod()).toEqual('working');
    });
  });
  
  describe('when used on an object', function() {
    it('adds a method on the object', function() {
      var object = {};
      
      def(object, 'method', function() {
        return 'working';
      });
      
      expect(object.method()).toEqual('working');
    });
  });
});
