const express = require('express')
const request = require('request');
const cron = require('node-cron');
const Chart = require('chart.js');
const app = express()
const port = 8000
const calendar = new Date()


var bodyParser = require ('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');

// Sets up access to the SQL Database
const db = mysql.createConnection ({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'stats',
	multipleStatements: true
});

db.connect((err) => {
	if (err) {
		throw err;
    	}
    	console.log('Stats Database initialised');
});
global.db = db;
global.Chart = Chart

// sets up Express web server
require('./routes/main')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);

// Schedule tasks to be run on the server.
cron.schedule('0 0 */12 * * *', function() {
	
});

// Message confirming Express server is running
app.listen(port, () => console.log(`Stats App running on port ${port}, started ${calendar.getDate()}/${calendar.getMonth()+1}/${calendar.getFullYear()}`))
