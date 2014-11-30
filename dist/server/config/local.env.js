'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: "wtj-secret",

  FACEBOOK_ID: '608527939270246',
  FACEBOOK_SECRET: 'bbb5fe23097c59d75c37d22f9eed8489',

  // TWITTER_ID: 'app-id',
  // TWITTER_SECRET: 'secret',

  // GOOGLE_ID: 'app-id',
  // GOOGLE_SECRET: 'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
