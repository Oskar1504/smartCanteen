module.exports = class productCollection{
        
    constructor(db, maxCacheMinutes = 1){
        this.db = db
        this.maxCacheMinutes = maxCacheMinutes * 60 * 1000
        this.productCollection = loadProducts()
        this.productsLastFetched = new Date().getTime()
    }


    loadProducts(){
        this.db.getCollection("products")
            .then(d => {
                this.productsLastFetched = new Date().getTime()
                this.products = Object.fromEntries(d.items.map(e => [e.id,e]))
        })
    }

    getUser(userId){
        this.checkCache()
        //TODO check existance
        return this.users[userId]
    }

    checkCache(){
        let time = new Date().getTime()
        if(time - this.userLastFetched >= this.maxCacheMinutes){
            console.log("[USERCOLLECTION] reloading user data")
            this.loadProducts()
            return false
        }
        return true
    }
}