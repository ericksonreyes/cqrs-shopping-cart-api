# CQRS &amp; Event Sourcing Inspired Shopping Cart REST API

This will be the Shopping Cart REST API that will place orders to the [Order Fulfillment REST API](https://github.com/ericksonreyes/cqrs-order-fulfillment-api). 

## Description
Our goal is to show how CQRS and Event Sourcing works but with minimal configuration so instead of asking you
to install MySQL or MongoDB we will just use your Operating System's tmp directory for data storage. The codes will be 
straight-forward with no unit testing or too much design patterns and architecture involved. Everything will be simple. 

This repository will play as your public facing Shopping Cart REST API server that your website or mobile applications will consume.
Let's pretend that it will be in it's own server (NodeJS) with it's own storage (tmp folder).

The REST API saves your cart to the storage but not the Orders. When you checkout your cart, the REST API sends a Domain Event
to the RabbitMQ which publishes it to all it's subscribers.

The [event listener](./listener.js) will generate a projection of the Order from the Domain Event so make sure it is running. 
The projection will be saved in the tmp folder too. You will see it in the order end point. 
 

## Requirements
* [NodeJS](https://nodejs.org/)
* [RabbitMQ](https://www.rabbitmq.com/)

## Installation
* Run ```npm install```

## Starting the application
* Run ```npm start``` to start the REST API server.
* Run ```npm run listener``` to start the event listener. 

## How to use
You can use the content of the [OpenAPI specification](./swagger.yml) of the REST API in the following:

* [Swagger Editor](https://editor.swagger.io)
* [Postman](https://www.getpostman.com)

The expressjs and swagger.yml host is already http://localhost:3000 by default. So no need to configure much and just test the application.
Also the application is using the default credentials of RabbitMQ (guest/guest) so no need to configure it too. Keep the [Order Fulfillment REST API](https://github.com/ericksonreyes/cqrs-order-fulfillment-api) application up and running together with this application.

## Built With

* [NodeJS](https://nodejs.org/)
* [ExpressJS](https://expressjs.com/)
* [RabbitMQ](https://www.rabbitmq.com/)

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ericksonreyes/cqrs-shopping-cart-api/tags). 

## Author

* **Erickson Reyes** - *Initial work* - [ericksonreyes](https://github.com/ericksonreyes)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
