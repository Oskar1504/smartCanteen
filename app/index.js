require("dotenv").config()
const express = require('express')

const ApiRouter = require('./router/api');

const app = express()

app.use(express.json())

app.use(function (req, res, next) {
    console.log(req.originalUrl.split("?")[0])

    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "POST,GET,DELETE")
    res.header("Access-Control-Allow-Headers","Content-Type,ope-auth-username,ope-auth-password")
    res.header('Content-Type', 'application/json')
    next()
})

app.use('/api', ApiRouter);

app.get('/', async function (req, res) {
    res.json(`hey, i am ${process.env.PROJECT_NAME} and alife`)
})


app.listen(process.env.PORT, function () {
    console.log(`${process.env.PROJECT_NAME} is running at http://localhost:${process.env.PORT}`)
})