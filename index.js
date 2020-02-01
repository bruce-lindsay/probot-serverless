'use strict'
const boilerplate = require('./serverboilerplate');
const path = require('path');
const express = require('express');

const appFn = ctx => {
  ctx.on('*', ctx => {
    console.log(ctx.payload);
  });
  ctx.on('installation', ctx => {
    console.log('installation');
    console.log(ctx.payload);
  });
  ctx.on('installation.created', ctx => {
    console.log('installation.created');
    console.log(ctx.payload);
  });
  const router = ctx.route();

  router.get('/ping', (req, res) => res.end('PONG'))
  router.get('/other', (req, res) => 
      res.render("foobar", { message: 'baz', ts: (+ new Date()) }))

  router.get('/otherness', (req, resp) => resp.json({ayyy: 'lol'}))

  router.use('/static', express.static(path.join(__dirname, 'static')))
  console.log('router.use', typeof router.use);
};

// I have limited knowledge of express
// it doesn't seem i could set the view engine 
// on the probot Application, so included an additional hook
const expressFunction = app => {
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, 'views'))
};

const opts = { appFn, expressFunction };

let handler = null;

if (process.env.SERVERLESS === "SERVERLESS") {
  handler = boilerplate.setupServerless(opts);
} else {
  boilerplate.setupServer(opts);
}

module.exports = {
  handler
};