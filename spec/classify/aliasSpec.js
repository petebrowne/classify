describe('#alias', function() {
  it('creates an alias for the given method', function() {
    classify('Dog', function() {
      def('bark', function() {
        return 'ruff';
      });
      alias('speak', 'bark');
    });
    
    expect(new Dog().speak()).toEqual('ruff');
  });
});
