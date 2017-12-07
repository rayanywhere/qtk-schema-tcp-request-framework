const TcpClient = require('@qtk/tcp-framework').PersistentClient;
const genuuid = require('uuid/v4');

module.exports = class Transport {
    constructor({host, port}) {
        this._tcpClient = new TcpClient({host, port});
        this._tcpClient.on("data", (data) => {this._onData(data)});
        this._pendings = new Map();
    }

    run(interfaceName, request, timeout) { 
        return this._transport(interfaceName, request, timeout);
    }

    _onData({uuid, buffer}) {
        let callback = this._pendings.get(uuid);
        if (callback !== undefined) {
            this._pendings.delete(uuid);
            callback.success(buffer);
        }
    }

    async _send(buffer, timeout) {
        return await new Promise((resolve, reject) => {
            let uuid = genuuid().replace(/-/g, '')
            this._pendings.set(uuid, {
                success: (response) => resolve(response),
                failure: error => reject(error)
            });

            setTimeout(() => {
                let callback = this._pendings.get(uuid);
                if (callback !== undefined) {
                    this._pendings.delete(uuid);
                    callback.failure(new Error('request timeout'));
                }
            }, timeout);

            this._tcpClient.send({uuid, buffer});
        });
    }

    async _transport(name, request, timeout) {
        return await new Promise(async(resolve, reject) => {
            try {
                const outgoingMessage = Buffer.from(JSON.stringify({command: name, payload: request}));
                let incomingMessage = await this._send(outgoingMessage, timeout);
                const responseBody = JSON.parse(incomingMessage.toString('utf8'));
                if (responseBody.status !== 0) {
                    throw new Error('internal server error');
                }
                return resolve(responseBody.payload);
            }
            catch(err) {
                return reject(err);
            }
        });
    }

}