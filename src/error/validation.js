module.exports = class extends Error {
    constructor(message, uuid, data) {
        super(message);
        this.name = 'ValidationError';
        this.uuid = uuid;
        this.data = data;
    }
}