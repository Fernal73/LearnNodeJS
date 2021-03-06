#!/usr/bin/env node
 // cluster.js
"use strict";

let count;

// **** Mock DB Call
const numberOfUsersInDB = function() {
    count = count || 5;
    count = count * count;
    return count;
};
// ****

const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
    const cpus = os.cpus().length;

    console.log(`Forking for ${cpus} CPUs`);
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }
    const workers = Object.values(cluster.workers);
    const restartWorker = (workerIndex) => {
        const worker = workers[workerIndex];
        if (!worker) return;

        worker.on("exit", () => {
            if (!worker.exitedAfterDisconnect) return;
            console.log(`Exited process ${worker.process.pid}`);

            cluster.fork().on("listening", () => {
                restartWorker(workerIndex + 1);
            });
        });

        worker.disconnect();
    };

    //    restartWorker(0);
    cluster.on("exit", (worker, code, signal) => {
        if (code !== 0 && !worker.exitedAfterDisconnect) {
            console.log(`Worker ${worker.id} crashed. ` +
                "Starting a new worker...");
            cluster.fork();
        }
    });
    Object.values(cluster.workers).forEach(worker => {
        worker.send(`Hello Worker ${worker.id}`);
    });

    const updateWorkers = () => {
        const usersCount = numberOfUsersInDB();
        Object.values(cluster.workers).forEach(worker => {
            worker.send({
                usersCount
            });
        });
    };

    updateWorkers();
    setInterval(updateWorkers, 10000);
} else {
    require("./server");
}