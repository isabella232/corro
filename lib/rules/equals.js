'use strict';

exports = module.exports = function (val, otherField) {
  return val === this.context[otherField];
};

exports.message = 'values are not equal';
