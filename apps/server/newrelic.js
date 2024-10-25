'use strict'

require('dotenv').config();

const agent_enabled = process.env.NODE_ENV === "production";
const app_name = process.env.NEWRELIC_APP_NAME;
const license_key = process.env.NEWRELIC_LICENSE_KEY;

exports.config =  {
  agent_enabled: agent_enabled,
  app_name: [app_name],
  license_key: license_key,
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
};