const uuid = require('uuid/v1');

module.exports.new = (eventName, entityType, entityId, data) => {
    const happenedOn = Date.now();

    return {
        eventId: uuid(),
        eventName: eventName,
        entityType: entityType,
        entityId: entityId,
        happenedOn: happenedOn,
        data: data
    }
}