const fetch = require('node-fetch');


async function main(){
    await fetch("http://localhost:8090/api/collections/products/records")
    .then(r => r.json())
    .then(d => {
        console.log(d)
    })
}

main()