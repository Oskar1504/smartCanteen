const express = require('express')
const fetch = require('node-fetch');

const router = express.Router();

// router.use(function (req, res, next) {
//     if(req.headers["ope-auth-username"] != ""){
//         if(req.headers["ope-auth-password"] != ""){
//             console.log("WIP / dev every auth success")
//             next()
//         }
//     }
// })



router.get('/getProducts', async (req, res) => {
    try{
        


        //TODO make db host variable
        fetch("http://localhost:8090/api/collections/products/records")
            .then(r => r.json())
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