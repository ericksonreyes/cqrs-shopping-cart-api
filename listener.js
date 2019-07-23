#!/usr/bin/env node
const amqp = require('./modules/amqp');
const host = 'amqp://localhost';
const queue = 'NodeJS_orders';
const exchange = 'orders';

const callback = (msg) => {
    try {
        const event = JSON.parse(msg.content.toString());

        if (event) {
            const orderProjector = require('./projectors/orders');
            orderProjector.projectThis(event);
        }
    }
    catch (err) {
        console.log(" [x] %s", err);
    }
}

amqp.listen(host, queue, exchange, callback);