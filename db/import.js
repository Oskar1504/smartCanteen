const fs = require("fs")

const DB_Connector = require("../app/helper/DB_Connector.js")


const db = new DB_Connector()

let importFiles = ["vendors","products","users"]
// let importFiles = ["users"]



async function main(){
    let insertedItems = {

    }
    for(let fileName of importFiles) {
        let file = "./db/data/"+fileName+".json"
        let importData = JSON.parse(fs.readFileSync(file))

        //TODO user need to get vendor id
        //replace vendor name with vendor id
        if(fileName == "products"){
            console.log("processing products")
            importData = importData.map(entry => {
                //Search created vendors for name and get id of created vendor entry
                entry.vendor = insertedItems["vendors"].find(e => e.name == entry.vendor).id
                return entry
            })
        }
        if(fileName == "users"){
            console.log("processing users")

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
        }else{
            console.log(`Data file "${fileName}" does not exist`)
        }
    }

}

main()