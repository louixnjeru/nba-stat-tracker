module.exports = function(app)
{
	app.get('/',function(req,res){
        	res.end('Hello')
     	});

	app.get('/standings',function(req,res){
		var scraper = require('table-scraper');
	scraper.get('https://www.foxsports.com/nba/standings')
  	.then(function(tableData) {
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
	players.push(playerStats)
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

	app.get('/team/:teamName/:year',function(req,res){
		var sqlQuery = `select * from ${req.params.year}totals where team = "${req.params.teamName}";`
		db.query(sqlQuery, (err,result) => {
                        if (err) {
                                res.redirect('/usr/174/');
                        } else {
                                res.send(result);
                        }
                })
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
			sqlQuery += `select * from ${year}totals where name = "${req.params.first} ${req.params.last}" union all `
		}
		sqlQuery += `select * from 2021totals where name = "${req.params.first} ${req.params.last}";`
		console.log(sqlQuery)
		db.query(sqlQuery, (err,result) => {
			if (err) {
				res.redirect('/usr/174/findPlayer');
			} else {
				res.send(result);
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
                                res.send(result);c
                        }
                })
	})
	
	app.post('/player-stats', function(req,res){
		res.redirect(`/usr/174/player/${req.body.first}/${req.body.last}`);
	})

	app.get('/compare/:first1/:last1/:first2/:last2',function(req,res){
                // Select statement for first player
		var sqlQuery1 = ""
                for (var year=1950; year<2021; year++){
                        sqlQuery1 += `select * from ${year}totals where name = "${req.params.first1} ${req.params.last1}" union all `
                }
                sqlQuery1 += `select * from 2021totals where name = "${req.params.first1} ${req.params.last1}";`
                console.log(sqlQuery1)
		
		// Select statement for second player
		var sqlQuery2 = ""
                for (var year=1950; year<2021; year++){
                        sqlQuery2 += `select * from ${year}totals where name = "${req.params.first2} ${req.params.last2}" union all `
                }
                sqlQuery2 += `select * from 2021totals where name = "${req.params.first2} ${req.params.last2}";`
                console.log(sqlQuery2)
		
		players = []
		
                db.query(sqlQuery1, (err,result1) => {
                        if (err) {
				console.log(err.index);
                                res.redirect('/usr/174/findPlayer');
                        } else {
				players.push(result1);
				db.query(sqlQuery2, (err,result2) => {
                        	if (err) {
                                	res.redirect('/usr/174/findPlayer');
                        	} else {
					players.push(result2);
                                	console.log(players);
                                	res.send(players);
                        	}
                })
                        }
                })
        })
	
	app.get('/:year', function(req,res){
		var prev = req.params.year - 1;
		
                // Returns the teams that played in this year
		teamQuery = `select min(${req.params.year}totals.id) as id, ${req.params.year}totals.team, abbv.team,${req.params.year}totals.year
		 from ${req.params.year}totals, abbv
		 where ${req.params.year}totals.team=abbv.abbv
		 group by ${req.params.year}totals.team,abbv.team,${req.params.year}totals.year;`;
        	
		// Returns the top points scorers
		topPPGQuery = ` select ${req.params.year}totals.name,
		 ${req.params.year}totals.team,
		 round(${req.params.year}totals.points/${req.params.year}totals.gamesPlayed,2) as PPG
		 from ${req.params.year}totals
		 order by PPG desc limit 10;`;

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
		 round(${prev}totals.points/${prev}totals.gamesPlayed,2) AS ${prev}PPG,
		 ${prev}totals.team AS ${prev}Team,
		 round((${req.params.year}totals.points/${req.params.year}totals.gamesPlayed),2) AS ${req.params.year} PPG,
		 ${req.params.year}totals.team AS ${req.params.year}Team,
		 round((${req.params.year}totals.points/${req.params.year}totals.gamesPlayed) - (${prev}totals.points/${prev}.gamesPlayed),2) AS PPGdifference 
		 FROM ${prev}totals, ${req.params.year}totals 
		 WHERE ${prev}totals.name = ${req.params.year}totals.name 
		 and (${req.params.year}totals.gamesPlayed>0.7*(SELECT max(${req.params.year}totals.gamesPlayed) from ${req.params.year}totals) and ${prev}totals.gamesPlayed>0.7*(SELECT max(${prev}totals.gamesPlayed) from ${prev}totals)) 
		 AND ${prev}totals.id in (select min(id) from ${prev}totals group by name)
		 AND ${req.params.year}totals.id in (select min(id) from ${req.params.year}totalstotals group by name)
		 ORDER BY PPGdifference DESC LIMIT 10`;
		
		// Adds the SQL queries together
		//sqlQuery = teamQuery+topPPGQuery+ironmanQuery;
		let sqlQuery = topPPGQuery;
		// If the year is 1950, there are no previous stats to obtain
		if (req.params.year>1950) {
			sqlQuery += improveQuery;
		}
		
		db.query(sqlQuery, (err,results) => {
			if (err) {
				throw err;
			} else {
				res.send(results)
			}
		})
	})

}
