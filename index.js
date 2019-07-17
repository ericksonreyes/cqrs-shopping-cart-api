const express = require('express')
const cors = require('cors')
const jwt = require('express-jwt')
const fs = require('fs');
const pathToRegexp = require('path-to-regexp')
const cartDirectory = require('temp-dir') + '/cart';

const app = express()
const port = 3000
const appSecret = 'secret-word'
const products = [
    {
        "id": "product-1",
        "name": "Air Jordan 11",
        "price": 1132
    },
    {
        "id": "product-2",
        "name": "Air Qatar 11",
        "price": 879
    },
    {
        "id": "product-i1",
        "name": "Air Saudi Arabia 2",
        "price": 150
    },
    {
        "id": "product-i1",
        "name": "Air Kuwait 12",
        "price": 212
    }
]

app.use(cors())
app.use(express.json())
app.use(
    jwt({secret: appSecret})
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
 * PUBLIC FACING ROUTES
 */
app.get('/v1/api', (req, res) => {
    res.json({'response': 'Hello World!'})
})

app.post('/v1/api/auth', (req, res) => {
    if (req.body.username === 'customer' && req.body.password === 'password') {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({
            exp: (Math.floor(Date.now() / 1000) + (60 * 60)) * 24, /** Expires in 24 hours **/
            data: {
                id: 'customer-1'
            }
        }, appSecret);
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
    res.json(products);
})


app.get('/v1/api/products/:id', (req, res) => {
    for (let productIndex = 0; productIndex < products.length; productIndex++) {
        if (products[productIndex].id === req.params.id) {
            res.json(products[productIndex])
            return
        }
    }

    res.status(404).json(
        {
            "error": [
                {
                    "code": "ProductNotFound",
                    "message": "Product Not Found.",
                    "description": "The product you are looking for does not exist in our listing."
                }
            ]
        }
    );
})


/**
 * SECURED ROUTES
 */

if (!fs.existsSync(cartDirectory)){
    fs.mkdir(cartDirectory);
}

app.get('/v1/api/cart/items', (req, res) => {
    let items = [];
    let files = fs.readdirSync(cartDirectory);

    for(let fileIndex=0; fileIndex<files.length; fileIndex++) {
        let file = cartDirectory + '/' + files[fileIndex];
        let storedItem = fs.readFileSync(file).toString();
        let jsonItem = JSON.parse(storedItem);
        items.push(jsonItem)
    }
    res.json(items);
})


app.delete('/v1/api/cart/items', (req, res) => {
    let files = fs.readdirSync(cartDirectory);

    for(let fileIndex=0; fileIndex<files.length; fileIndex++) {
        let file = cartDirectory + '/' + files[fileIndex];
        fs.unlink(file, err => {
            if (err) throw err;
        });
    }
    res.status(204);
    res.end();
})


