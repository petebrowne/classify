describe('#include', function() {
  module('Algebra', function() {
    def('add', function(start, value) {
      return start + value;
    });
  });
  
  describe('when used globally', function() {
    it('adds global methods', function() {
      include(Algebra);
      expect(add(2, 2)).toEqual(4);
    });
  });
  
  describe('when used within #classify', function() {
    classify('MathClass', function() {
      include(Algebra);
    });
    
    it('adds instance methods', function() {
      expect(new MathClass().add(2, 2)).toEqual(4);
    });
    
    it('does not replace #toString', function() {
      expect(new MathClass().toString()).not.toEqual('Algebra');
    });
  });
  
  describe('when used on Classes', function() {
    include(String, {
      include : function(pattern) {
        return this.indexOf(pattern) > -1;
      }
    });
    
    it('adds instance methods', function() {
      expect(('testing').include('test')).toBeTruthy();
    });
  });
});
