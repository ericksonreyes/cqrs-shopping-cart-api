const orders = require('../modules/orders');

module.exports.projectThis = (event) => {
    const eventName = event.eventName;
    const entityId = event.entityId;
    const entityType = event.entityType;
    const data = event.data;
    const happenedOn = event.happenedOn;

    if (entityType === 'Order') {
        const order = orders.findOne(entityId);
        switch (eventName) {
            case 'OrderWasCreated':
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
                    orders.store(order)
                }
                break;
            case 'OrderWasCancelled':
                if (order) {
                    order.status = 'Cancelled';
                    order.lastUpdatedOn = happenedOn;
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
        console.log(" [√] %s was projected", eventName);
    }
}