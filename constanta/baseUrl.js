const json = {
    SIT:{
        url:"http://localhost:3000"
    },
    PROD: {
        url:"https://attendance-serviceku.herokuapp.com"
    }
}

export default (type) =>  json[type]