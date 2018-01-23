const TcpServer = require('@qtk/tcp-framework').Server;
const SchemaValidater = require('../common/schema_validater.js');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {

    constructor({host, port, handlerDir, schemaDir}, middlewares = []) {
        super();
        this._tcpServer = new TcpServer({host, port});
        this._handlerDir = handlerDir;
        this._middlewares = middlewares;
        this._schemaValidator = new SchemaValidater(schemaDir);
        
        this._tcpServer.on("data", (socket, incomingMessage) => {
            this._onData(socket, incomingMessage)}
        );

        this._tcpServer.on("started", () => {this.emit("started");});
        this._tcpServer.on("stopped", () => {this.emit("stopped");});

        this._tcpServer.on("connected", (socket) => {
            this.emit("connected", socket);
        });

        this._tcpServer.on("closed", (socket) => {
            this.emit("closed", socket);
        });

        this._tcpServer.on("error", (error, socket) => {
            this.emit("closed", socket); //对于上层使用者来说，并不在意socket是怎么挂掉的，onError/onClose处理一样，故统一这两种情况抛close事件
        });
    }

    start() {
        this._tcpServer.start();
    }

    async _onData(socket, incomingMessage) {
        let response = {
            end : (outgoing = undefined, status = 0) => {
                this._tcpServer.send(socket, {
                    buffer: Buffer.from(JSON.stringify({status,  payload: outgoing})),
                    uuid: incomingMessage.uuid
                });
            }
        }

        let {command, payload} = JSON.parse(incomingMessage.buffer.toString('utf8'))
        try {
            let commandSchema = this._schemaValidator.resolve(command);
            //数据包装
            let request = {
                api: {
                    name: command,
                    schema: commandSchema,
                    payload: {
                        constant: commandSchema.constant,
                        request: payload,
                        socket: socket
                    }
                }
            }

            //中间件处理
            for (let middleware of this._middlewares) {
                let regex = new RegExp(middleware.pattern);
                if (regex.test(request.api.name)) {
                    await middleware.handle(request);
                }
            }

            //控制器层处理
            commandSchema.requestValidator.validate(request.api.payload.request);
            let outgoing = await require(`${this._handlerDir}/${request.api.name}`)(request.api.payload);
            if(outgoing === undefined) outgoing = null;
            commandSchema.responseValidator.validate(outgoing);

            response.end(outgoing, 0);
        }
        catch(err) {
            this.emit("error", err, socket);
            response.end(undefined, -1);
        }
    }

}