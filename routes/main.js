module.exports = function(app)
{
	app.get('/',function(req,res){
        	res.render('homepage.html')
     	});

	app.get('/standings',function(req,res){
		var scraper = require('table-scraper');
		scraper.get('https://www.foxsports.com/nba/standings').then(function(tableData) {
			res.render('stats.ejs', {east: tableData[0], west:tableData[1]});
		});
     	});
	
	/*app.get('/player',function(req,res){
	var scraper = require('table-scraper');
        scraper.get('https://www.nbastuffer.com/2020-2021-nba-player-stats/').then(function(tableData) {
        res.send(tableData);
        })
        });*/

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

	app.get('/teams',function(req,res){
		sqlQuery = `select abbv,team from abbv order by team asc`;
		db.query(sqlQuery, (err,result) => {
			if (err) {
                                res.redirect('/usr/174/');
                        } else {
                                res.render('teamList.ejs', {franchises: result})
                                //res.send(result);
                        }
		});
	})
	
	app.get('/team/:teamName/',function(req,res){
                var sqlQuery = ""
                for (var year=1950; year<2021; year++){
                        sqlQuery += `select year from ${year}totals where team = "${req.params.teamName}" and id = (select min(id) from ${year}totals where team = "${req.params.teamName}") union all `;
                }
                sqlQuery += `select year from ${year}totals where team = "${req.params.teamName}" and id = (select min(id) from ${year}totals where team = "${req.params.teamName}"); select team from abbv where abbv = "${req.params.teamName}"`;

                db.query(sqlQuery, (err,result) => {
			if (err || result[0].length == 0) {
                        	res.redirect('/usr/174/teams');
                        } else {
                                res.render('franchise.ejs', {team: [req.params.teamName, result[1][0]["team"]], seasons: result[0]});
                                //res.send(result);
                        }
                })
        })
	
	app.get('/team/:teamName/:year',function(req,res){
		if (req.params.year < 1950 || req.params.year > 2021) {
			res.redirect(`/usr/174/team/${req.params.teamName}`);
		} else {
		var sqlQuery = `select team from abbv where abbv = "${req.params.teamName}"; select * from ${req.params.year}totals where team = "${req.params.teamName}"`;
		db.query(sqlQuery, (err,result) => {
			if (err || result[1].length == 0) {
                                res.send(`<p>${req.params.year} ${result[0][0]["team"]} is not a team.</p><br><a href="/team/${req.params.teamName}">Go back</a>`);
                        } else {
                                res.render('team.ejs', {team: [result[0][0]["team"],req.params.year], players: result[1]});
                        	//res.send(result);
			}
                })
		}
	})

	app.get('/name/:player',function(req,res){
                name = req.params.player;
                spaceIndex = name.indexOf("-");
                first = name.slice(0,spaceIndex);
                last = name.slice(spaceIndex+1,name.length);
                console.log(first);
                console.log(last);
		res.send(`<p>First Name: ${first}</p><p>Last Name: ${last}</p>`);
	})

	app.get('/player/:first/:last',function(req,res){
		var sqlQuery = ""
		for (var year=1950; year<2021; year++){
			sqlQuery += `select * from ${year}totals where name = "${req.params.first} ${req.params.last}" COLLATE utf8_general_ci union all `;
		}
		sqlQuery += `select * from 2021totals where name = "${req.params.first} ${req.params.last}" COLLATE utf8_general_ci`;
		//console.log(sqlQuery)
		db.query(sqlQuery, (err,result) => {
			if (err || result.length == 0) {
				res.send(`<p>${req.params.first1} ${req.params.last1} is not an NBA player.</p><br><a href="/findPlayer">Go back</a>`);
			} else {
				res.render('player.ejs', {player: result});
			}
		})
	})
	
	app.get('/searchPlayers/:letter',function(req,res){
                var scraper = require('table-scraper');
                scraper.get(`https://www.basketball-reference.com/players/${req.params.letter}/`).then(function(tableData) {
        		res.send(tableData[0][2]);
        		/*players = [];
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
        	*/})
        });
	
	app.get('/sp/:letter',function(req,res){
		const tabletojson = require('tabletojson').Tabletojson;

		tabletojson.convertUrl(
   		`https://www.basketball-reference.com/players/${req.params.letter}/`,
    		function(tablesAsJson) {
        		console.log(tablesAsJson[0]);
    		})		
	})
	
	app.get('/findPlayer', function(req,res){
		res.render('findPlayer.html');
	})
	
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
	
	app.post('/player-stats', function(req,res){
		res.redirect(`/usr/174/player/${req.body.first}/${req.body.last}`);
	})

	app.get('/comparePlayers', function(req,res){
		res.render('findPlayers.html');
	})

	app.post('/compare-stats', function(req,res){
		res.redirect(`/usr/174/compare/${req.body.first1}/${req.body.last1}/${req.body.first2}/${req.body.last2}`);
	})

	app.get('/compare/:first1/:last1/:first2/:last2',function(req,res){
                // Select statement for first player
		var sqlQuery1 = ""
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
		
		players = []
		
                db.query(sqlQuery1, (err,result1) => {
                        if (err || result1.length == 0 ) {
                                res.send(`<p>${req.params.first1} ${req.params.last1} is not an NBA player.</p><br><a href="/comparePlayers">Go back</a>`);
                        } else {
				players.push(result1);
				db.query(sqlQuery2, (err,result2) => {
                        	if (err || result2.length == 0) {
                                	res.send(`<p>${req.params.first2} ${req.params.last2} is not an NBA player.</p><br><a href="/comparePlayers">Go back</a>`);
                        	} else {
					players.push(result2);
                                	res.render('compare.ejs', {players: players})
                        	}
                		})
                        }
                })
        })
	
	app.get('/seasons', function(req,res){
		res.render('seasonsList.ejs');
	})
		
	app.get('/season/:year', function(req,res){
		if (req.params.year < 1950 || req.params.year > 2021) {
			res.redirect('/usr/174/seasons/');
		}
		
		var prev = req.params.year - 1;
		
                // Returns the teams that played in this year
		teamQuery = `select min(${req.params.year}totals.id) as id, ${req.params.year}totals.team, abbv.abbv, abbv.team, ${req.params.year}totals.year
		 from ${req.params.year}totals, abbv
		 where ${req.params.year}totals.team=abbv.abbv
		 group by ${req.params.year}totals.team,abbv.team,abbv.abbv,${req.params.year}totals.year;`;
        	
		// Returns the top points scorers
		topPPGQuery = ` select name,team,
		 round((points/gamesPlayed),2) as PPG
		 from ${req.params.year}totals
		 where gamesPlayed > 0.7*(select max(gamesPlayed) from ${req.params.year}totals)
		 or gamesPlayed >= 0.7*82
		 and id in (select min(id) from ${req.params.year}totals group by name)
		 order by PPG desc limit 10;`;
		
		// Returns the top assist makers
		

		// Returns the players who played the most amount of games
		ironmanQuery = ` select ${req.params.year}totals.name,
                 ${req.params.year}totals.team, ${req.params.year}totals.gamesPlayed
		 from ${req.params.year}totals
		 where ${req.params.year}totals.gamesPlayed = 
		 (select max(${req.params.year}totals.gamesPlayed) from ${req.params.year}totals)
		 or ${req.params.year}totals.gamesPlayed >= 82
		 LIMIT 10;`;
		
		// Returns the players whose points improved the most from the previous year
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
		// If the year is 1950, there are no previous stats to obtain
		if (req.params.year>1950) {
			sqlQuery += improveQuery;
		}
		
		db.query(sqlQuery, (err,results) => {
			if (err) {
				console.log(err);
				res.redirect('/usr/174/seasons/');
			} else {
				res.render('season.ejs',{year: results[0][0]["year"], teams: results[0], topPointsScorers: results[1], ironmen: results[2], mostImproved: results[3]});
			}
		})
	})

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
}
