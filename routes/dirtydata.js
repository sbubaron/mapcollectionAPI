var express = require('express');
var router = express.Router();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require("../config.local");
var db = config.database;

const sql = require('mssql');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const csvStringifier  = createCsvStringifier({
    path: 'path/to/file.csv',
    header: [
        {id: 'TrackingNumber', title: 'TrackingNumber'},
        {id: 'TaxPhlyum', title: 'TaxPhlyum'},
        {id: 'TaxOrder', title: 'TaxOrder'},
        {id: 'TaxFamily', title: 'TaxFamily'},
        {id: 'TaxGenus', title: 'TaxGenus'},
        {id: 'TaxSpecies', title: 'TaxSpecies'},
        //{id: 'SpeciesYear', title: 'SpeciesYear'},
        //{id: 'SpecimenNumber', title: 'SpecimenNumber'},
        {id: 'CleanContinent', title: 'Continent'},
        {id: 'CleanCountry', title: 'Country'},
        {id: 'CleanDepartmentProvinceState', title: 'DepartmentProvinceState'},
        {id: 'CleanCounty', title: 'County'},
        {id: 'Latitude', title: 'Latitude'},
        {id: 'Longitude', title: 'Longitude'},
       // {id: 'SpecificLocale', title: 'SpecificLocale'},
       // {id: 'NotesLocality', title: 'NotesLocality'},
       // {id: 'CollectorVerbatim', title: 'CollectorVerbatim'},
        //{id: 'DateCollectionVerbatimDb', title: 'DateCollectionVerbatimDb'},
        //{id: 'DateReceivedVerbatim', title: 'DateReceivedVerbatim'},


    ]
});


/* GET home page. */
router.get('/', function(req, res, next) {

    var startYear = req.query.startYear || '';
    var endYear = req.query.endYear || '';

    var startDate = '';
    var endDate = '';

    var pageSize = 1000;
    
    var curPage = req.query.page || 0;

    var offset = curPage * pageSize;

    var query = 'select * from dirtydatacsv where '
    if(startYear && endYear) {
        startDate = '1/1/' + startYear;
        endDate = '12/31/' + endYear;

        query += "CleanDate >= @startDate and CleanDate <= @endDate"

    }
    else {
        query += '1=1';
    }
    query += " ORDER BY TrackingNumber";
    query += " OFFSET " + offset + " ROWS";
    query += " FETCH NEXT " + pageSize + " ROWS ONLY";

    sql.connect(config.mssql).then(pool => {
        // Query
     
        return pool.request()
        .input('startDate', sql.NVarChar, startDate)
        .input('endDate', sql.NVarChar, endDate)
        .query(query);
    }).then(result => {
     //   console.log(result);

        let csv = '';
        //console.log(result.recordset);

       
        //console.dir(result)
        res.json(result.recordset);
        sql.close();
    }).catch(err => {
        // ... error checks
        console.log(err);
        sql.close();
    })
    
    sql.on('error', err => {
        // ... error handler
        console.log(err);
        sql.close();
    })

    
});

router.get('/data.csv', function(req, res, next) {
    console.log("using mssql");
    console.log(config.mssql);
    res.set('Content-Type', 'application/octet-stream');
    sql.connect(config.mssql).then(pool => {
        // Query
     
        return pool.request().query('select top 100000 * from dirtydatacsv');
    }).then(result => {
     //   console.log(result);

     res.send(csvStringifier.getHeaderString() + "\r\n" + csvStringifier.stringifyRecords(result.recordset));       // returns a promise 
     sql.close();
    }).catch(err => {
        // ... error checks
        console.log(err);
        sql.close();
    })
    
    sql.on('error', err => {
        // ... error handler
        console.log(err);
        sql.close();
    })

    
});





router.get('/:trackingnumber', function(req, res, next) {
    console.log("using mssql");
    console.log(config.mssql);

    let trackingNumber = req.params["trackingnumber"];

    

    sql.connect(config.mssql).then(pool => {
        // Query
     
        return pool.request()
        .input('trackingnumber', sql.NVarChar, trackingNumber)
        .query('select top 1 * from dirtydatacsv where TrackingNumber=@trackingnumber');
        
    }).then(result => {
     //   console.log(result);

        let csv = '';
        //console.log(result.recordset);

       
        //console.dir(result)
        res.json(result.recordset);
        sql.close();
    }).catch(err => {
        // ... error checks
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
