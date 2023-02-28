const fetch = require('node-fetch');

module.exports = class db_Connector{

    constructor(host = "http://127.0.0.1:8090"){
        this.host = host
    }

    getCollection(collectionName){
        return fetch(`${this.host}/api/collections/${collectionName}/records`)
            .then(r => r.json())

            .then(d => {
                if(d.code == 403){
                    throw new Error("error" + d.message)
                }
                return d
            })

    }

    insertOne(collectionName, entry){
        //TODO: Validate entry depending on collection
        return fetch(`${this.host}/api/collections/${collectionName}/records`, {
            method: 'post',
            body: JSON.stringify(entry),
            headers: {'Content-Type': 'application/json'}
        })
    }

    async inserMany(collectionName, entries ,debug = false){
        let o = []
        if (Array.isArray(entries) && entries.length >= 1){
            for(let entry of entries){
                if(debug){
                    await this.insertOne(collectionName, entry)
                    .then(r => r.json())
                    .then(d => {
                        o.push(d)
                    })
                }else{
                    await this.insertOne(collectionName, entry)
                }
            }
            return o
        }
        else{
            throw new Error("no Entries to insert found")
        }

    }
}