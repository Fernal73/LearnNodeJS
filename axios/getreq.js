#!/usr/bin/env node
const axios = require("axios");

axios.get("http://webcode.me").then(resp => {
  console.log(resp.data);
});

