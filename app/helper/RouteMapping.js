module.exports = class RouteMapping{
    constructor(data){
        this.data = data
        for(let i = 1; i <= 3; i++){
            this.data[i] = [...this.data[i], ...this.data[i-1]]
        }
    }

    get(){
        return this.data
    }
}