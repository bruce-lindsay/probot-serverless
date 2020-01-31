'use strict'
const boilerplate = require('./serverboilerplate');
const path = require('path');

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
  const app = ctx.route();

  app.get('/ping', (req, res) => res.end('PONG'))
  app.get('/other', (req, res) => 
      res.render("foobar", { message: 'baz', ts: (+ new Date()) }))

  app.get('/otherness', (req, resp) => resp.json({ayyy: 'lol'}))
};

// I have limited knowledge of express
// it doesn't seem i could set the view engine 
// on the probot Application, so 
const expressFunction = app => {
  app.set('view engine', 'hbs')
  app.set('views', path.join(__dirname, 'views'))
};

const opts = { appFn, expressFunction };

let handler = null;

const isServerless = false;

if (isServerless) {
  handler = boilerplate.setupServerless(opts);
} else {
  boilerplate.setupServer(opts);
}

module.exports = {
  handler
};