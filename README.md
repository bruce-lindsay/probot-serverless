# Probot Serverless

A combination of 
https://github.com/probot/probot
and
https://github.com/awslabs/aws-serverless-express

## Goals

* Retain the ability to run the probot server in express in a nodejs process in a traditional or container environment without changing any code
* Ability to run the probot server in aws api gateway and lambda
* Retain the ability to use static content while running in api gateway

## Note

* Presently the probot dependency is forked due to an issue with one of the dependencies. https://github.com/trentm/node-bunyan/issues/60. bunyan-sfdx-no-dtrace is substituted.

