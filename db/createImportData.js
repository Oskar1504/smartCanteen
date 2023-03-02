const fs = require("fs")

let rawData = JSON.parse(fs.readFileSync("./db/data/gen/raw.json"))

let categories = Object.fromEntries(rawData.menu.categories.map(categorie => {
    return [categorie.name, categorie.productIds]
}))

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}



let availableVendors = ["Vendor 1", "Vendor 2"]

let resolve = {
    categorie(product){
        let index = Object.values(categories).findIndex(e => e.includes(product.id))
        return Object.keys(categories)[index]
    },
    tags(product){
        return Array.from(product.name.matchAll(/\((.*?)\)/g), x => x[1]).join(", ")
    },
    vendor(product){
        return availableVendors[randomIntFromInterval(0, availableVendors.length -1)]
    },
    imageLink(product){
        if(product.name.includes("urger")){
            return "./images/burger.png"
        }else if(product.name.includes("Fries")){
            return "./images/pommes.png"
        }else{
            return "./images/salad.png"
        }
    },
}

let products = Object.entries(rawData.menu.products).map(([key, product]) => {
    product["id"]  = key
    return {
       name: product.name,
       description: product.description.join("\n"),
       price: product.variants[0].prices.pickup/100,
       categorie: resolve.categorie(product),
       tags: resolve.tags(product),
       vendor: resolve.vendor(product),
       imageLink: resolve.imageLink(product),
    }
})


fs.writeFileSync("./db/data/products.json", JSON.stringify(products, null, 2))