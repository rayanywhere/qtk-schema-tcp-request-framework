const schemaValidater = require('../common/schema_validater.js');

module.exports = class {
    constructor({host, port, schemaDir, mode = "persistent"}) {
        if (mode !== "persistent" && mode !== "instant") {
            throw new Error('mode must in persistent or instant');
        }
        const Transport = require(`./transport/${mode}`);
        this._transport = new Transport({ host, port});
        this._schema = require(schemaDir);
    }

    async call(interfaceName, request, timeout = 30000) {
        let interfaceSchema,isValid, errMsg;
        [interfaceSchema, errMsg] = schemaValidater.resolve(this._schema, interfaceName);
        if (interfaceSchema == undefined) {
            throw new Error(errMsg);
        }

        [isValid, errMsg] = schemaValidater.validate('request', request, interfaceSchema);
        if (!isValid) { throw new Error(errMsg); }

        let response = await this._transport .run(interfaceName, request, timeout);

        [isValid, errMsg] = schemaValidater.validate('response', response, interfaceSchema);
        if (!isValid) { throw new Error(errMsg);  }
        
        return response;
    }
}