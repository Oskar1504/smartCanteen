
const HOST = "http://localhost:42069"

var app = new Vue({
    el: '#app',
    data: {
        message: 'dadwa Vue!',
        showUsers: false,
        pageName: "products",
        users: [
            {
                name: "oskar",
                age: 21
            },
            {
                name: "julian",
                age: 221
            },
            {
                name: "max",
                age: 241
            },
        ],
        products:[],
        checkout: {
            cart: [
                "test",
                "test",
                "test",
            ]
        },
        userfunctions: {
            test: function(){
                console.log("test aus data")
                console.log(app.checkout)
            },
            test2: function(){
                console.log("test 2222aus data")
                console.log(app.checkout)
            }
        }
    },
    created(){
        this.loadProducts()
    },
    methods: {
        loadProducts(){
            fetch(`${HOST}/api/getProducts`)
            .then(r => r.json())
            .then(d => {
                console.log(d)
                this.products = d
            })
        },
        changeMessage: function () {
            this.message = "changed/edited Message"
        },
        navTo(pageName) {
            this.pageName = pageName
        },
        test: function(){
            console.log("test")
        }
    }
})


