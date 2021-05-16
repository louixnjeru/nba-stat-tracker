const mysql = require('mysql');

// Sets up access to the SQL Database
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'stats'
});

// Connects to the Database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Stats Database initialised');
});
global.db = db;

// Sets up table scraper module
var scraper = require('table-scraper');

// Sets the year to scrape data for
var year = 1954;

// SQL query to create the table
createTableQuery = `CREATE TABLE ${year}totals (
id INT AUTO_INCREMENT, 
name VARCHAR(100), 
position VARCHAR(5), 
age INT(3), 
team VARCHAR(3), 
gamesPlayed INT(3), 
gamesStarted INT(3), 
minutes INT(5), 
fieldGoals INT(5), 
fieldGoalsAtt INT(5), 
fieldGoalPct DECIMAL(4,3) unsigned, 
3PfieldGoals INT(5), 
3PfieldGoalsAtt INT(5), 
3PfieldGoalPct DECIMAL(4,3) unsigned, 
2PfieldGoals INT(5), 
2PfieldGoalsAtt INT(5), 
2PfieldGoalPct DECIMAL(4,3) unsigned, 
EFFfieldGoalPct DECIMAL(4,3) unsigned, 
freeThrows INT(5), 
freeThrowsAtt INT(5), 
freeThrowPct DECIMAL(4,3) unsigned, 
OffRebs INT(5), 
DefRebs INT(5), 
TotRebs INT(5), 
Asts INT(5), 
Stls INT(5), 
Blks INT(5), 
TOvs INT(5), 
Fouls INT(5), 
Points INT(5), 
inHOF BOOLEAN,
Year INT(5) NOT NULL DEFAULT ${year},
PRIMARY KEY(id))
;`

// SQL query to create entry for each player
insertTableQuery = `INSERT INTO ${year}totals (name,position,age,team,gamesPlayed,gamesStarted,minutes,fieldGoals,fieldGoalsAtt,fieldGoalPct,3PfieldGoals,3PfieldGoalsAtt,3PfieldGoalPct,2PfieldGoals,2PfieldGoalsAtt,2PfieldGoalPct,EFFfieldGoalPct,freeThrows,freeThrowsAtt,freeThrowPct,OffRebs,DefRebs,TotRebs,Asts,Stls,Blks,TOvs,Fouls,Points,inHOF) VALUES 
(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

// Scrapes the website to load data into the database
scraper.get(
	`https://www.basketball-reference.com/leagues/NBA_${year}_totals.html`
	).then(function(tableData) {
	console.log("Table Scraped");
        db.query(createTableQuery);
	console.log("Database created");
	// Loops through all the players on the webpage
	for (player in tableData[0]) {
        	HOF = false;
		// Array to load stats into
        	playerStats = [];
		// Loops through all json values in object
        	for (var key in tableData[0][player]) {
                	if (tableData[0][player].hasOwnProperty(key)) {
                        	newStat = tableData[0][player][key];
                        	// If the field is a number, this converts the string
				if (!isNaN(tableData[0][player][key]) == true) {
                                	newStat = +tableData[0][player][key];
                        	}
				// If the name field has a star, this recognises the player as a hall of famer
                        	if (newStat[newStat.length-1] == "*") {
                                	// The field for a hall of famer is set and removes the star from the player name
					HOF = true;
                                	newStat = newStat.slice(0,-1);
                        	}
                        	playerStats.push(newStat)
                	}
        	}
		// Checks if the player is a hall of famer and adds the final field
        	if (HOF == true) {
                	playerStats.push(true);
        	} else {
                	playerStats.push(false);
        	}
		// Inserts the player field into the year database
        	db.query(insertTableQuery, playerStats);
        }
	console.log("Database loaded");
})

console.log(`${year} stats loaded`);


