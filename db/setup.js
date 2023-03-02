const fs = require('fs');
const fetch = require('node-fetch');
const DB_Connector = require("../app/helper/DB_Connector.js")


const db = new DB_Connector()


let importFiles = ["vendors","products","users"]
// let importFiles = ["users"]


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
        console.log("deleted " + tableSchema.name)
    
        await fetch("http://127.0.0.1:8090/api/collections", {
            method:"POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token
            },
            body: JSON.stringify(tableSchema)
        })
        console.log("created collection " + tableSchema.name)
    }

    console.log("\n----Starting import------\n ")
    await importData()


}

main()


async function importData(){
    let insertedItems = {

    }
    for(let fileName of importFiles) {
        let file = "./db/data/"+fileName+".json"
        let importData = JSON.parse(fs.readFileSync(file))

        //TODO user need to get vendor id
        //replace vendor name with vendor id
        if(fileName == "products"){
            console.log("changing product import data to get keys from vendors")
            importData = importData.map(entry => {
                //Search created vendors for name and get id of created vendor entry
                entry.vendor = insertedItems["vendors"].find(e => e.name == entry.vendor).id
                return entry
            })
        }
        if(fileName == "users"){
            console.log("changing users import data to get keys from vendors")

            importData = importData.map(entry => {
                //Search created vendors for name and get id of created vendor entry
                let vendorSwag = insertedItems["vendors"].find(e => e.name == entry.firstname)
                if(vendorSwag != undefined){
                    entry.vendorId = vendorSwag.id
                }
                return entry
            })
        }

        if(fs.existsSync(file)){
            insertedItems[fileName] = await db.insertMany(fileName, importData, true)
            console.log("impported data " + fileName)
        }else{
            console.log(`Data file "${fileName}" does not exist`)
        }
    }

}
