'use strict'

const awsServerlessExpress = require('aws-serverless-express');
const express = require('probot/node_modules/express');
const findPrivateKey = require('probot/lib/private-key');
const logRequest = require('probot/lib/middleware/logging').logRequest;
const probot = require('probot');
const path = require('path');

// Teach express to properly handle async errors
// tslint:disable-next-line:no-var-requires
require('probot/node_modules/express-async-errors')

let createdApp = null;

const createServer = (args) => {
  const app = express()

  app.use(logRequest({ logger: args.logger }))
  app.use('/probot/static/', express.static(path.join(__dirname, '..', 'static')))
  app.use(args.webhook)
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, '..', 'views'))
  app.get('/alt-ping', (req, res) => res.end('PONG'))

  createdApp = app;

  app.listen = () => { return app; };

  return app;
}

const serverBuilder = (options, appFn) => {
  const pb = new probot.Probot({
    cert: options.cert,
    id: options.id,
    sercret: options.secret,
    port: 9999, // unused when running in lambda
    createExpress: createServer
  });

  pb.load(appFn);
  const server = awsServerlessExpress.createServer(createdApp);
  const handler = (event, context) => {
      awsServerlessExpress.proxy(server, event, context);
    };
  return handler;
};

const handler = serverBuilder({}, () => {});

module.exports = {
  serverBuilder,
  findPrivateKey,
  handler
};