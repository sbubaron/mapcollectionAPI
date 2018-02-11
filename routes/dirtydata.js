var express = require('express');
var moment = require('moment');
var router = express.Router();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require("../config.local");
var db = config.database;

const sql = require('mssql');
const connectionString = process.env.SQLCONNSTR_connectionParams || '';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
var sqlConObj = connectionString || config.mssql;

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

    var pageSize = req.query.pageSize || 100;
    
    var curPage = req.query.page || 0;

    var offset = curPage * pageSize;

    var query = 'select * from dirtydatacsv where '
    if(startYear && endYear) {
        startDate = '1/1/' + startYear;
        endDate = '12/31/' + endYear;

        query += "CleanCollectionDate >= @startDate and CleanCollectionDate <= @endDate"

    }
    else {
        query += '1=1';
    }
    query += " ORDER BY TrackingNumber";
    query += " OFFSET " + offset + " ROWS";
    query += " FETCH NEXT " + pageSize + " ROWS ONLY";

    

    //sql.connect(config.mssql).then(pool => {
	sql.connect(sqlConObj).then(pool => {
	
        // Query
     
        return pool.request()
        .input('startDate', sql.NVarChar, startDate)
        .input('endDate', sql.NVarChar, endDate)
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

router.get('/data.csv', function(req, res, next) {
    console.log("using mssql");
    console.log(config.mssql);
    res.set('Content-Type', 'application/octet-stream');
    //sql.connect(config.mssql).then(pool => {
	sql.connect(sqlConObj).then(pool => {
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

    

    //sql.connect(config.mssql).then(pool => {
	sql.connect(sqlConObj).then(pool => {	
        // Query
     
        return pool.request()
        .input('trackingnumber', sql.NVarChar, trackingNumber)
        .query('select top 1 * from dirtydatacsv where TrackingNumber=@trackingnumber');
        
    }).then(result => {
     //   console.log(result);

        if(result.recordset.length < 1) {
            res.json({error: "Tracking Number Not Found"});
        }
       
        //console.dir(result)
        res.json(result.recordset[0]);
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


router.put('/:trackingnumber', function(req, res, next) {
    var data = req.body || {};

    
    let trackingNumber = req.params["trackingnumber"] || '';
    
    if(!trackingNumber) {
        res.send({error: "Tracking Number Required"});
    }

    sql.connect(sqlConObj).then(pool => {
        // Query
     
        return pool.request()
        .input('trackingnumber', sql.NVarChar, trackingNumber)
        .query('select top 1 * from dirtydatacsv where TrackingNumber=@trackingnumber');
        
    }).then(result => {
     //   console.log(result);

        let csv = '';
        //console.log(result.recordset);
        if(result.recordset.length < 1) {
            res.send({error: "Invalid Tracking Number"});
            sql.close();
        }

        return result.recordset[0];
    }).then(result => {
        console.log(result);
        var cLatitude = data.clean_latitude || result.CleanLatitude;
        var cLongitude = data.clean_longitude || result.CleanLongitude;
        var cContinent = data.clean_continent || result.CleanContinent;
        var cCountry =  data.clean_country || result.CleanCountry;
        var cDeptProvState = data.clean_department_province_state || result.CleanDepartmentProvinceState;
        var cCounty = data.clean_county || result.CleanCounty;
        var cDateCollected = moment(data.clean_date_collected) || moment(result.CleanDateCollected);
        var cDateReceived = moment(data.clean_date_received) || moment(result.CleanDateReceived);
      
       // var trackingNumber = result[0].TrackingNumber;
        console.log(cLatitude);
        console.log(cLongitude);
        console.log(cCountry);
        console.log(cDateCollected);
        console.log(cDateReceived);
        var sqlUp = "update dirtydatacsv set CleanDateCollected=@cDateCollected, CleanDateReceived=@cDateReceived, CleanLatitude=@cLatitude, CleanLongitude=@cLongitude, CleanContinent=@cContinent, CleanCountry=@cCountry, CleanDepartmentProvinceState=@cDeptProvState, CleanCounty=@cCounty where TrackingNumber=@trackingnumber";
        
        

        //const uprequest = new sql.Request()
        const upreq = new sql.Request();

        upreq
        .input('trackingnumber', sql.NVarChar, result.TrackingNumber)
        .input('cDateCollected', sql.DateTime, cDateCollected.toDate())
        .input('cDateReceived', sql.DateTime, cDateReceived.toDate())
        .input('cLatitude', sql.Real, cLatitude)
        .input('cLongitude', sql.Real, cLongitude)
        .input('cContinent', sql.NVarChar, cContinent)
        .input('cCountry', sql.NVarChar, cCountry)
        .input('cDeptProvState', sql.NVarChar, cDeptProvState)
        .input('cCounty', sql.NVarChar, cCounty)
        .query(sqlUp).then(upresult => {
            console.log("Update...");
                res.send({message: "OK"});
                sql.close();
        }).catch(uperr => {
            res.send({error: uperr });
            sql.close();
        }); 

    })
    .catch(err => {
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
