#!/usr/bin/env node
require("dotenv").config();
const amqp = require("amqplib/callback_api");

const options = {
  protocol: process.env.PROTOCOL,
  hostname: process.env.HOSTNAME,
  port: process.env.PORT,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  locale: process.env.LOCALE,
  frameMax: process.env.FRAMEMAX,
  heartbeat: process.env.HEARTBEAT,
  vhost: process.env.VHOST
};

amqp.connect(options, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const queue = "task_queue";
    const msg = process.argv.slice(2).join(" ") || "Hello World!";

    channel.assertQueue(queue, {
      durable: true
    });
    channel.sendToQueue(queue, Buffer.from(msg), {
      persistent: true
    });
    console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
});
