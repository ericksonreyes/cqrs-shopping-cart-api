const orders = require('../modules/orders');
const moment = require('moment');


module.exports.projectThis = (event) => {
    const eventName = event.eventName;
    const entityId = event.entityId;
    const entityType = event.entityType;
    const data = event.data;
    const happenedOn = event.happenedOn;
    const context = 'Fulfillment';
    const eventDate = moment.unix(happenedOn).format("YYYY-MM-DD HH:mm:ss");

    console.log(" NodeJS: [√] %s %s.%s.%s was raised.", eventDate, context, entityType, eventName);
    if (entityType === 'Order') {
        const order = orders.findOne(entityId);
        switch (eventName) {
            case 'OrderWasPlaced':
                orders.store({
                    id: entityId,
                    status: "Pending",
                    customerId: data.customerId,
                    postedOn: happenedOn,
                    lastUpdatedOn: null,
                    items: data.items
                });
                break;
            case 'OrderWasAccepted':
                if (order) {
                    order.status = 'Accepted';
                    order.lastUpdatedOn = happenedOn;
                    orders.store(order)
                }
                break;
            case 'OrderWasShipped':
                if (order) {
                    order.status = 'Shipped';
                    order.lastUpdatedOn = happenedOn;
                    order.shipper = data.shipper;
                    order.trackingId = data.trackingId;
                    order.dateShipped = data.dateShipped;
                    orders.store(order)
                }
                break;
            case 'OrderWasCancelled':
                if (order) {
                    order.status = 'Cancelled';
                    order.lastUpdatedOn = happenedOn;
                    order.reason = data.reason;
                    orders.store(order)
                }
                break;
            case 'OrderWasCompleted':
                if (order) {
                    order.status = 'Completed';
                    order.lastUpdatedOn = happenedOn;
                    orders.store(order)
                }
                break;
        }
        const time = moment();
        const now = time.format("YYYY-MM-DD HH:mm:ss")
        console.log(" NodeJS: [√] %s Projected by order.js", now);

    }
}