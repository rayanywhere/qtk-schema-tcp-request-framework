const SemanticSchema = require('semantic-schema').validator;
const BaseValidator = require('@qtk/schema-tcp-framework').Validator;


module.exports = class V extends BaseValidator {
    static get Type() {
        return {
            SERVER: 0,
            CLIENT: 1
        };
    }
    
    constructor(schemaDir, type) {
        super();
        this._schemaDir = schemaDir;
        this._type = type;
        this._schemaCache = {};
    }

    check({command, payload}) {
        if(!this._schemaCache[command]) {
            const schemaDoc = require(`${this._schemaDir}/${command}`);
            this._schemaCache[command] = new SemanticSchema((this._type === V.Type.SERVER) ? schemaDoc.request : schemaDoc.response);
        }

        const schema = this._schemaCache[command];
        if (!schema.validate(payload)) {
            throw new Error(`invalid ${command}\n instance: ${JSON.stringify(payload)}\n schema: ${JSON.stringify(schema.jsonSchema)}\n error: ${schema.errorStr}`);
        }
    }
}