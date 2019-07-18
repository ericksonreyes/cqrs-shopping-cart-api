const express = require('express')
const jwt = require('./modules/jwt')
const cors = require('cors')
const pathToRegexp = require('path-to-regexp')
const products = require('./modules/products');
const cart = require('./modules/cart');
const orders = require('./modules/orders');
const uuid = require('uuid/v1');

const app = express()
const port = 3000
const appSecret = 'secret-word'
let customerId = null;

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

app.use(function(req,res,next){
    const token = req.headers.authorization.split(" ")[1]
    customerId = jwt.verify(token, appSecret);
    next()
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


/**
 * Prepare the modules to be used
 */
products.prepare();
cart.prepare();
orders.prepare();


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
    const product = products.findOne(req.params.id);
    if (product === null) {
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

    res.json(product);
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
        let newItemsToBeStored = [];

        for (let itemIndex = 0; itemIndex < numberOfNewItems; itemIndex++) {
            let newItem = newItems[itemIndex];

            if (newItem.hasOwnProperty('productId') && newItem.hasOwnProperty('quantity')) {
                let product = products.findOne(newItem.productId);

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

                let newItemToBeStored = {
                    id: uuid(),
                    productId: product.id,
                    price: product.price,
                    status: 'Added to cart',
                    quantity: newItem.quantity
                }
                newItemsToBeStored.push(newItemToBeStored);
            }
        }


        if (newItemsToBeStored.length > 0) {
            cart.store(newItemsToBeStored);
            res.status(201).json(newItemsToBeStored);
            return;
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

app.put('/v1/api/cart/items/:id/quantity', (req, res) => {
    const newQuantity = req.body.newQuantity;
    const cartItem = cart.findOne(req.params.id);
    if (cartItem === null) {
        res.status(404).json(
            {
                "error": [
                    {
                        "code": "CartItemNotFound",
                        "message": "Cart item not found.",
                        "description": "The cart item you are looking for does not exist."
                    }
                ]
            }
        );
    }

    if (newQuantity < 1) {
        res.status(422).json(
            {
                "error": [
                    {
                        "code": "InvalidPurchaseQuantity",
                        "message": "Invalid purchase quantity.",
                        "description": "You must purchase at least one product with id " + cartItem.productId
                    }
                ]
            }
        );
        return;
    }

    if (newQuantity !== cartItem.quantity) {
        cartItem.quantity = newQuantity;
        cart.store([cartItem]);
    }

    res.status(204);
    res.end();
})

app.delete('/v1/api/cart/items/:id', (req, res) => {
    const cartItem = cart.findOne(req.params.id);
    if (cartItem === null) {
        res.status(404).json(
            {
                "error": [
                    {
                        "code": "CartItemNotFound",
                        "message": "Cart item not found.",
                        "description": "The cart item you are looking for does not exist."
                    }
                ]
            }
        );
    }
    cart.remove(req.params.id);
    res.status(204);
    res.end();
})

app.post('/v1/api/cart/checkout', (req, res) => {

    let items = cart.findAll();
    let newOrder =   {
        id: uuid(),
        status: "Order Created",
        customerId: customerId,
        postedOn: Date.now(),
        lastUpdatedOn: null,
        items: []
    }
    const itemCount = items.length;

    for(let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        let item = items[itemIndex];

        newOrder.items.push({
            id: uuid(),
            productId: item.productId,
            price: item.price,
            quantity: item.quantity
        });
    }

    if (newOrder.items.length > 0) {
        orders.store(newOrder);
        cart.empty();
        res.status(201).json(newOrder);
        return;
    }

    res.status(422).json(
        {
            "error": [
                {
                    "code": "EmptyShoppingCart",
                    "message": "Empty shopping cart.",
                    "description": "Your shopping cart is empty. Nothing to order."
                }
            ]
        }
    );
})


app.get('/v1/api/orders', (req, res) => {
    res.json(orders.findAll());
});

app.get('/v1/api/orders/:id', (req, res) => {
    const order = orders.findOne(req.params.id);
    if (order === null) {
        res.status(404).json(
            {
                "error": [
                    {
                        "code": "OrderNotFound",
                        "message": "Order not found.",
                        "description": "The order with id " + req.params.id + " does not exist."
                    }
                ]
            }
        );
    }

    res.json(order);
})

app.put('/v1/api/orders/:id/cancel', (req, res) => {
    const order = orders.findOne(req.params.id);
    if (order === null) {
        res.status(404).json(
            {
                "error": [
                    {
                        "code": "OrderNotFound",
                        "message": "Order not found.",
                        "description": "The order with id " + req.params.id + " does not exist."
                    }
                ]
            }
        );
    }

    if (order.status === 'Cancelled') {
        res.status(422).json(
            {
                "error": [
                    {
                        "code": "OrderAlreadyCancelled",
                        "message": "Order already cancelled.",
                        "description": "Your order with id " + cartItem.productId + " was already cancelled."
                    }
                ]
            }
        );
        return;
    }

    if (order.status === 'Processing') {
        res.status(422).json(
            {
                "error": [
                    {
                        "code": "OrderIsBeingProcessed",
                        "message": "Order is being processed.",
                        "description": "Your order with id " + cartItem.productId + " is being prepared " +
                            "and can't be cancelled."
                    }
                ]
            }
        );
        return;
    }

    if (order.status === 'Shipped') {
        res.status(422).json(
            {
                "error": [
                    {
                        "code": "OrderWasShipped",
                        "message": "Order was shipped.",
                        "description": "Your order with id " + cartItem.productId + " was already shipped " +
                            "and can't be cancelled."
                    }
                ]
            }
        );
        return;
    }

    if (order.status === 'Completed') {
        res.status(422).json(
            {
                "error": [
                    {
                        "code": "OrderWasCompleted",
                        "message": "Order was completed.",
                        "description": "Your order with id " + cartItem.productId + " was already completed " +
                            "and can't be cancelled."
                    }
                ]
            }
        );
        return;
    }

    order.status = 'Cancelled';
    orders.store([order]);
    res.status(204);
    res.end();
})
