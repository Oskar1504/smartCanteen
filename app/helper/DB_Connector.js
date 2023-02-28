const fetch = require('node-fetch');

module.exports = class db_Connector{

    constructor(host){
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
}