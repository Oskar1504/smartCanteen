
const HOST = "http://localhost:42069"

var app = new Vue({
    el: '#app',
    data: {
        pageName: "products",
        products:[],
        checkout: {
            cart: [
                "test",
                "test",
                "test",
            ]
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
                this.products = d.map(product => {
                    product.tags = product.tags.split(",");
                    product.categorie = product.categorie.split(",");
                    return product;
                })
            })
        },
        navTo(pageName) {
            this.pageName = pageName
        },
        test: function(){
            console.log("test")
        }
    }
})


