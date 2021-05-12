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
	
	app.get('/player',function(req,res){
	var scraper = require('table-scraper');
        scraper.get('https://www.nbastuffer.com/2020-2021-nba-player-stats/').then(function(tableData) {
        res.send(tableData);
        })
        });

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
}	
