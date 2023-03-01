
const HOST = "http://localhost:42069"

var app = new Vue({
    el: '#app',
    data: {
        pageName: "products",
        products:[],
        checkout: {
            cart: []
        },
        orderHistory: []
    },
    created(){
        this.loadProducts()
    },
    methods: {
        loadProducts(){
            fetch(`${HOST}/api/getCollection/products`)
            .then(r => r.json())
            .then(d => {
                console.log(d)
                this.products = d.map(product => {
                    product.tags = product.tags.split(",");
                    product.categorie = product.categorie.split(",");
                    return product;
                })
            })
        },
        loadOrderHistory(){
            fetch(`${HOST}/api/getCollection/orders`)
            .then(r => r.json())
            .then(d => {
                console.log(d)
                d = d.map(order => {
                    let totalItems = 0
                    order.products = order.products.map(product => {
                        totalItems += product.amount
                        product.price = product.price.toFixed(2)
                        product["total"] = (product.amount * product.price).toFixed(2)
                        return product
                    })
                    order["totalItems"] = totalItems
                    order.total = order.total.toFixed(2)
                    return order
                })
                this.orderHistory = d
            })
        },
        navTo(pageName) {
            this.pageName = pageName

            if(this.pageName == "profilePage"){
                this.loadOrderHistory()
            }
        },
        addToCart(productId){
            let amount = parseInt(document.getElementById(`${productId}_cart_amount`).value)
            let productInCart = this.checkout.cart.find(e => e.id == productId)
            if(productInCart == undefined){
                let product = this.products.find(e => e.id == productId)
                this.checkout.cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    amount: amount
                })
            }else{
                productInCart.amount += amount
            }
        },
        placeOrder(){
            let data  = {
                products: this.checkout.cart
            }
            fetch(`${HOST}/api/getCollection/products`, {
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            .then(r => r.json())
            .then(d => {
                console.log(d)
            })
        }
    }
})


