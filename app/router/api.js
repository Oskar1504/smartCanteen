const express = require('express')

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
        
        res.json(["json","daw"])
    }
    catch(e){
        res.json(e)
    }
})

module.exports = router;