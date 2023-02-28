const fetch = require('node-fetch');

module.exports = class db_Connector{

    constructor(host){
        this.host = host
    }

    getCollection(collectionName){
        return fetch(`${this.host}/api/collections/${collectionName}/records`)
            .then(r => r.json())
    }

    insertOne(collectionName, entry){
        //TODO: Validate entry depending on collection
        return fetch(`${this.host}/api/collections/${collectionName}/records`, {
            method: 'post',
            body: JSON.stringify(entry),
            headers: {'Content-Type': 'application/json'}
        });
    }

    inserMany(collectionName, entries){
        if (Array.isArray(entries) && entries.length >= 1){
            entries.forEach(entry => {
                this.insertOne(collectionName, entry)
            });
        }
        else{
            throw new Error("no Entries to insert found")
        }
    }

    updateOne(collectionName, id, update){
        return fetch(`${this.host}/api/collections/${collectionName}/records/${id}`, {
            method: 'patch',
            body: JSON.stringify(update),
            headers: {'Content-Type': 'application/json'}
        });
    }
}