module.exports = {
    database:{
        userName: '',  
        password: '',  
        server: 'hackthedeepsrv.database.windows.net',  
        // When you connect to Azure SQL Database, you need these next options.  
        options: {encrypt: true, database: 'hackthedeep', rowCollectionOnRequestCompletion: true, useColumnNames: true }  
    },
    mssql: {
        user: '',
        password: '',
        server: 'hackthedeepsrv.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
        database: 'hackthedeep',
        options: {
            encrypt: true // Use this if you're on Windows Azure
        }
    }
}