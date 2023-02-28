const express = require('express')
const fetch = require('node-fetch');

const DB_Connector = require('../helper/DB_Connector.js');


const router = express.Router();
const db = new DB_Connector("http://127.0.0.1:8090");

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

module.exports = router;