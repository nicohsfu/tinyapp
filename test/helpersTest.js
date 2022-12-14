const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if the email is not registered', function() {
    const user = findUserByEmail("user3@example.com", testUsers);
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });

});
