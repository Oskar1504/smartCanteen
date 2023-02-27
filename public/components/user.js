Vue.component('user', {
    props: ['user',"functions"],
    template: `
    <div>
    <button @click="functions.test()">{{user.name}} ist {{user.age}} jahre alt</button>
    <button @click="functions.test2()">{{user.name}} 2ist {{user.age}} jahre alt</button>
    </div>`
})