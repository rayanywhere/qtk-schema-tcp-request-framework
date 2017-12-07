#!/usr/bin/env node
const Server = require("../../").Server;
const assert = require('assert');

let sessionMiddleware = {
    pattern: '(.*)',
    handle: async (req) => {
        req.api.payload.session = "add a session";
    }
};

let server = new Server({
    host: "127.0.0.1",
    port: 3005,
    handlerDir: `${__dirname}/handler`,
    schemaDir: `${__dirname}/../schema`
}, [sessionMiddleware]);
server.on("error", (err) => {
    console.log(err.stack);
});
server.on("started", () => {
    console.log("server start....");
});
server.start();