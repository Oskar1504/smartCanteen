require("dotenv").config()
const express = require('express')
const fetch = require('node-fetch');

const DB_Connector = require('../helper/DB_Connector.js');
const UserCollection = require('../helper/UserCollection.js');
const ProductCollection = require('../helper/ProductCollection.js')
const RouteMapping = require('../helper/RouteMapping.js');
const transaction_Handler = require('../businessLogic/TransactionHandler.js')


const db = new DB_Connector("http://127.0.0.1:8090");
const userCollection = new UserCollection(db, 0)
const productCollection = new ProductCollection(db, 60)
const router = express.Router();
const transactionHandler = new transaction_Handler(db, productCollection, userCollection)

//TODO getproducts should always work
let routeMapping = new RouteMapping({
    "3": ["insert"],
    "2": ["delete","insertOne/products","insertMany/products","update"],
    "1": ["getCollection"],
    "0":[]
}).get()


router.use(function (req, res, next) {
    if (process.env.MODE != "DEV") {
        console.log(req.headers["ope-auth-username"])
        if (req.headers["ope-auth-username"] != undefined) {
            if (req.headers["ope-auth-password"] != undefined) {
                try {
                    let user = userCollection.login(req.headers["ope-auth-username"], req.headers["ope-auth-password"])
                    let allowed = false
                    routeMapping[user.type].forEach(routePart => {
                        if(req.originalUrl.includes(routePart)){
                            allowed = true
                        }
                    });

                    if(allowed){
                        next()
                    }else{
                        res.json({
                            status: 500,
                            message: "user not allowed to perform this action"
                        })

                    }
                } catch (error) { 
                    res.json(error.toString())
                }
            } else {
                res.json({
                    status: 500,
                    message: "ope-auth-password header is missing in request"
                })
            }
        } else {
            res.json({
                status: 500,
                message: "ope-auth-username header is missing in request"
            })
        }
    }
    else{
        next()
    }
})


router.get('/getCollection/:CollectionName', async (req, res) => {
    try {
        db.getCollection(req.params.CollectionName)
            .then(d => {
                res.json(d.items)
            })
            .catch(e => {
                res.json(e.toString())
            })
    }
    catch (e) {
        res.json(e)
    }
})

router.get('/getEntry/:CollectionName/:id', async (req, res) => {
    try{
        db.getOne(req.params.CollectionName, req.params.id)
            .then(d => {
                res.json(d)
            })
            .catch(e => {
                res.json(e.toString())
            })
    }
    catch (e) {
        res.json(e)
    }})

router.get('/login', async (req, res) => {
    try {
        let user = userCollection.login(req.headers["ope-auth-username"], req.headers["ope-auth-password"])
        res.json({
            username: user.username,
            password: user.password,
            userId: user.id,
            vendorId: user.vendorId,
            type: user.type,
            loggedIn: true,
            balance: user.balance
        })
    }
    catch (e) {
        res.json(e)
    }
})
router.get('/getOrderHistory', async (req, res) => {
    try {
        let user = userCollection.login(req.headers["ope-auth-username"], req.headers["ope-auth-password"])
        db.getCollection("orders")
        .then(orders => {
            res.json(orders.items.filter(e => e.user == user.id))
        })
        .catch(e => {
            res.json(e.toString())
        })
    }
    catch (e) {
        res.json(e)
    }
})

router.post('/insertOne/:collectionName', async (req, res) => {
    try {
        db.insertOne(req.params.collectionName, req.body)
            .then(d => {
                res.json(d)
                productCollection.loadProducts()
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch (e) {
        res.json(e)
    }
})

router.post('/insertMany/:collectionName', async (req, res) => {
    try {
        db.insertMany(req.params.collectionName, req.body)
            .then(d => {
                res.json(d)
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch (e) {
        res.json(e)
    }
})

router.patch('/update/:collectionName/:id', async (req, res) => {
    try{
        db.updateOne(req.params.collectionName, req.params.id, req.body)
            .then(d => {
                res.json(d)
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch (e) {
        res.json(e)
    }
})

router.delete('/delete/:collectionName/:id', async (req, res) => {
    try{
        db.deleteOne(req.params.collectionName, req.params.id)
            .then(d => {
                res.json(d)
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch (e) {
        res.json(e)
    }
})

router.post('/placeOrder', async (req, res) => {
    try {
        let user = userCollection.login(req.headers["ope-auth-username"], req.headers["ope-auth-password"])
        res.json(
            await transactionHandler.placeOrder(user.id, req.body)
        )
    }
    catch (e) {
        res.json(e.toString())
    }
})

module.exports = router;