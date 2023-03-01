module.exports = class productCollection{
        
    constructor(db, maxCacheMinutes = 30){
        this.db = db
        this.maxCacheMinutes = maxCacheMinutes * 60 * 1000
        this.loadProducts()
        this.productsLastFetched = new Date().getTime()
    }


    loadProducts(){
        this.db.getCollection("products")
            .then(d => {
                this.productsLastFetched = new Date().getTime()
                this.products = Object.fromEntries(d.items.map(e => [e.id,e]))
                this.productsArray = d.items
        })
    }

    getProduct(productId){
        this.checkCache()
        //TODO check existance
        return this.products[productId]
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