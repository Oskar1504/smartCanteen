require("dotenv").config()

const express = require('express')
const fetch = require('node-fetch');

const router = express.Router();

router.use(function (req, res, next) {
    if (process.env.Mode != "DEV") {
        console.log(req.headers["ope-auth-username"])
        if (req.headers["ope-auth-username"] != undefined) {
            if (req.headers["ope-auth-password"] != undefined) {
                try {
                    userCollection.login(req.headers["ope-auth-username"], req.headers["ope-auth-password"])
                    next()
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

<<<<<<< HEAD

router.get('/getCollection/:CollectionName', async (req, res) => {
    try {

        db.getCollection(req.params.CollectionName)
=======


router.get('/getProducts', async (req, res) => {
    try{
        


        //TODO make db host variable
        fetch("http://localhost:8090/api/collections/products/records")
            .then(r => r.json())
>>>>>>> 8d9c7e74fffa6fdf313a12a42ef8ef9f036f3c67
            .then(d => {
                console.log(d)
                res.json(d.items)
            })
            .catch(e => {
                res.json(e)
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
                console.log(d)
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

router.post('/insertMany/:collectionName', async (req, res) => {
    try {
        db.insertMany(req.params.collectionName, req.body)
            .then(d => {
                console.log(d)
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
                console.log(d)
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


module.exports = router;