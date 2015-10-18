'use strict';

var assert = require('chai').assert;
var Corro = require('../index.js');

describe('Corro', function () {
  describe('ctor', function () {
    it('should add custom rules', function () {
      var c = new Corro({
        myRule: {
          func: function (val) { return typeof val === 'number' && val > 10; },
          message: 'hello!'
        }
      });

      assert.lengthOf(Object.keys(c.rules), 3);
      assert.equal(c.rules.myRule.message, 'hello!');
    });

    it('should allow overrides', function () {
      var c = new Corro({
        required: {
          func: function (val) { return !!val; },
          message: 'hello!'
        }
      });

      assert.lengthOf(Object.keys(c.rules), 2);
      assert.equal(c.rules.required.message, 'hello!');
    });
  });

  describe('validate', function () {
    it('should be a function', function () {
      assert.isFunction(new Corro().validate);
    });

    it('should return a validation result', function () {
      var result = new Corro().validate({}, {});

      assert.isTrue(result.valid);
      assert.lengthOf(Object.keys(result.errors), 0);
    });

    it('should pass arg values to rules', function () {
      var result = new Corro().validate({
        field: {minLength: 10}
      }, {
        field: 'this is longer than ten characters'
      });

      assert.isTrue(result.valid);
    });

    it('should not execute rules with falsey values', function () {
      assert.isTrue(new Corro().validate({
        field: {required: false}
      }, {}).valid);
    });

    it('should pass if all rules pass', function () {
      var result = new Corro().validate({
        field: {required: true}
      }, {
        field: 'value'
      });

      assert.isTrue(result.valid);
      assert.lengthOf(Object.keys(result.errors), 0);
    });

    it('should return errors if rules fail', function () {
      var result = new Corro().validate({
        field: {required: true}
      }, {});

      assert.isFalse(result.valid);
      assert.lengthOf(Object.keys(result.errors), 1);
    });

    describe('recursion into object trees', function () {
      it('should validate nested objects', function () {
        assert.isTrue(new Corro().validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: {field: 'value'}}).valid);
      });

      it('should return an error if a problem is found deeper in the tree', function () {
        var result = new Corro().validate({
          obj: {
            required: true,
            field: {
              required: true,
              subfield: {
                required: true
              }
            }
          }
        }, {obj: {field: {}}});

        assert.isFalse(result.valid);
        assert.lengthOf(Object.keys(result.errors), 1);
        assert.isOk(result.errors['obj.field.subfield']);
      });

      it('should stop gracefully and fail for nulls', function () {
        assert.isFalse(new Corro().validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: null}).valid);
      });

      it('should stop gracefully and fail for wrong types', function () {
        assert.isFalse(new Corro().validate({
          obj: {
            required: true,
            field: {
              required: true
            }
          }
        }, {obj: 'good luck walking down this'}).valid);
      });
    });

    describe('recursion into array elements', function () {
      it('should validate objects in arrays', function () {
        var result = new Corro().validate({
          array: {
            required: true,
            // minLength: 5, etc
            values: {required: true}
          }
        }, {array: ['one', 'two', null]});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors['array.2'], 1);
      });

      it('should stop gracefully and fail for nulls', function () {
        var result = new Corro().validate({
          array: {
            required: true,
            // minLength: 5, etc
            values: {required: true}
          }
        }, {array: null});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors.array, 1);
      });

      it('should stop gracefully and fail for wrong types', function () {
        var result = new Corro().validate({
          array: {
            required: true,
            // minLength: 5, etc
            values: {required: true}
          }
        }, {array: 'this is not an array'});

        assert.isFalse(result.valid);
        assert.lengthOf(result.errors['array.values'], 1);
      });
    });
	});
});
