#!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const host = 'amqp://localhost';

console.log('Connecting to ' + host);


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

amqp.connect(host, function (connectError, connection) {
    if (connectError) {
        throw connectError;
    }

    connection.createChannel(function (createChannelErr, channel) {
        if (createChannelErr) {
            throw createChannelErr;
        }

        console.log('Connected to ' + host);
        const queue = 'orders';
        channel.assertQueue(queue, {durable: false});


        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, callback, {noAck: true});
    });
});
