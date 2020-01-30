'use strict'

const awsServerlessExpress = require('aws-serverless-express');
const express = require('express');
const findPrivateKey = require('probot/lib/private-key');
const logRequest = require('probot/lib/middleware/logging').logRequest;
const probot = require('probot');
const path = require('path');

// Teach express to properly handle async errors
// tslint:disable-next-line:no-var-requires
require('express-async-errors')

let createdApp = null;

const createServer = (args) => {
  const app = express()

  app.use(logRequest({ logger: args.logger }))
  app.use('/probot/static/', express.static(path.join(__dirname, 'static')))
  app.use(args.webhook)
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, 'views'))
  app.get('/alt-ping', (req, res) => res.end('PONG'))
  app.get('/other', (req, res) => 
      res.render("foobar", { message: 'baz', ts: (+ new Date()) }))

  // the app is created inside of probot, so capture the value
  // for use in serverBuilder
  createdApp = app;

  // aws-serverless-express bypasses using listen
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

const handler = serverBuilder({
    id: '911911911911' // app id here
}, ctx => {
  console.log('router', ctx.router);
  ctx.route().get('/otherness', (req, resp) => resp.json({ayyy: 'lol'}))
});

module.exports = {
  serverBuilder,
  findPrivateKey,
  handler
};