const fs = require('fs');
const tmpDirectory = require('temp-dir');
const cartDirectory = tmpDirectory + '/shopping-cart/cart';

function storeNewItem(newItem) {
    const itemPathAndName = cartDirectory + '/' + newItem.id;
    fs.writeFile(itemPathAndName, JSON.stringify(newItem), function (err) {
        if (err) throw err;
        console.log(itemPathAndName + ' was created.');
    });
}

module.exports.prepare = () => {
    if (!fs.existsSync(cartDirectory)) {
        fs.mkdirSync(cartDirectory, { recursive: true });
    }
}

module.exports.findAll = () => {
    let items = [];
    let files = fs.readdirSync(cartDirectory);

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        let file = cartDirectory + '/' + files[fileIndex];
        let storedItem = fs.readFileSync(file).toString();
        let jsonItem = JSON.parse(storedItem);
        items.push(jsonItem)
    }

    return items;
}

module.exports.empty = () => {
    let files = fs.readdirSync(cartDirectory);

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        let file = cartDirectory + '/' + files[fileIndex];
        fs.unlink(file, err => {
            if (err) throw err;
        });
    }
}

module.exports.store = (newItems) => {
    if (newItems.length > 0) {
        const newItemsCount = newItems.length;
        for(let newItemIndex = 0; newItemIndex < newItemsCount; newItemIndex++) {
            newItem = newItems[newItemIndex];
            storeNewItem(newItem);
        }
        return;
    }
    storeNewItem(newItems);
}

module.exports.findOne = (id) => {
    const itemPathAndName = cartDirectory + '/' + id;
    if (fs.existsSync(itemPathAndName) === false) {
        return null;
    }
    let storedItem = fs.readFileSync(itemPathAndName).toString();
    return JSON.parse(storedItem);
}

module.exports.remove = (id) => {
    const itemPathAndName = cartDirectory + '/' + id;
    if (fs.existsSync(itemPathAndName)) {
        fs.unlink(itemPathAndName, err => {
            if (err) throw err;
        });
    }
}