#!/usr/bin/env node
var fns = require("./tasks.js")
fns.concat("hello, ", "world", r1 => { 
 fns.upper(r1, r2 => {
 fns.decor(r2, r3 => {
   // *HELLOWORLD* 
   console.log( r3) 
 })
 })
})
