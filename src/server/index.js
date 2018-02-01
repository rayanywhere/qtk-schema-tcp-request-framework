const Server = require('@qtk/schema-tcp-framework').Server;
const Validator = require('../validator/server');
const ValidationError = require('../error/validation');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {
    constructor({host, port, handlerDir, schemaDir}) {
        super();
        this._server = new Server({host, port, validator: new Validator(schemaDir)});
        this._handlerDir = handlerDir;
        
        this._server.on("data", async (socket, {uuid, data:{command, payload:request}}) => {
            let response = undefined;
            try {
                response = await require(`${this._handlerDir}/${command}`)({request, socket});
                if (response === undefined) {
                    response = null;
                }
            }
            catch(err) {
                this._server.send(socket, {uuid, data:{command, success: false, payload: err.message}});
                this.emit("exception", socket, err);
                return;
            }
            this._server.send(socket, {uuid, data:{command, success: true, payload: response}});
        });

        this._server.on("started", () => {this.emit("started");});
        this._server.on("stopped", () => {this.emit("stopped");});
        this._server.on("connected", (socket) => {this.emit("connected", socket);});
        this._server.on("closed", (socket) => {this.emit("closed", socket);});
        this._server.on("exception", (socket, error) => {
            if (error instanceof ValidationError) {
                this._server.send(socket, {
                    uuid: error.uuid, 
                    data:{
                        command: error.data.command, 
                        success: false, 
                        payload: error.message
                    }
                });
            }
            this.emit('exception', socket, error);
        });
    }
    
    start() {
        this._server.start();
    }

    stop() {
		this._server.stop();
	}
}