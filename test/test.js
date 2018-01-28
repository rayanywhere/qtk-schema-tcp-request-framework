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
    it('should return timeout', async function() {
        const uuid = genuuid().replace(/-/g, '');
        const client = new Client({port, schemaDir:`${__dirname}/schema`});
        await client.send({command: 'echo2', payload: 'hello', timeout: 2}).then(() => {
            assert(false, 'cannot reach here');
        }).catch((err) => {});
    });
});
