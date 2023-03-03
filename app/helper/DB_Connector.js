const fetch = require('node-fetch');

module.exports = class db_Connector{

    constructor(host = "http://127.0.0.1:8090"){
        this.host = host
    }

    getCollection(collectionName){
        return fetch(`${this.host}/api/collections/${collectionName}/records?perPage=100`)
            .then(r => r.json())
            .then(d => {
                if(d.code == 403){
                    console.log("[DB_CONNECTOR] error" + d.message)
                    throw new Error("[DB_CONNECTOR] error" + d.message)
                }
                return d
            })
    }

    getOne(collectionName, idString){
        return fetch(`${this.host}/api/collections/${collectionName}/records/${idString}`)
            .then(r => r.json())
            .then(d => {
                if(d.code == 403){
                    console.log("[DB_CONNECTOR] error" + d.message)
                    throw new Error("[DB_CONNECTOR] error" + d.message)
                }
                return d
            })
    }
        
    getMany(collectionName, filter){
        console.log(filter)
        return fetch(`${this.host}/api/collections/${collectionName}/records?filter=(${filter})`)
            .then(r => r.json())
            .then(d => {
                if(d.code == 403){
                    console.log("[DB_CONNECTOR] error" + d.message)
                    throw new Error("[DB_CONNECTOR] error" + d.message)
                }
                return d
            })    
    }

    insertOne(collectionName, entry){
        //TODO: Validate entry depending on collection
        return fetch(`${this.host}/api/collections/${collectionName}/records`, {
            method: 'POST',
            body: JSON.stringify(entry),
            headers: {'Content-Type': 'application/json'}
        })
    }

    async insertMany(collectionName, entries ,debug = false){
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

    updateOne(collectionName, id, update){
        return fetch(`${this.host}/api/collections/${collectionName}/records/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(update),
            headers: {'Content-Type': 'application/json'}
        });
    }

    deleteOne(collectionName, id){
        return fetch(`${this.host}/api/collections/${collectionName}/records/${id}`,{
            method: 'DELETE'
        });
    }
}