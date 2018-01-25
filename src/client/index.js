const Validator = require('../validator');
const Client = require('@qtk/schema-tcp-framework').Client;
const genuuid = require('uuid/v4');

module.exports = class {
    constructor({host, port, schemaDir}) {
        this._client = new Client({host, port, validator: new Validator(schemaDir, Validator.Type.CLIENT)});
        this._pendings = new Map();
        this._now = 0;
        this._client.on("data", ({uuid, data:{command, payload}}) => {
            const callback = this._pendings.get(uuid);
            if (callback !== undefined) {
                this._pendings.delete(uuid);
                callback.success({command, payload});
            }
        });

        setInterval(() => {
            this._now += 1;
            for (const uuid of this._pendings.keys()) {
                const callback = this._pendings.get(uuid);
                if (callback.expireTime <= this._now) {
                    this._pendings.delete(uuid);
                    callback.failure(new Error('request timeout'));
                }
            }
        }, 1000);
    }

    send({command, payload, timeout = 30}) {
        return new Promise((resolve, reject) => {
            const uuid = genuuid().replace(/-/g, '');
            this._pendings.set(uuid, {
                success: (response) => resolve(response),
                failure: error => reject(error),
                expireTime: this._now + timeout
            });
            this._client.send({uuid, data:{command, payload}});
        });
    }
}