
module.exports = class UserCollection{
    constructor(db, maxCacheMinutes = 30){
        this.db = db
        this.maxCacheMinutes = maxCacheMinutes * 60 * 1000
        this.loadUser()
        this.userLastFetched = new Date().getTime()
    }

    async loadUser(){
        
        this.db.getCollection("users")
        .then(d => {
            this.userLastFetched = new Date().getTime()
            this.users = Object.fromEntries(d.items.map(e => [e.id,e]))
        })
    }

    getUser(userId){
        this.checkCache()
        //TODO check existance
        return this.users[userId]
    }

    checkCache(){
        let time = new Date().getTime()
        if(time - this.userLastFetched >= this.maxCacheMinutes){
            console.log("[USERCOLLECTION] reloading user data")
            this.loadUser()
        }
    }

    login(username, password){
        this.checkCache()
        let user =  Object.values(this.users).find(user =>user.username == username && user.password == password)

        if(user == undefined){
            throw new Error(`Wrong credentials`)
        }

        return user
    }
}