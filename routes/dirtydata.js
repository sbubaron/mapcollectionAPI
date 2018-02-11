var express = require('express');
var router = express.Router();

var Connection = require('tedious').Connection;  
    var config = {  
        userName: '',  
        password: '',  
        server: '',  
        // When you connect to Azure SQL Database, you need these next options.  
        options: {encrypt: true, database: 'hackthedeep'}  
    };  
    
    

    var Request = require('tedious').Request;  
    var TYPES = require('tedious').TYPES;  

    function executeStatement() {  
     
    }  

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("calling connect");
    var connection = new Connection(config);  

    connection.on('connect', function(err) {  
        // If no error, then good to proceed.  
        console.log("Connected");  
        
        request = new Request("SELECT top 20 * FROM DirtyDataCSV;", function(err) {  
            if (err) {  
                console.log(err);}  
            });  
            var result = "";  
            request.on('row', function(columns) {  
                columns.forEach(function(column) {  
                  if (column.value === null) {  
                 //   console.log('NULL');  
                  } else {  
                    result+= column.value + " ";  
                  }  
                });  
                console.log(result);  
                //result ="";  
            });  
    
            
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
    
            return result;
            });  
            connection.execSql(request);  
        
        console.log("result");
        console.log(result);
        res.render('index', { title: 'Dirty Data' });
    });  

        
});

module.exports = router;
