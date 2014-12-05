'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/wtj-dev'
  },

  secrets: {
    session: process.env.SESSION_SECRET
  },

  seedDB: true
};
