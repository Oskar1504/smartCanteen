const fs = require('fs');
const fetch = require('node-fetch');

let pb_schema = JSON.parse(fs.readFileSync("./db/pb_schema.json"))



async function main(){
    let token = await fetch("http://127.0.0.1:8090/api/admins/auth-with-password",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identity: "oskar.pester2@gmail.com",
            password: "Pocketbase2023"
        })
    })
    .then(r => r.json())
    .then(d => d.token)

    for(let tableSchema of pb_schema){
        delete tableSchema.id
        tableSchema.schema = tableSchema.schema.map(e => {
            delete e.id
            return e
        })
        await fetch("http://127.0.0.1:8090/api/collections/" + tableSchema.name, {
            method:"DELETE",
            headers: {
              "Authorization": token
            },
        })
    
        await fetch("http://127.0.0.1:8090/api/collections", {
            method:"POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token
            },
            body: JSON.stringify(tableSchema)
        })
    }


}

main()