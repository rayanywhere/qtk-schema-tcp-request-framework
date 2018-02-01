module.exports = async ({request, socket}) => {
    switch(request) {
        case 'hello':
            return request;
        case 'server_error': 
            throw new Error('error from server');
        case 'response_invalid': 
            return {a: 123};
    }
};