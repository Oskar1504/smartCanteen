const express = require('express')
const fetch = require('node-fetch');

const DB_Connector = require('../helper/DB_Connector.js');
const UserCollection = require('../helper/UserCollection.js');


const db = new DB_Connector("http://127.0.0.1:8090");
const userCollection = new UserCollection(db)
const router = express.Router();

router.use(function (req, res, next) {
    console.log(req.headers["ope-auth-username"])
    if(req.headers["ope-auth-username"] != undefined){
        if(req.headers["ope-auth-password"] != undefined){
            try {
                userCollection.login(req.headers["ope-auth-username"], req.headers["ope-auth-password"])
                next()
            } catch (error) {
                res.json(error.toString())
            }
        }else{
            res.json({
                status:500,
                message: "ope-auth-password header is missing in request"
            })
        }
    }else{
        res.json({
            status:500,
            message: "ope-auth-username header is missing in request"
        })
    }
})



router.get('/getProducts', async (req, res) => {
    try{
        
        db.getCollection("products")
            .then(d => {
                console.log(d)
                res.json(d.items)
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch(e){
        res.json(e)
    }
})

router.post('/insertOne/:CollectionName', async (req, res) => {
    try{

        db.insertOne("req.params.collectionName", req.body)
            .then(d => {
                console.log(d)
                res.json(d)
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch(e){
        res.json(e)
    }
})

router.post('/insertMany/:collectionName', async (req, res) => {
    try{

        db.insertMany(req.params.collectionName, req.body)
            .then(d => {
                console.log(d)
                res.json(d)
            })
            .catch(e => {
                res.json(e)
            })
    }
    catch(e){
        res.json(e)
    }
})


module.exports = router;