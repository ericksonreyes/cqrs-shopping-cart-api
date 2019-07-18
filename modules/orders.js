const fs = require('fs');
const tmpDirectory = require('temp-dir');
const ordersDirectory = tmpDirectory + '/shopping-cart/orders';


function storeNewOrder(newOrder) {
    const orderPathAndName = ordersDirectory + '/' + newOrder.id;
    fs.writeFile(orderPathAndName, JSON.stringify(newOrder), function (err) {
        if (err) throw err;
    });
}

module.exports.prepare = () => {
    if (!fs.existsSync(ordersDirectory)) {
        fs.mkdirSync(ordersDirectory, { recursive: true });
    }
}

module.exports.findAll = () => {
    let orders = [];
    let files = fs.readdirSync(ordersDirectory);

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        let file = ordersDirectory + '/' + files[fileIndex];
        let storedOrder = fs.readFileSync(file).toString();
        let jsonOrder = JSON.parse(storedOrder);
        orders.push(jsonOrder)
    }

    return orders;
}

module.exports.store = (newOrders) => {
    if (newOrders.length > 0) {
        const newOrdersCount = newOrders.length;
        for(let newOrderIndex = 0; newOrderIndex < newOrdersCount; newOrderIndex++) {
            newOrder = newOrders[newOrderIndex];
            storeNewOrder(newOrder);
        }
        return;
    }
    storeNewOrder(newOrders);
}

module.exports.findOne = (id) => {
    const orderPathAndName = ordersDirectory + '/' + id;
    if (fs.existsSync(orderPathAndName) === false) {
        return null;
    }
    let storedOrder = fs.readFileSync(orderPathAndName).toString();
    return JSON.parse(storedOrder);
}

module.exports.remove = (id) => {
    const orderPathAndName = ordersDirectory + '/' + id;
    if (fs.existsSync(orderPathAndName)) {
        fs.unlink(orderPathAndName, err => {
            if (err) throw err;
        });
    }
}