var express = require('express');
var moment = require('moment');
var router = express.Router();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require("../config.local");
var db = config.database;

const sql = require('mssql');
const connectionString = process.env.SQLCONNSTR_connectionParams || '';
var sqlConObj = connectionString || config.mssql;


/* GET home page. */
router.get('/', function(req, res, next) {

    var startYear = req.query.startYear || '';
    var endYear = req.query.endYear || '';

    var startDate = '';
    var endDate = '';

    var pageSize = req.query.pageSize || 100;
    
    var curPage = req.query.page || 0;

    var offset = curPage * pageSize;

    var query = "select * from dirtydatacsv where (CleanDateCollected <> '' and CleanDateReceived <> '') and (CleanContinent <> '' and CleanCountry <> '' and CleanDepartmentProvinceState <> '' and CleanCounty <> '')";
    if(startYear && endYear) {
        startDate = '1/1/' + startYear;
        endDate = '12/31/' + endYear;

        query += "and (CleanCollectionDate >= @startDate and CleanCollectionDate <= @endDate)"

    }
    
    query += " ORDER BY TrackingNumber";
    query += " OFFSET " + offset + " ROWS";
    query += " FETCH NEXT " + pageSize + " ROWS ONLY";

    

    //sql.connect(config.mssql).then(pool => {
	sql.connect(sqlConObj).then(pool => {
	
        // Query
     
        return pool.request()
     //   .input('startDate', sql.NVarChar, startDate)
    //    .input('endDate', sql.NVarChar, endDate)
        .query(query);
    }).then(result => {
        res.json(result.recordset);
        sql.close();
    }).catch(err => {
        console.log(err);
        sql.close();
    })
    
    sql.on('error', err => {
        // ... error handler
        console.log(err);
        sql.close();
    })

    
});

module.exports = router;