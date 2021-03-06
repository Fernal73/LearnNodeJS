#!/usr/bin/env node
const {Liquid} = require("liquidjs");
const path = require("path");

const engine = new Liquid({
  root: path.resolve(__dirname, "views/"),  
  extname: ".liquid"
});

engine
  .renderFile("hello", { name: "Peter" })
  .then(console.log);  
