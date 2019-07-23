const amqp = require('amqplib/callback_api');
const durable = true;
const exclusive = false;
const noAck = false;

module.exports = {

    send: (host, queue, exchange, msg) => {
        const amqpMsg = JSON.stringify(msg);

        console.log(' NodeJS: Connecting to ' + host);
        amqp.connect(host, function (connectError, connection) {
            if (connectError) {
                throw connectError;
            }

            connection.createChannel(function (createChannelErr, channel) {
                if (createChannelErr) {
                    throw createChannelErr;
                }

                channel.assertExchange(exchange, 'fanout', {durable: durable});
                channel.bindQueue(queue, exchange, queue);
                channel.publish(exchange, '', Buffer.from(amqpMsg));
                console.log(" NodeJS: [x] Sent %s", amqpMsg);
            });
        });
    },
    listen: (host, queue, exchange, callback) => {
        console.log(' NodeJS: Connecting to ' + host);
        amqp.connect(host, function (connectError, connection) {
            if (connectError) {
                throw connectError;
            }

            connection.createChannel(function (createChannelErr, channel) {
                if (createChannelErr) {
                    throw createChannelErr;
                }

                channel.assertExchange(exchange, 'fanout', {
                    durable: durable
                });
                channel.assertQueue(queue, {durable: durable, exclusive: exclusive});
                channel.bindQueue(queue, exchange, queue);
                console.log(' NodeJS: Connected to ' + host);

                channel.consume(queue, (msg) => {
                    callback(msg);
                    channel.ack(msg);
                }, {noAck: noAck});
                console.log(" NodeJS: [*] Waiting for messages in %s. To exit press CTRL+C", queue);
            });
        });
    }

}