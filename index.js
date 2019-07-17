const express = require('express')
const cors = require('cors')
const jwtReader = require('express-jwt')

const app = express()
const port = 3000
const appSecret = 'secret-word'

app.use(cors())
app.use(express.json())
app.use(jwtReader({secret: appSecret}).unless({path: ['/v1/api/auth']}));
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/v1/api', (req, res) => {
    res.json({'response': 'Hello World!'})
})

app.post('/v1/api/auth', (req, res) => {
    if (req.body.username === 'customer' && req.body.password === 'password') {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: {
                id : 'customer-1'
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
