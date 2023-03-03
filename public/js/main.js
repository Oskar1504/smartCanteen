
const HOST = "http://localhost:42069"
const LOGIN_MAX_CACHE = 30 * 60 * 1000
let api = new ApiConnector(HOST)

var app = new Vue({
    el: '#app',
    data: {
        pageName: "products",
        products:[],
        filteredProducts:[],
        checkout: {
            cart: []
        },
        userOrderHistory: [],
        vendorOrderHistory: [],
        login: {
            username: "",
            password: "",
            userId: "",
            loggedIn: false
        },
        filters: {
            "tag": new Set(),
            "categorie": new Set(),
        },
        formDialog: {
            element: "formDialog",
            title:"",
            type:"",
            schema:[],
            open(){
                document.getElementById(this.element).showModal()
            },
            close(){
                document.getElementById(this.element).close()
            }
        },
        message: {
            visible: false,
            content: "",
            show(content, seconds = 5){
                this.content = content
                this.visible = true
                setTimeout(()=>{
                    document.getElementById("message").classList.toggle("trans")
                },100)

                setTimeout(() => {
                    this.visible = false
                }, seconds * 1000)
            }
        },
        vendorData : {}
    },
    created(){
        this.loadProducts()
        this.loadVendors()
        this.loadLoginFromCash()
        this.loadCartFromCache()
    },
    mounted(){
    },
    methods: {
        loadProducts(){
            api.get(`/api/getCollection/products`)
            .then(r => r.json())
            .then(d => {
                console.log(d)
                this.products = d.map(product => {
                    if(product.tags != ""){
                        product.tags = product.tags.split(",");
                    }else{
                        product.tags = []
                    }
                    product.categorie = product.categorie.split(",");
                    return product;
                })

                this.filterProducts()
            })
        },
        loadVendors(){
            api.get(`/api/getCollection/vendors`)
            .then(r => r.json())
            .then(d => {
                console.log(d)
                this.vendorData = Object.fromEntries(d.map(vendor => {
                    return [vendor.id, vendor]
                }))
            })
        },
        loadOrderHistory(){
            api.get(`/api/getOrderHistory`)
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
                this.userOrderHistory = d.filter(e => e.mainorder == "")
                this.vendorOrderHistory = d.filter(e => e.mainorder != "")
            })
        },
        navTo(pageName) {
            this.pageName = pageName

            if(this.pageName == "profilePage" && this.login.loggedIn){
                this.loadOrderHistory()
            }
        },
        addToCart(productId, amount = 0){
            if(amount == 0){
                amount = parseInt(document.getElementById(`${productId}_cart_amount`).value)
            }
            let productInCart = this.checkout.cart.find(e => e.id == productId)
            if(productInCart == undefined){
                let product = this.products.find(e => e.id == productId)
                this.checkout.cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    amount: amount,
                    total: (amount * product.price).toFixed(2)
                })
            }else{
                productInCart.amount += amount,
                productInCart.total = (productInCart.price * productInCart.amount).toFixed(2)
            }

            this.storeCartInCache()
        },
        removeFromCart(productId){
            let foundIndex = -1
            this.checkout.cart.find((e,i) =>{
                if(e.id == productId){
                    e.amount -= 1;
                    e.total = (e.amount * e.price).toFixed(2);
                    if(e.amount <= 0){
                        foundIndex = i
                    }
                    return true
                }
                return false
            })
            if (foundIndex != -1) {
                this.checkout.cart.splice(foundIndex, 1)
            }
        },
        placeOrder(){
            api.post("/api/placeOrder", this.checkout.cart)
            .then(r => r.json())
            .then(d => {
                console.log(d)
                app.signIn("profilePage")
                app.checkout.cart = []
                app.storeCartInCache()
            })
        },
        signIn(targetPage = "products"){
            api.setAuth(this.login.username, this.login.password)
            api.get(`/api/login`)
            .then( r => r.json())
            .then(d => {
                app.login = d

                if(!d.loggedIn){
                    console.log(d)
                    console.log("ERROR LOGIN")
                }else{
                    app.loadOrderHistory()
                    app.storeLoginInCache()
                    app.navTo(targetPage)
                }
            })
        },
        loadLoginFromCash(){
            if(localStorage.getItem("smartCanteenLogin") !=null){
                let storageLogin = JSON.parse(localStorage.getItem("smartCanteenLogin"))
                if(new Date().getTime() - storageLogin.created <= LOGIN_MAX_CACHE){
                    this.login.username = storageLogin.username
                    this.login.password = storageLogin.password
                    this.signIn()
                }
            }
        },
        storeLoginInCache(){
            localStorage.setItem("smartCanteenLogin", JSON.stringify({
                username: this.login.username,
                password: this.login.password,
                created: new Date().getTime()
            }))
        },
        toggleFilter(type, value){
            if(this.filters[type].has(value)){
                this.filters[type].delete(value)
            }else{
                this.filters[type].add(value)
            }

            this.filterProducts()
        },
        filterProducts(){
            if(this.filters.tag.size != 0 || this.filters.categorie.size != 0){
                this.filteredProducts =  this.products.filter(product => {
                    let found = 0
                    this.filters.tag.forEach(tag => {
                        if(product.tags.includes(tag)){
                            found = 1
                        }
                    })
                    this.filters.categorie.forEach(categorie => {
                        if(product.categorie.includes(categorie)){
                            found = 1
                        }
                    })
                    return found
                })
            }else{
                this.filteredProducts = this.products
            }
        },
        isFilterActive(type, val){
            return this.filters[type].has(val) ? "active": ""
        },
        logout(){
            this.pageName = "products"
            this.login.username = ""
            this.login.password = ""
            this.login.loggedIn = false
            this.login.userId = ""
        },
        openFormDialog(title, type){
            this.formDialog.title = title
            this.formDialog.type = type
            this.formDialog.schema = formSchema[type]
            this.formDialog.open()
        },
        formDialogCreate(){
            if(this.formDialog.type == "product"){
                let data = Object.fromEntries(this.formDialog.schema.map(input =>{
                    return [input.name, input.value]
                }))

                data["vendorId"] = this.login.vendorId

                api.post("/api/insertOne/products", data)
                .then(r => r.json())
                .then(d => {
                    console.log(d)
                    this.formDialog.close()
                })

            }
        },
        deleteProduct(product){
            api.delete("/api/delete/products/" + product.id)
                .then(r => r.json())
                .then(d => {
                    console.log(d)
                    app.loadProducts()
                })
        },
        cancelOrder(order){
            //TODO
        },
        loadCartFromCache(){
            if(localStorage.getItem("smartCanteenCart") !=null){
                let storageData = JSON.parse(localStorage.getItem("smartCanteenCart"))
                if(new Date().getTime() - storageData.created <= LOGIN_MAX_CACHE){
                    this.checkout.cart = storageData.cart
                }
            }
        },
        storeCartInCache(){
            localStorage.setItem("smartCanteenCart", JSON.stringify({
                cart: this.checkout.cart,
                created: new Date().getTime()
            }))
        }
        
        
    },
    computed: {
        cartLength: function(){
            if(this.checkout.cart.length >= 1){
                return this.checkout.cart.map(e => e.amount).reduce((a, b) => a+b)
            }else{
                return 0
            }
        },
        checkoutTotal: function(){
            if(this.checkout.cart.length >= 1){
                return (this.checkout.cart.map(e => e.price * e.amount).reduce((a, b) => a+b)).toFixed(2)
            }else{
                return 0
            }
        },
        usedTags: function(){
            return new Set(this.products.map(e => e.tags).flat())
        },
        usedCategories: function(){
            return new Set(this.products.map(e => e.categorie).flat())
        },
        vendorProducts: function(){
            return this.products.filter(e => e.vendorId == this.login.vendorId)
        }
    }
})


