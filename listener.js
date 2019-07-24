#!/usr/bin/env node
const amqp = require('./modules/amqp');
const amqpHost = 'amqp://localhost';
const amqpQueue = 'DomainEvents';
const amqpExchange = 'ShoppingCartQueue';

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