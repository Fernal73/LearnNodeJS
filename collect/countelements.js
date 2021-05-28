#!/usr/bin/env node
const collect = require("collect.js");

const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const data = collect(nums);

const nOfElements = data.count();

console.log(`There are ${nOfElements} elements`);
