const fs = require('fs');
const tmpDirectory = require('temp-dir');
const productsDirectory = tmpDirectory + '/shopping-cart/products';
const products = [
    {
        "id": "product-1",
        "name": "Air Jordan 11",
        "price": 1132,
        "stock": 1000
    },
    {
        "id": "product-2",
        "name": "Air Qatar 11",
        "price": 879,
        "stock": 1000
    },
    {
        "id": "product-3",
        "name": "Air Saudi Arabia 2",
        "price": 150,
        "stock": 1000
    },
    {
        "id": "product-4",
        "name": "Air Kuwait 12",
        "price": 212,
        "stock": 1000
    }
]

module.exports.prepare = () => {
    if (!fs.existsSync(productsDirectory)) {
        fs.mkdirSync(productsDirectory, { recursive: true });
    }

    /**
     * Populate products directory if empty
     */
    const numberOfStoredProducts = fs.readdirSync(productsDirectory).length;
    const numberOfProducts = products.length;
    if (numberOfStoredProducts === 0) {
        for (let productIndex = 0; productIndex < numberOfProducts; productIndex++) {
            let product = products[productIndex];
            let productPathAndName = productsDirectory + '/' + product.id;
            fs.writeFile(productPathAndName, JSON.stringify(product), function (err) {
                if (err) throw err;
            });
        }
    }
}

module.exports.findAll = () => {
    let items = [];
    let files = fs.readdirSync(productsDirectory);

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        let file = productsDirectory + '/' + files[fileIndex];
        let storedItem = fs.readFileSync(file).toString();
        let jsonItem = JSON.parse(storedItem);
        items.push(jsonItem)
    }

    return items;
}

module.exports.findOne = (id) => {
    const productPathAndFile = productsDirectory + '/' + id;
    if (fs.existsSync(productPathAndFile) === false) {
        return null;
    }
    let storedProduct = fs.readFileSync(productPathAndFile).toString();
    return JSON.parse(storedProduct);
}