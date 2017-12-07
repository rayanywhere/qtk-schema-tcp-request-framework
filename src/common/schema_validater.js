const Ajv = require('ajv');
const ajv = new Ajv();
require('ajv-keywords')(ajv, 'switch');

module.exports = class {
	static resolve(schema, interfaceName) {
		if (schema[interfaceName] == undefined) {
			return [null, `schema: ${interfaceName} is not exist`]
		}

		if ((typeof schema[interfaceName].request !== 'object') 
			|| (typeof schema[interfaceName] .response !== 'object') 
			|| (typeof schema[interfaceName] .info !== 'object')) {
			return [null, `bad format of schema ${interfaceName}, expecting request/response/info to be objects.`];
		}
		return [schema[interfaceName], null];
	}
	
	static validate(module, instance, schema) {
		if (ajv.validate(schema[module], instance)) {
			return [true, null];
		}
		return [false, `invalid ${module}\n instance:${JSON.stringify(instance)}\nschema:${JSON.stringify(schema[module])}\n${ajv.errorsText()}`];
	}
}

