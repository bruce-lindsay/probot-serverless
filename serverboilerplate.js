'use strict'

const awsServerlessExpress = require('aws-serverless-express');
const express = require('express');
const findPrivateKey = require('probot/lib/private-key').findPrivateKey;
const logRequest = require('probot/lib/middleware/logging').logRequest;
const probot = require('probot');


// Teach express to properly handle async errors
// tslint:disable-next-line:no-var-requires
require('express-async-errors')

let createdApp = null;
let disableListen = false;
let expressFunction = null;

// copy of minimal server boilerplate from probot server.ts
const createServer = (args) => {
  const app = express()

  app.use(logRequest({ logger: args.logger }))
  app.use(args.webhook)

  if (expressFunction) {
    expressFunction(app);
  }

  // the app is created inside of probot, so capture the value
  // for use in serverBuilder
  createdApp = app;

  // aws-serverless-express bypasses using listen
  if (disableListen) {
    app.listen = () => { return app; };
  }
  
  return app;
}

const assertOptions = (options) => {
  if (!(options && options.appFn)) {
    throw new Error("options.appFn is unspecfied");
  }
}

const createServerlessHandler = () => {
  const server = awsServerlessExpress.createServer(createdApp);
  return (event, context) => {
      awsServerlessExpress.proxy(server, event, context);
  }
}

// copy of unreachable function from probot index.ts 
const optionsFromEnvironment = () => {
  console.log(typeof findPrivateKey)
  const privateKey = findPrivateKey()
  return {
    cert: (privateKey && privateKey.toString()) || undefined,
    id: Number(process.env.APP_ID),
    port: Number(process.env.PORT) || 3000,
    secret: process.env.WEBHOOK_SECRET,
    webhookPath: process.env.WEBHOOK_PATH,
    webhookProxy: process.env.WEBHOOK_PROXY_URL
  };
}

const serverUp = (options) => {
  assertOptions(options);

  const optionsArg = Object.assign(
    {createExpress: createServer}, 
    options, 
    optionsFromEnvironment());

  if (options.expressFunction) {
    expressFunction = options.expressFunction;
  }

  const pb = new probot.Probot(
    optionsArg
  );

  pb.load(options.appFn);

  return pb;
}

const setupServerless = (options) => {
  let disableListen = true;

  serverUp(options);

  return createServerlessHandler();
};

const setupServer = (options) => {
  let disableListen = false;

  serverUp(options).start();
}

module.exports = {
  setupServer,
  setupServerless
};