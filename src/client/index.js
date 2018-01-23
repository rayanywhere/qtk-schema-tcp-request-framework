const SchemaValidater = require('../common/schema_validater.js');

module.exports = class {
    constructor({host, port, schemaDir, mode = "persistent", enableValidation = true}) {
        if (mode !== "persistent" && mode !== "instant") {
            throw new Error('mode must in persistent or instant');
        }
        const Transport = require(`./transport/${mode}`);
        this._transport = new Transport({ host, port});
        this._schemaValidator = new SchemaValidater(schemaDir);
        this._enableValidation = enableValidation;
    }

    async call(command, request, timeout = 30000) {
        let commandSchema = this._schemaValidator.resolve(command);
        if(this._enableValidation) commandSchema.requestValidator.validate(request);
        let response = await this._transport .run(command, request, timeout);
        if(this._enableValidation) commandSchema.responseValidator.validate(response);
        return response;
    }
}