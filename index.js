const express = require('express')
const jwt = require('./modules/jwt')
const cors = require('cors')
const pathToRegexp = require('path-to-regexp')
const products = require('./modules/products');
const cart = require('./modules/cart');

const app = express()
const port = 3000
const appSecret = 'secret-word'

app.use(cors())
app.use(express.json())
app.use(
    jwt.parse({secret: appSecret})
        .unless(
            {
                path: [
                    pathToRegexp('/v1/api/auth'),
                    pathToRegexp('/v1/api/products'),
                    pathToRegexp('/v1/api/products/:id')
                ]
            }
        )
);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


/**
 * Prepare the modules to be used
 */
products.prepare();
cart.prepare();


/**
 * PUBLIC FACING ROUTES
 */
app.get('/v1/api', (req, res) => {
    res.json({'response': 'Hello World!'})
})

app.post('/v1/api/auth', (req, res) => {
    if (req.body.username === 'customer' && req.body.password === 'password') {
        const token = jwt.generate('customer-id', appSecret);
        res.json({'accessToken': token})
        return
    }

    res.status(403).json(
        {
            "error": [
                {
                    "code": "AccessDenied",
                    "message": "Login Failed.",
                    "description": "Incorrect username or password."
                }
            ]
        }
    );
})

app.get('/v1/api/products', (req, res) => {
    res.json(products.findAll());
})

app.get('/v1/api/products/:id', (req, res) => {
    if (products.findOne(req.params.id) === null) {
        res.status(404).json(
            {
                "error": [
                    {
                        "code": "ProductNotFound",
                        "message": "Product not found.",
                        "description": "The product with id " + req.params.id + " does not exist."
                    }
                ]
            }
        );
    }

    res.json(products.findOne(req.params.id));
})


/**
 * SECURED ROUTES
 */

app.get('/v1/api/cart/items', (req, res) => {
    let items = cart.findAll();
    res.json(items);
})

app.post('/v1/api/cart/items', (req, res) => {
    const newItems = req.body;
    const numberOfNewItems = newItems.length;

    if (numberOfNewItems > 0) {
        const uuid = require('uuid/v1');
        let newItemsToBeStored = [];

        for (let itemIndex = 0; itemIndex < numberOfNewItems; itemIndex++) {
            let newItem = newItems[itemIndex];

            if (newItem.hasOwnProperty('productId') && newItem.hasOwnProperty('quantity')) {
                let product = products.findOne(newItem.productId);

                if (newItem.quantity < 1) {
                    res.status(422).json(
                        {
                            "error": [
                                {
                                    "code": "InvalidPurchaseQuantity",
                                    "message": "Invalid purchase quantity.",
                                    "description": "You must purchase at least one product with id " + newItem.productId
                                }
                            ]
                        }
                    );
                    return;
                }

                if (product === null) {
                    res.status(422).json(
                        {
                            "error": [
                                {
                                    "code": "ProductNotFound",
                                    "message": "Product not found.",
                                    "description": "The product with id " + newItem.productId + " does not exist."
                                }
                            ]
                        }
                    );
                    return;
                }

                if (product.stock < newItem.quantity) {
                    res.status(422).json(
                        {
                            "error": [
                                {
                                    "code": "ProductOutOfStock",
                                    "message": "Product out of stock.",
                                    "description": "We no longer have enough stock of product with id " + newItem.productId
                                }
                            ]
                        }
                    );
                    return;
                }

                let newItemToBeStored = {
                    id: uuid(),
                    productId: product.id,
                    price: product.price,
                    status: 'Order placed.',
                    quantity: newItem.quantity
                }
                newItemsToBeStored.push(newItemToBeStored);
            }
        }


        if (newItemsToBeStored.length > 0) {
            cart.store(newItemsToBeStored);
            res.status(201).json(newItemsToBeStored);
        }
    }

    res.status(400).json(
        {
            "error": [
                {
                    "code": "BadRequest",
                    "message": "Malformed request body.",
                    "description": "Your request body must be an array of product id and quantity."
                }
            ]
        }
    );
})

app.delete('/v1/api/cart/items', (req, res) => {
    cart.empty();
    res.status(204);
    res.end();
})
