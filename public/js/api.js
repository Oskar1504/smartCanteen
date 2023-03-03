class ApiConnector{
    constructor(host = "http://localhost:42069"){
        this.host = host
        //TODO auth headerf from login for every call
        this.defaultHeaders = {
            "ope-auth-username": "",
            "ope-auth-password": "",
        }
    }

    setAuth(username, password){
        this.defaultHeaders["ope-auth-username"] = username
        this.defaultHeaders["ope-auth-password"] = password
    }
    get(url, headers = {}){
        return fetch(this.host + url, {
            method:"GET",
            headers: {
                ...this.defaultHeaders,
                ...headers
            }
        })
        .catch(e => {
            app.message.show(e.toString(),10)
        })
    }
    
    delete(url, headers = {}){
        return fetch(this.host + url, {
            method:"DELETE",
            headers: {
                ...this.defaultHeaders,
                ...headers
            }
        })
        .catch(e => {
            app.message.show(e.toString(),10)
        })
    }

    post(url, data, headers = {}){
        return fetch(this.host + url, {
            method:"POST",
            headers: {
                ...this.defaultHeaders,
                ...{
                    'Content-Type': 'application/json',
                },
                ...headers
            },
            body:JSON.stringify(data)
        })
        .catch(e => {
            app.message.show(e.toString(),10)
        })
    }
}