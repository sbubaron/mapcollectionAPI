# HackTheDeep Map the Collection Data Cleanup

## Installation
```
git clone <repository>
cd <repository>
npm install
node ./bin/www
```
  
## Usage
Browse to **localhost:4000/dirtydata**
  
Optional Querystring parameters for:  
**page** - specify what page you wish to see default: 0  
**pageSize** - specify number of records per page: default 500  
**startYear/endYear** - specify minimum year to display (cleaned records only) must specify both  
  
You can view a specific record details by hitting:
**localhost:4000/dirtydata/TRACKINGNUMBER**
  
You can update a specific record by issueing a PUT Request to the above URL and providing the one or more of the following fields
  
clean_latitude [string]  
clean_longitude [string]   
clean_continent [string]  
clean_country [string]  
clean_department_province_state [string]  
clean_county [string]  
clean_date_collected ['YYYY-MM-DD']  
clean_date_received ['YYYY-MM-DD']  
  
You can download a CSV Dump of the entire dataset by visiting **localhost:4000/dirtydata/data.csv**
