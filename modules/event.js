const uuid = require('uuid/v1');

module.exports.new = (eventName, raisedBy, entityType, entityId, data) => {
    const happenedOn = Math.floor(Date.now() / 1000);

    data.entityId = entityId;
    data.raisedBy = raisedBy;
    data.entityType = entityType;
    return {
        eventId: uuid(),
        eventName: eventName,
        entityType: entityType,
        entityId: entityId,
        happenedOn: happenedOn,
        raisedBy: raisedBy,
        data: data
    }
}