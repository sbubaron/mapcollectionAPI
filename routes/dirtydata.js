var express = require('express');
var router = express.Router();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require("../config");
var db = config.database;



/* GET home page. */
router.get('/', function(req, res, next) {

    res.set('Content-Type', 'application/json');

    var connection = new Connection(db);
    
    connection.on('connect', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("making request");
            request = new Request("select top 1 * from dirtydatacsv", function(err, rowCount, rows) {
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


module.exports = router;
