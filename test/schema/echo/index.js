const {string} = require('semantic-schema').describer;

const request = string().desc("请求的内容");

const response = string().desc("返回的内容");

module.exports = {response, request};