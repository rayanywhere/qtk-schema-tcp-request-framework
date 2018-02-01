const Server = require('../src/server');
const Client = require('../src/client');
const genuuid = require('uuid/v4');
const assert = require('assert');

const port = 3005;
let server = new Server({
    port,
    handlerDir: `${__dirname}/handler`,
    schemaDir: `${__dirname}/schema`
});
before('start server', async () => {
    server.start();
});

describe("#schema-tcp-request-framework", function() {
    this.timeout(10000);   

    it('should return [hello]', async function() {
        const uuid = genuuid().replace(/-/g, '');
        const client = new Client({port, schemaDir:`${__dirname}/schema`});
        const response = await client.send({command: 'echo', payload: 'hello'});
        assert(response === 'hello', 'bad response');
    });

    it('should return error if server error', async function() {
        const uuid = genuuid().replace(/-/g, '');
        const client = new Client({port, schemaDir:`${__dirname}/schema`});
        const error = await client.send({command: 'echo', payload: 'server_error'}).then(() => false).catch(err => err);
        assert(error.message == 'error from server', 'should return error');
    });

    it('should return error if request is invalid', async function() {
        const uuid = genuuid().replace(/-/g, '');
        const client = new Client({port, schemaDir:`${__dirname}/schema`});
        const error = await client.send({command: 'echo', payload: {a:123}}).then(() => false).catch(err => err);
        assert(error.message, 'should return error');
    });

    it('should return error if response is invalid', async function() {
        const uuid = genuuid().replace(/-/g, '');
        const client = new Client({port, schemaDir:`${__dirname}/schema`});
        const error = await client.send({command: 'echo', payload: 'response_invalid'}).then(() => false).catch(err => err);
        assert(error.name === 'ValidationError', 'should return error');
    });

    it('should return timeout if command doesn`t exist', async function() {
        const uuid = genuuid().replace(/-/g, '');
        const client = new Client({port, schemaDir:`${__dirname}/schema`});
        const error = await client.send({command: 'echo2', payload: 'hello', timeout: 2}).then(() => false).catch(err => err);
        assert(error.message == 'request timeout', 'should return timeout');
    });
});
