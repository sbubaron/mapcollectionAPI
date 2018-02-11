//copy to config.local.js
module.exports = {
    database:{
        userName: '',  
        password: '.',  
        server: '',  
        // When you connect to Azure SQL Database, you need these next options.  
        options: {encrypt: true, database: 'hackthedeep', rowCollectionOnRequestCompletion: true, useColumnNames: true }  
    }
}