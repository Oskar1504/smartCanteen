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
        let result = this.#EvaluateShopingCart(items)
        items = result.items;
        let total = result.total;
        let vendorOrders = result.vendorOrders;
        
        //Check for avaiable Balance
        if (!this.#checkForSufficentBalance(buyerID, total)){
            return { status: 200, message:"insufficent Balance"}
        }

        //Create MainOrder
        let bulkOrder = await this.#CreateOrder(buyerID, items, total)
        
        let SubOrders = []
        //Create SubOrders foreach Vendor 
        for(let key in vendorOrders)
        {    
            let value = vendorOrders[key];
            total = value.length > 1 ? value.map(a => a.price * a.amount).reduce((a,b) => a+ b) : value[0].price * value[0].amount;
            SubOrders.push(await this.#CreateOrder(key, value, total, bulkOrder.id));
        }

        await this.#HandleTransaction(bulkOrder, SubOrders);

        return {status: 200, message: "success"}
    }


    async cancelOrder(user, orderId){
        
        let order = await this.db.getOne("orders", orderId);

        //Cancel BulkOrder
        if(order.mainorder == "")
        {
            //MainOrder only cancleable for owning user or admin
            if(!(order.user == user || user.type == 3)){
                return {status: 400, message: "Not authorized to cancel this order"}
            }
            //Cancel only in first 10min or by admin
            if((new Date().getTime()) - order.created >= 10 * 60 * 1000 || user.type == 3){
                return {status: 400, message: "To late to cancel this order"}
            }
            
            //Backtrack Transactions & Delete Orders
            //TODO: set Order Status to "Canceled" instead of deleting
            let subOrders = this.db.GetMany("orders", `mainorder == '${order.id}'`)
            for(let sO of subOrders){
                this.#ProcessTransaction(sO.user, sO.total)
                this.#DeleteOrder(sO.id)
            }
            
            this.#ProcessTransaction(order.user, (-order.total))
            this.#DeleteOrder(orderID)

            await this.userCollection.loadUser()
        }
        //Cancel SubOrder
        else{
            let mainOrder = await this.db.getOne("orders", order.mainorder)
            let buyer = await this.userCollection.getUser(mainOrder.user)

            //Cancel only if request by vendor, buyer or admin
            if(!(user == order.user || user == buyer || user.type == 3)){
                return {status: 400, message: "Not authorized to cancle this order"}
            }
            
            //Cancel by buyer only in first 10min
            if((new Date().getTime()) - order.created >= 10 * 60 * 1000 && user == buyer && user.type != 3){
                return {status: 400, message: "To late to cancel this order"}
            }
            
            //Get all Product Ids from Main
            let productIds = [] 
            order.products.map(p => {
                productIds.push(p.id)
            })
            
            //Remove all Products of the subOrder from the MainOrder
            productIds.forEach(prodId => {
                let index = mainOrder.products.findIndex(product => product.id == prodId)
                mainOrder.products.splice(index,1)
            })
            mainOrder.total -= order.total
            
            //If all SubOrders are canceled the MainOrder is Deleted
            if(mainOrder.total <= 0 || mainOrder.products.length == 0){
                this.#DeleteOrder(mainOrder.id)
            }
            else{
                this.db.updateOne("orders", mainOrder.id, mainOrder)
            }

            this.#ProcessTransaction(buyer.id, (-order.total))
            this.#ProcessTransaction(order.user, order.total)
            this.#DeleteOrder(orderId)
        }

        return {status: 200, message: "success"}
    }

    // # means private
    #EvaluateShopingCart(items){
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

    async #CreateOrder(user, items, total, bulkOrderId = ""){
        return await this.db.insertOne("orders", {
            products: JSON.stringify(items,null,2),
            user: user,
            total: total,
            mainorder: bulkOrderId
            })
            .then(r => r.json())
            .then(d => d);

    }

    async #DeleteOrder(orderId){
        return await this.db.deleteOne("orders", orderId)
    }

    #checkForSufficentBalance(userID, total){
        let user = this.userCollection.getUser(userID);
        if (user.balance >= total){
            return true
        }
        return false
    }

    async #HandleTransaction(bulkOrder, subOrders){
        this.#ProcessTransaction(bulkOrder.user, bulkOrder.total)

        for(let order of subOrders){
            this.#ProcessTransaction(order.user, (-order.total))
        }
        
        await this.userCollection.loadUser()
    }

    async #ProcessTransaction(userID, total){
        let user = this.userCollection.getUser(userID);
        await this.db.updateOne("users",userID,{
            balance: (user.balance - total).toFixed(2)
        })
    }
    
}