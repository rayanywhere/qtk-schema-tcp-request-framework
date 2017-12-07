const Client = require("../../").Client;

let client = new Client({
    host : '127.0.0.1',
    port : 3005,
    schemaDir: `${__dirname}/../schema`,
    mode: "persistent"
}, )

Promise.resolve().then(async () => {
    let response = await client.call("test", "hi", 5000);
    console.log(response);
}).catch((err)=>{
    console.log(err) 
})



