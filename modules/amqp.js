const amqp = require('amqplib/callback_api');
const durable = true;
const exclusive = false;

module.exports = {

    send: (host, queue, exchange, msg) => {
        const amqpMsg = JSON.stringify(msg);

        console.log('Connecting to ' + host);
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
                channel.publish(exchange, queue, Buffer.from(amqpMsg));

                console.log(" [x] Sent %s", amqpMsg);
            });
        });
    },
    listen: (host, queue, exchange, callback) => {
        console.log('Connecting to ' + host);
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

                console.log('Connected to ' + host);
                channel.assertQueue(queue, {durable: durable, exclusive: exclusive});

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
                channel.consume(queue, callback, {noAck: false});
            });
        });
    }

}