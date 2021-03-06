'use strict';

var reduce = require('lodash.reduce');
var slice = require('lodash.slice');

exports = module.exports = function (val) {
  var self = this;

  // since all argument lists are flattened into the function signature we
  // need to reconstitute from arguments itself
  var messages = reduce(slice(arguments, 1), function (acc, rule) {
    var result = self.runRule(self.context, rule, val);

    if (Array.isArray(result)) { acc = acc.concat(result); }
    else if (result) { acc.push(result); }

    return acc;
  }, []);

  if (messages.length === 0) { return true; }
  else { return messages; }
};

exports.includeArgs = false;
