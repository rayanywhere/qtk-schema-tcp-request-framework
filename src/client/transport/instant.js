const TcpClient = require('@qtk/tcp-framework').InstantClient;

module.exports = class Transport extends TcpClient {
    constructor({host, port}) {
        super({host, port});
    }

    run(interfaceName, request, timeout) { 
        return this._transport(interfaceName, request, timeout);
    }

    async _transport(name, request, timeout) {
        return await new Promise(async(resolve, reject) => {
            try {
                const outgoingMessage = Buffer.from(JSON.stringify({command: name, payload: request}));
                let incomingMessage = await this.request(outgoingMessage, timeout);
                const responseBody = JSON.parse(incomingMessage.toString('utf8'));
                if (responseBody.status !== 0) {
                    return reject(new Error('internal server error'));
                }
                return resolve(responseBody.payload);
            }
            catch(err) {
                return reject(err);
            }
        });
    }

}