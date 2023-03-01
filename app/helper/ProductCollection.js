module.exports = class productCollection{
        
    constructor(db, maxCacheMinutes = 1){
        this.db = db
        this.maxCacheMinutes = maxCacheMinutes * 60 * 1000
        this.productCollection = fetchProducts()
        this.productsLastFetched = new Date().getTime()
    }
}