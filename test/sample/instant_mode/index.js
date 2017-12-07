const Client = require("../../../").Client;
const serverIp = "127.0.0.1";
const serverPort = 3005;

describe("#instant-mode", function() {
    it('should return hi', async function () {
        let client = new Client({
            host : serverIp,
            port : serverPort,
            schemaDir: `${__dirname}/../../common/schema`,
            mode: "instant"
        })
        let response = await client.call("test", "hi");
        assert(response.requestField === 'hi', 'incorrect response');
    });

    it('should return 500', async function () {
        let client = new Client({
            host : serverIp,
            port : serverPort,
            schemaDir: `${__dirname}/../../common/schema`,
            mode: "instant"
        })
       
        try {
            let response = await client.call("error.test", "hi");
        }
        catch (err) {
            assert (err.message == "internal server error", 'incorrect response');
        }
    });

    it('should return request timeout', async function () {
        let client = new Client({
            host : serverIp,
            port : serverPort,
            schemaDir: `${__dirname}/../../common/schema`,
            mode: "instant"
        })
        try {
            await client.call("test", "hi", 50); //server will sleep 100ms before response
        }
        catch (err) {
            assert (err.message == "request timeout", 'incorrect response');
        }
    });
});