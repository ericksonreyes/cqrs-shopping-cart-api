module.exports = {
    generate: (id, appSecret) => {
        const jwt = require('jsonwebtoken');
        return jwt.sign({
            exp: (Math.floor(Date.now() / 1000) + (60 * 60)) * 24, /** Expires in 24 hours **/
            data: {
                id: id
            }
        }, appSecret);
    },
    parse: (options) => {
        const jwt = require('express-jwt');
        return new jwt(options);
    },
    verify: (token, appSecret) => {

        const jwt = require('jsonwebtoken');
        return jwt.verify(token, appSecret, function (err, payload) {
            if (err) {
                throw err;
            }
            if (payload) {
                return payload.data.id;
            }
            return null;
        })
    }
}
