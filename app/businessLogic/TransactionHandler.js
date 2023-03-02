module.exports = class transaction_Handler{

    constructor(db, productCollection, userCollection){
        this.db = db;
        this.productCollection = productCollection;
        this.userCollection = userCollection;
    }

    async placeOrder(buyerID, items){
        if(!Array.isArray(items)){
            throw new Error("Expected Array of items");
        }
        
        if (!this.productCollection.checkCache() || 
            !this.productCollection.checkCacheForProducts(items))
        {
            this.productCollection.loadProducts()
        }

        //Validate & Deconstruct ShopingCart
        let result = this.EvaluateShopingCart(items)
        items = result.items;
        let total = result.total;
        let vendorOrders = result.vendorOrders;
        
        //Create MainOrder
        let bulkOrder = await this.CreateOrder(buyerID, items, total)
        
        let SubOrders = []
        //Create SubOrders foreach Vendor 
        for(let key in vendorOrders)
        {    
            let value = vendorOrders[key];
            total = value.length > 1 ? value.map(a => a.price * a.amount).reduce((a,b) => a+ b) : value[0].price * value[0].amount;
            SubOrders.push(await this.CreateOrder(key, value, total, bulkOrder.id));
        }

        await this.ProcessTransaction(bulkOrder, SubOrders, buyerID);

        return {status: 200, message: "success"}
    }



    EvaluateShopingCart(items){
        let total = 0;
        let vendorOrders = [];

        items = items.map((item) => {
            let dbItem = this.productCollection.productsArray.find(prod => prod.id == item.id);
            
            //Data Validation
            item.price = dbItem.price;
            item.name = dbItem.name;
            delete item.total;
            
            //TODO: Rabattstuff
            total += parseFloat((item.price * item.amount).toFixed(2));
            
            //Deconstruct bulk order for each vendor
            let vendorUserId = Object.values(this.userCollection.users).find(e => e.vendorId == dbItem.vendorId).id
            if(vendorOrders[vendorUserId] == undefined){
                vendorOrders[vendorUserId] = []
            }
            vendorOrders[vendorUserId].push(item)

            
            return item;
        });

        return {
            items: items,
            total: total,
            vendorOrders: vendorOrders};
    }

    async CreateOrder(user, items, total, bulkOrderId = ""){
        let insertOrder = await this.db.insertOne("orders", {
            products: JSON.stringify(items,null,2),
            user: user,
            total: total,
            mainorder: bulkOrderId
            })
            .then(r => r.json())
            .then(d => d);

        return insertOrder;
    }

    async ProcessTransaction(bulk, Suborders, buyerID){
        let user = this.userCollection.getUser(buyerID)
        await this.db.updateOne("users",buyerID,{
            balance: user.balance - bulk.total
        })

        await this.userCollection.loadUser()
    }
}