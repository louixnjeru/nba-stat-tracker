module.exports = function(app)
{
	app.get('/',function(req,res){
        	res.end('Hello')
     	});

	app.get('/stats',function(req,res){
		var scraper = require('table-scraper');
scraper
  .get('https://www.foxsports.com/nba/standings')
  .then(function(tableData) {
	//res.send(tableData[0][1].GB)
	res.render('stats.ejs', {east: tableData[0], west:tableData[1]});
	console.log(tableData[0])  
});
     	});
}
