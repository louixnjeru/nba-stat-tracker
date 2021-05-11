module.exports = function(app)
{
	app.get('/',function(req,res){
        	res.end('Hello')
     	});

	app.get('/stats',function(req,res){
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
}	
