const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const PORT = process.env.PORT || 5000;
const app = express();
const { Pool } = require('pg');
const { strict } = require('assert');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const aac = require('./aac');

const users = [
	"Geoff",
	"Tim"
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
	extended: false
}));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// use the aac route
app.use('/aac', aac);

app.get('/', (req, res) => {
	res.render('pages/index');
});

app.get('/search', async (req, res) => {
	var GET = req.query;

	if (GET.terms == undefined) {
		res.render("pages/search-no-res");
	}

	var words = GET.terms.split(' ');
	var results = [];

	var pagesFolder = await fs.promises.readdir("views/pages");
	var sims = await fs.promises.readdir("views/pages/sims");
	var games = await fs.promises.readdir("views/pages/games");

	var pages = [];
	var titles = [];

	for (ppage of pagesFolder) {
		if (ppage.substr(ppage.length - 4, ppage.length - 1) == ".ejs")
			pages.push(ppage);
	}

	for (var i = 0; i < pages.length; i++)
		pages[i] = "/" + pages[i];
	for (var i = 0; i < sims.length; i++)
		sims[i] = "/sims/" + sims[i];
	for (var i = 0; i < games.length; i++)
		games[i] = "/games/" + games[i];
	
	pages = pages.concat(sims, games);

	for (page of pages) {
		var text = fs.readFileSync(`views/pages${page}`, "utf-8");
		titles.push(text.split('<title>')[1].split('</title>')[0]);
	}

	for (var i = 0; i < pages.length; i++)
		pages[i] = pages[i] != "/index.ejs" ? pages[i].substr(0, pages[i].length - 4) : "/";

	for (word of words) {
		for (var i = 0; i < pages.length; i++) {
			if (pages[i].toLowerCase().includes(word.toLowerCase()) ||
				titles[i].toLowerCase().includes(word.toLowerCase()))
			{
				results.push({
					title: titles[i],
					link: pages[i]
				});

				pages.splice(i, 1);
				titles.splice(i, 1);

				i--;
			}
		}
		/*
		for (user of users) {
			if (user.toLowerCase().includes(word.toLowerCase()))
				results.push(user);
		}
		*/
	}
	
	if (results.length == 0) results.push("We didn't find anything on our site that matched your search.");
	
	var results = {
		'search': GET.terms,
		'results': results
	};
	res.render('pages/search', results);
});

app.get('/helpful-licence', (req, res) => {
	res.render('pages/helpful-licence');
});

app.get('/private-policy-helpful', (req, res) => {
	res.render('pages/private-policy-helpful');
});

app.get('/support', (req, res) => {
	res.render('pages/support');
});
app.post('/support', async (req, res) => {
	var name = req.body.name;
	var message = req.body.message;
	var email = req.body.email;
	
	try {
	   const client = await pool.connect();
	   var result = await client.query('INSERT INTO support_requests VALUES($1, $2, $3)', [name, message, email]);
	   
	   res.send("Thank you, we are working on resolving the issue. Click <a href=\"/\">here</a> to return to the homepage.");
	   client.release();
	} catch (err) {
	   console.error(err);
	   res.send("Error " + err);
	}
	
});

app.get('/helpful-functions', (req, res) => {
	res.render('pages/helpful-functions');
});

app.get('/helpful', (req, res) => {
	res.render('pages/helpful-home');
});

app.get('/sims', async (req, res) => {
	var sims = [];
	var files = await fs.promises.readdir("views/pages/sims");

	for (var i = 0; i < files.length; i++) {
		var text;

		try {
			text = fs.readFileSync(`views/pages/sims/${files[i]}`, "utf-8");
		}
		catch (err) {
			res.send(`Uh oh, something went wrong.\nError: ${err}`);
			return;
		}

		var title = text.split('<title>')[1].split('</title>')[0];
		
		sims.push({
			title: title,
			link: "/sims/" + files[i].substr(0, files[i].length - 4)
		});
	}

	sims = {"sims": sims};
	res.render('pages/sims', sims);
});

app.get('/sims/:sim_name', (req, res) => {
	var simName = req.params.sim_name;
	if (fs.existsSync(`views/pages/sims/${simName}.ejs`))
		res.render(`pages/sims/${simName}`);
	else
		res.send("Sorry, the page you requested does not exist.");
});

app.get('/games', async (req, res) => {
	var games = [];
	var files = await fs.promises.readdir("views/pages/games");

	for (var i = 0; i < files.length; i++) {
		var text;

		try {
			text = fs.readFileSync(`views/pages/games/${files[i]}`, "utf-8");
		}
		catch (err) {
			res.send(`Uh oh, something went wrong.\nError: ${err}`);
			return;
		}

		var title = text.split('<title>')[1].split('</title>')[0];
		
		games.push({
			title: title,
			link: "/games/" + files[i].substr(0, files[i].length - 4)
		});
	}

	games = {"games": games};
	res.render('pages/games', games);
});

app.get('/games/:game_name', (req, res) => {
	var gameName = req.params.game_name;
	if (fs.existsSync(`views/pages/games/${gameName}.ejs`)) {
		var text = fs.readFileSync(`views/pages/games/${gameName}.ejs`, "utf-8");
		var title = text.split('<title>')[1].split('</title>')[0];

		var game = {"game": {
				title: title,
				file: gameName + ".ejs"
			}
		};
		res.render("pages/game-player", game);
	}
	else
		res.send("Sorry, the page you requested does not exist.");
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));