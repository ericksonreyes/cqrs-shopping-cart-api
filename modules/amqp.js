const amqp = require('amqplib/callback_api');

module.exports = {

    send: (host, queue, msg) => {
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

                channel.assertQueue(queue, {durable: false});
                channel.sendToQueue(queue, Buffer.from(amqpMsg));
                console.log(" [x] Sent %s", amqpMsg);
            });
        });
    },
    listen: (host, queue, callback) => {
        console.log('Connecting to ' + host);
        amqp.connect(host, function (connectError, connection) {
            if (connectError) {
                throw connectError;
            }

            connection.createChannel(function (createChannelErr, channel) {
                if (createChannelErr) {
                    throw createChannelErr;
                }

                console.log('Connected to ' + host);
                channel.assertQueue(queue, {durable: false});

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
                channel.consume(queue, callback, {noAck: true});
            });
        });
    }

}