var express = require('express');
var router = express.Router();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require("../config.local");
var db = config.database;

const sql = require('mssql');



/* GET home page. */
router.get('/', function(req, res, next) {

    res.set('Content-Type', 'application/json');

    var connection = new Connection(db);
    
    connection.on('connect', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("making request");
            request = new Request("select top 100 * from dirtydatacsv", function(err, rowCount, rows) {
                if (err) {
                console.log(err);
                } else {
                }
                connection.close();
                res.json(rows);
            });
            connection.execSql(request);
        }
    });

    
});

router.get('/csv', function(req, res, next) {
    console.log("using mssql");
    console.log(config.mssql);
    sql.connect(config.mssql).then(pool => {
        // Query
        console.log("query");
        return pool.request().query('select top 20 * from dirtydatacsv');
    }).then(result => {
        console.log("results");
        console.log(result);
        //console.dir(result)
        res.json(result);
    }).catch(err => {
        // ... error checks
        console.log(err);
    })
    
    sql.on('error', err => {
        // ... error handler
        console.log(err);
    })

    
});


module.exports = router;
