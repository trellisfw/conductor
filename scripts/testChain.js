var _ = require('lodash');

var doc = {
  "_id": "resources/df709f6e-7de0-4a0a-8be5-81d072db6d67",
  "_rev": 9,
  "_type": "application/json",
  "_meta": {
    "_id": "resources/df709f6e-7de0-4a0a-8be5-81d072db6d67/_meta",
    "_rev": 9,
    "stats": {
      "createdBy": "users/default:users_sam_321",
      "created": 1580416142.993
    }
  },
  "pdf": {
    "_id": "resources/43c8765e-79d1-4c8a-acb6-b7526d1be476",
    "_rev": 2,
    "_meta": {
      "filename": "SQF Audit.pdf"
    }
  }
};


var it = _.chain(doc).get('audits').values().get(0).get('signatures').value() || [];

console.log(it);
