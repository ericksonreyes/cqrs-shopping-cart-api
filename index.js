const express = require('express')
const cors = require('cors')
const jwtReader = require('express-jwt')

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
    jwtReader({secret: appSecret})
        .unless(
            {
                path: [
                    '/v1/api/auth',
                    '/v1/api/products',
                    '/v1/api/products/:id',
                ]
            }
        )
);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/**
 * ROUTES
 */
app.get('/v1/api', (req, res) => {
    res.json({'response': 'Hello World!'})
})

app.post('/v1/api/auth', (req, res) => {
    if (req.body.username === 'customer' && req.body.password === 'password') {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
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
