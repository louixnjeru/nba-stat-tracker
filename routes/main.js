module.exports = function(app)
{
	// Loads the homepage
	app.get('/',function(req,res){
        	res.render('homepage.html')
     	});

	// Loads the standings page
	app.get('/standings',function(req,res){
		var scraper = require('table-scraper');
		// Scrapes the data from the webpage
		scraper.get('https://www.foxsports.com/nba/standings').then(function(tableData) {
			// Sends the data to the standings webpage
			res.render('stats.ejs', {east: tableData[0], west:tableData[1]});
		});
     	});
	
/*
	app.get('/player',function(req,res){
	var scraper = require('table-scraper');
        scraper.get('https://www.nbastuffer.com/2020-2021-nba-player-stats/').then(function(tableData) {
        res.send(tableData);
        })
        });
*/

/*
	app.get('/players/:year',function(req,res){
        	var scraper = require('table-scraper');
        	scraper.get(`https://www.basketball-reference.com/leagues/NBA_${req.params.year}_totals.html`).then(function(tableData) {
        		//res.send(tableData[0][0]);
			players = [];
			for (player in tableData[0]) {
				HOF = false;
				playerStats = [];
				for (var key in tableData[0][player]) {
					if (tableData[0][player].hasOwnProperty(key)) {
						newStat = tableData[0][player][key];
						if (!isNaN(tableData[0][player][key]) == true) {
							newStat = +tableData[0][player][key];
						}
						//console.log(newStat[newStat.length-1])
						if (newStat[newStat.length-1] == "*") {
							HOF = true;
							newStat = newStat.slice(0,-1);
						}
						playerStats.push(newStat)
					}
				}
				if (HOF == true) {
					playerStats.push(true);
				} else {
					playerStats.push(false);
				}
				players.push(playerStats);
			}
			//console.log(playerStats)
			res.send(players);
		})
        });
*/
	
/*	
	app.get('/abbv', function(req,res) {
		var scraper = require('table-scraper');
                scraper.get(
		"https://sportsdelve.wordpress.com/abbreviations/"
		).then(function(tableData) {
			var teams = []
			for (var abbv in tableData[2]) {
				let team = [tableData[2][abbv][0],tableData[2][abbv][1]];
				teams.push(team);   
			}
			sqlQuery = "insert into abbv(abbv,team) values ?"
			db.query(sqlQuery, [teams]);
		})
	})
*/

	// Loads the list of teams
	app.get('/teams',function(req,res){
		// SQL Query to find all the teams in the database
		sqlQuery = `select abbv,team from abbv order by team asc`;
		db.query(sqlQuery, (err,result) => {
			// If it can't find the teams, it returns the user to the homepage
			if (err) {
                                res.redirect('/usr/174/');
                        } else {
				// Otherwise, it loads the list of teams
                                res.render('teamList.ejs', {franchises: result})
                        }
		});
	})
	
	// Loads a team franchise index
	app.get('/team/:teamName/',function(req,res){
                var sqlQuery = ""
                // Loops through all the databases to find seasons where the team existed
		// it returns the lowest value id from each table that contains the team abbreviation
		for (var year=1950; year<2021; year++){
                        sqlQuery += `select year from ${year}totals where team = "${req.params.teamName}" and id = (select min(id) from ${year}totals where team = "${req.params.teamName}") union all `;
                }
                sqlQuery += `select year from ${year}totals where team = "${req.params.teamName}" and id = (select min(id) from ${year}totals where team = "${req.params.teamName}"); select team from abbv where abbv = "${req.params.teamName}"`;
		
                db.query(sqlQuery, (err,result) => {
			// If there are no results, then the team doesn't exist
			if (err || result[0].length == 0) {
				// The user is redirected to the team index
                        	res.redirect('/usr/174/teams');
                        } else {
				// Otherwise, the team's index is loaded
                                res.render('franchise.ejs', {team: [req.params.teamName, result[1][0]["team"]], seasons: result[0]});
                                //res.send(result);
                        }
                })
        })

	// Loads an individual season page for a team	
	app.get('/team/:teamName/:year',function(req,res){
		// If the season is not in the database, the user is rerouted to the team index
		if (req.params.year < 1950 || req.params.year > 2021) {
			res.redirect(`/usr/174/team/${req.params.teamName}`);
		} else {
			// Otherwise, the SQL query to return the team name and players who played for that team is set up
			var sqlQuery = `select team from abbv where abbv = "${req.params.teamName}"; select * from ${req.params.year}totals where team = "${req.params.teamName}"`;
			db.query(sqlQuery, (err,result) => {
				// If no players are returned, the team did not exist in that year
				if (err || result[1].length == 0) {
                                	// A message tells the user to go back to that team's franchise index
					res.send(`<p>${req.params.year} ${result[0][0]["team"]} is not a team.</p><br><a href="/team/${req.params.teamName}">Go back</a>`);
                        	} else {
					// Otherwise, the team page is loaded
                                	res.render('team.ejs', {team: [result[0][0]["team"],req.params.year], players: result[1]});
				}
                	})
		}
	})

	// Loads the player statistics page
	app.get('/player/:first/:last',function(req,res){
		var sqlQuery = ""
		// Loops through all databases to find the records for a player
		// COLLATE utf8_general_ci allows the query to disregard diacritics, so users can search using the English alphabet
		for (var year=1950; year<2021; year++){
			sqlQuery += `select * from ${year}totals where name = "${req.params.first} ${req.params.last}" COLLATE utf8_general_ci union all `;
		}
		sqlQuery += `select * from 2021totals where name = "${req.params.first} ${req.params.last}" COLLATE utf8_general_ci`;
		//console.log(sqlQuery)
		db.query(sqlQuery, (err,result) => {
			// If there is an error, or the player does not exist
			if (err || result.length == 0) {
				// The message is sent to allow the user to go back to the player search form
				res.send(`<p>${req.params.first1} ${req.params.last1} is not an NBA player.</p><br><a href="/findPlayer">Go back</a>`);
			} else {
				// Otherwise, the user can view the page
				res.render('player.ejs', {player: result});
			}
		})
	})

/*	
	app.get('/searchPlayers/:letter',function(req,res){
                var scraper = require('table-scraper');
                scraper.get(`https://www.basketball-reference.com/players/${req.params.letter}/`).then(function(tableData) {
        		res.send(tableData[0][2]);
        		players = [];
       			for (player in tableData[0]) {
        			HOF = false;
        			playerStats = [];
        			for (var key in tableData[0][player]) {
                			if (tableData[0][player].hasOwnProperty(key)) {
                        			newStat = tableData[0][player][key];
                        			if (!isNaN(tableData[0][player][key]) == true) {
                                			newStat = +tableData[0][player][key];
                        			}
        					//console.log(newStat[newStat.length-1])
                        			if (newStat[newStat.length-1] == "*") {
                                			HOF = true;
                                			newStat = newStat.slice(0,-1);
                        			}
                        			playerStats.push(newStat)
                			}
        			}
        			if (HOF == true) {
                			playerStats.push(true);
        			} else {
                			playerStats.push(false);
        			}
        			players.push(playerStats)
        		}
        		//console.log(playerStats)
        		res.send(players);
        	})
        });
	
	app.get('/sp/:letter',function(req,res){
		const tabletojson = require('tabletojson').Tabletojson;

		tabletojson.convertUrl(
   		`https://www.basketball-reference.com/players/${req.params.letter}/`,
    		function(tablesAsJson) {
        		console.log(tablesAsJson[0]);
    		})		
	})
*/
	
	// Loads the player search form
	app.get('/findPlayer', function(req,res){
		res.render('findPlayer.html');
	})

/*	
	app.post('/playerSearch', function(req,res){
		var sqlQuery = ""
                for (var year=1950; year<2021; year++){
                        sqlQuery += `select * from ${year}totals where name = "${req.body.first} ${req.body.last}" union all `
                }
                sqlQuery += `select * from 2021totals where name = "${req.body.first} ${req.body.last}";`
                console.log(sqlQuery)
                db.query(sqlQuery, (err,result) => {
                        if (err) {
                                res.redirect('/');
                        } else {
                                res.send(result);
                        }
                })
	})
*/

	// Redirect from the player search form
	app.post('/player-stats', function(req,res){
		// Allows the web page url to be in the correct from
		res.redirect(`/usr/174/player/${req.body.first}/${req.body.last}`);
	})

	app.get('/comparePlayers', function(req,res){
		res.render('findPlayers.html');
	})

	app.post('/compare-stats', function(req,res){
		res.redirect(`/usr/174/compare/${req.body.first1}/${req.body.last1}/${req.body.first2}/${req.body.last2}`);
	})

	//Compares two players
	app.get('/compare/:first1/:last1/:first2/:last2',function(req,res){
                // Select statement for first player
		var sqlQuery1 = ""
                // Loops through all seasons to find records of the player
		for (var year=1950; year<2021; year++){
                        sqlQuery1 += `select * from ${year}totals where name = "${req.params.first1} ${req.params.last1}" COLLATE utf8_general_ci union all `
                }
                sqlQuery1 += `select * from 2021totals where name = "${req.params.first1} ${req.params.last1}" COLLATE utf8_general_ci;`
		
		// Select statement for second player
		var sqlQuery2 = ""
                for (var year=1950; year<2021; year++){
                        sqlQuery2 += `select * from ${year}totals where name = "${req.params.first2} ${req.params.last2}" COLLATE utf8_general_ci union all `
                }
                sqlQuery2 += `select * from 2021totals where name = "${req.params.first2} ${req.params.last2}" COLLATE utf8_general_ci;`
		
		// Array to store each player's records
		players = []
		
                db.query(sqlQuery1, (err,result1) => {
			// If there is an error or the player cannot be found
                        if (err || result1.length == 0 ) {
                                // A message prompts the user 
				res.send(`<p>${req.params.first1} ${req.params.last1} is not an NBA player.</p><br><a href="/comparePlayers">Go back</a>`);
                        } else {
				// Otherwise, the result is pushed onto the result array
				players.push(result1);
				db.query(sqlQuery2, (err,result2) => {
                        	if (err || result2.length == 0) {
                                	res.send(`<p>${req.params.first2} ${req.params.last2} is not an NBA player.</p><br><a href="/comparePlayers">Go back</a>`);
                        	} else {
					// The other players record is pushed onto the array and the page is rendered
					players.push(result2);
                                	res.render('compare.ejs', {players: players})
                        	}
                		})
                        }
                })
        })

	// Lists all seasons	
	app.get('/seasons', function(req,res){
		res.render('seasonsList.ejs');
	})
	
	// Lists the overview for the selected season
	app.get('/season/:year', function(req,res){
		// If the year is not stored in the database then the user is redirected to the season index
		if (req.params.year < 1950 || req.params.year > 2021) {
			res.redirect('/usr/174/seasons/');
		}
		
		// Calculate the previous year to use in SQL queries
		var prev = req.params.year - 1;
		
                // Returns the teams that played in this year by selecting the minimum ids with abbreviations that are in the abbv table
		teamQuery = `select min(${req.params.year}totals.id) as id, ${req.params.year}totals.team, abbv.abbv, abbv.team, ${req.params.year}totals.year
		 from ${req.params.year}totals, abbv
		 where ${req.params.year}totals.team=abbv.abbv
		 group by ${req.params.year}totals.team,abbv.team,abbv.abbv,${req.params.year}totals.year;`;
        	
		// Returns the top points scorers provided that they have either played 70% of 82 games or 70% of the most amount of games played by a player that season if the season was shortened
		topPPGQuery = ` select name,team,
		 round((points/gamesPlayed),2) as PPG
		 from ${req.params.year}totals
		 where gamesPlayed > 0.7*(select max(gamesPlayed) from ${req.params.year}totals)
		 or gamesPlayed >= 0.7*82
		 and id in (select min(id) from ${req.params.year}totals group by name)
		 order by PPG desc limit 10;`;
		
		// Returns the players who played the most amount of games by picking the players who have played 82 or more games
		ironmanQuery = ` select ${req.params.year}totals.name,
                 ${req.params.year}totals.team, ${req.params.year}totals.gamesPlayed
		 from ${req.params.year}totals
		 where ${req.params.year}totals.gamesPlayed = 
		 (select max(${req.params.year}totals.gamesPlayed) from ${req.params.year}totals)
		 or ${req.params.year}totals.gamesPlayed >= 82
		 LIMIT 10;`;
		
		// Returns the players whose points improved the most from the previous year by picking those with the highest point differential
		// The query also makes sure the players qualify by selecting players who have played 70% of games
		// The query makes sure that partial seasons from traded players are not included by picking the lowest id number of the player as that will be the complete season
		// The query also makes sure that the player has played in both years
		improveQuery = ` SELECT ${prev}totals.name,
		 round(${prev}totals.points/${prev}totals.gamesPlayed,2) AS oldPPG,
		 ${prev}totals.team AS oldTeam,
		 round(${req.params.year}totals.points/${req.params.year}totals.gamesPlayed,2) AS newPPG,
		 ${req.params.year}totals.team AS newTeam,
		 round((${req.params.year}totals.points/${req.params.year}totals.gamesPlayed) - (${prev}totals.points/${prev}totals.gamesPlayed),2) AS PPGdifference 
		 FROM ${prev}totals, ${req.params.year}totals 
		 WHERE ${prev}totals.name = ${req.params.year}totals.name 
		 and (${req.params.year}totals.gamesPlayed>0.7*(SELECT max(${req.params.year}totals.gamesPlayed) from ${req.params.year}totals) and ${prev}totals.gamesPlayed>0.7*(SELECT max(${prev}totals.gamesPlayed) from ${prev}totals)) 
		 AND ${prev}totals.id in (select min(id) from ${prev}totals group by name)
		 AND ${req.params.year}totals.id in (select min(id) from ${req.params.year}totals group by name)
		 ORDER BY PPGdifference DESC LIMIT 10`;
		
		// Adds the SQL queries together
		//sqlQuery = teamQuery+topPPGQuery+ironmanQuery;
		let sqlQuery = teamQuery+topPPGQuery+ironmanQuery;
		// If the year is 1950, there are no previous year stats to obtain
		if (req.params.year>1950) {
			sqlQuery += improveQuery;
		}
		
		db.query(sqlQuery, (err,results) => {
			// If there is a problem with any of the queries, the user is redirected to the season index
			if (err) {
				res.redirect('/usr/174/seasons/');
			} else {
				// Otherwise, the query results are passed through to the season page
				res.render('season.ejs',{year: results[0][0]["year"], teams: results[0], topPointsScorers: results[1], ironmen: results[2], mostImproved: results[3]});
			}
		})
	})

/*
	app.get('/top', function(req,res){
		var statDay = new Date(Date.now() - 24*60*60*1000)
		var scraper = require('table-scraper');
                var months = []
		for (var i = 0; i<12; i++){
			months.push(i+1);
		}
		scraper.get(
		//`https://www.basketball-reference.com/friv/dailyleaders.fcgi?month=${statDay.getMonth}&day=${statDay.getDay}&year=${statDay.getFullYear}`
		//`http://www.espn.com/nba/dailyleaders/_/date/${statDay.getFullYear}${statDay.getMonth}${statDay.getDay}`
		"https://basketball.realgm.com/nba/daily-leaders"
		).then(function(tableData) {
                        res.send(tableData)})
	})
*/

	// All other routes (in case of error)
	app.get('/*', function(req,res){
		// Gives an error message and tells the user to go home
		res.send('<p>An error occured<br><a href="/">Home</a></p>')
	})
}
