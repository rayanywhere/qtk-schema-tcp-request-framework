const SemanticSchema = require('semantic-schema').validator;
const BaseValidator = require('@qtk/schema-tcp-framework').Validator;
const ValidationError = require('../error/validation');

module.exports = class V extends BaseValidator {
    constructor(schemaDir) {
        super();
        this._schemaDir = schemaDir;
        this._schemaCache = {};
    }

    check(uuid, {command, success, payload}) {
        if(!success) return;
        
        if(!this._schemaCache[command]) {
            const schemaDoc = require(`${this._schemaDir}/${command}`);
            this._schemaCache[command] = new SemanticSchema(schemaDoc.response);
        }

        const schema = this._schemaCache[command];
        if (!schema.validate(payload)) {
            throw new ValidationError(
                `invalid ${command}\n instance: ${JSON.stringify(payload)}\n schema: ${JSON.stringify(schema.jsonSchema)}\n error: ${schema.errorsText()}`,
                uuid,
                {command, success, payload}
            );
        }
    }
}