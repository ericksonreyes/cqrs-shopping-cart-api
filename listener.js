#!/usr/bin/env node
const amqp = require('./modules/amqp');
const amqpHost = 'amqp://172.17.0.1';
const amqpQueue = 'ShoppingCartQueue';
const amqpExchange = 'DomainEvents';

const callback = (msg) => {
    try {
        const event = JSON.parse(msg.content.toString());

        if (event) {
            const orderProjector = require('./projectors/orders');
            orderProjector.projectThis(event);
        }
    }
    catch (err) {
        console.log(" NodeJS: [x] %s", err);
    }
}

amqp.listen(amqpHost, amqpQueue, amqpExchange, callback);
