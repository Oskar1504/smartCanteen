module.exports = class transaction_Handler{

    constructor(db, productCollection){
        this.db = db;
        this.productCollection = productCollection;
    }

    async placeOrder(buyerID, items){
        if(!Array.isArray(items)){
            throw new Error("Expected Array of items");
        }
        
        if (!this.productCollection.checkCache() && !items.every(item => this.productCollection.productsArray.find(prod => prod.id == item.id))){
            this.productCollection.loadProducts()
        }

        let total = 0;
        
        let vendorOrders = {}
        items = items.map((item) => {
            let dbItem = this.productCollection.productsArray.find(prod => prod.id == item.id);
            //TODO: Rabattstuff
            item.price = dbItem.price;
            total += parseFloat((item.price * item.amount).toFixed(2));
            delete item.total;

            if(vendorOrders[dbItem.vendor] == undefined){
                vendorOrders[dbItem.vendor] = []
            }
            vendorOrders[dbItem.vendor].push(item)

            
            return item;
        })
        
        let insertOrder = await this.db.insertOne("orders", {
            products: JSON.stringify(items,null,2),
            user: buyerID,
            total: total
        })
        .then(r => r.json())
        .then(d => d)
        
        for(let key in vendorOrders){
            let value = vendorOrders[key]
            console.log(value)

            await this.db.insertOne("orders", {
                products: JSON.stringify(value,null,2),
                user: key,
                total: value.length > 1 ? value.map(a => a.price * a.amount).reduce((a,b) => a+ b) : value[0].price * value[0].amount,
                mainorder: insertOrder.id
            })
        }

        return {status: 200, message: "success"}
    }
}