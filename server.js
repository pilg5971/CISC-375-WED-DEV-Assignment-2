// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')


var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'usenergy.sqlite3');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

function getTotals(inputYear) {
	
	return new Promise((resolve, reject) => {
		var year = inputYear;
		var c = "";
		db.all("SELECT SUM(coal), SUM(natural_gas), SUM(nuclear), SUM(petroleum), SUM(renewable) FROM Consumption WHERE year = ?", [year], (err, rows) => {
			if (err) {
				throw err;
			}
			let counter = 0;
			for(let i = 0; i < 1; i++){
				
				for(var key in rows[i]){
					c += 'var ';
					if (counter == 0){
						c += 'coal_count = ';
					}
					else if (counter == 1) {
						c += 'natural_gas_count = ';
					}
					else if (counter == 2) {
						c += 'nuclear_count = ';
					}
					else if (counter == 3) {
						c += 'petroleum_count = ';
					}
					else if (counter == 4) {
						c += 'renewable_count = ';
					}
					c += rows[i][key] + '\n';
					counter++;
				}
				
			}

			resolve(c);
			
		});
		
	});
}

function GetYearData(inputYear) {
	return new Promise((resolve, reject) => {
		var year = inputYear;
		var c = "";
		db.all("SELECT state_abbreviation, coal, natural_gas, nuclear, petroleum, renewable, (coal + natural_gas + nuclear + petroleum + renewable) AS total FROM Consumption WHERE year = ?", [year], (err, rows) => {
			if (err) {
				throw err;
			}
			
			for(let i = 0; i < 50; i++){
				c += '<tr>';
				for(var key in rows[i]){
					c += '<td>' + rows[i][key] + '</td>\n';
				}
				c += '</tr>\n';
			}
			resolve(c);
			
		});
		
	});
}

function StateData(inputState) {
	return new Promise((resolve, reject) => {
		
		var c = "";
		db.all("SELECT year, coal, natural_gas, nuclear, petroleum, renewable, (coal + natural_gas + nuclear + petroleum + renewable) AS total FROM Consumption WHERE state_abbreviation = ?", [inputState], (err, rows) => {
			if (err) {
				throw err;
			}
			
			for(let i = 0; i < 58; i++){
				c += '<tr>';
				for(var key in rows[i]){
					c += '<td>' + rows[i][key] + '</td>\n';
				}
				c += '</tr>\n';
			}
			resolve(c);
			
		});
		
	});
}

function GetStateTotals(inputState) {
	return new Promise((resolve, reject) => {
		var a = "";
		var b = "";
		var c = "";
		var d = "";
		var e = "";
		db.all("SELECT coal, natural_gas, nuclear, petroleum, renewable FROM Consumption WHERE state_abbreviation = ?", [inputState], (err, rows) => {
			if(err) {
				throw err;
			}
			/*
			for(let i = 0; i < 5; i++){
				if (i == 0) {
					c += 'var coal_counts = [';
				}
				else if (i == 1) {
					c += 'var natural_gas_counts = [';
				}
				else if (i == 2) {
					c += 'var nuclear_counts = [';
				}
				else if (i == 3) {
					c += 'var petroleum_counts = [';
				}
				else if (i == 4) {
					c += 'var renewable_counts = [';
				}
				for(var key in rows[i]){
					c += rows[i][key] + ', ';
				}
				c = c.substring(0, c.length - 2);
				c += '];\n';
			}
			*/
			
			var c = '';
			
			a = 'var coal_counts = [';
				
			b = 'var natural_gas_counts = [';
				
			c = 'var nuclear_counts = [';
				
			d = 'var petroleum_counts = [';
				
			e = 'var renewable_counts = [';
			
			for (var key in rows) {
				a += rows[key]['coal'] + ', ';
				b += rows[key]['natural_gas'] + ', ';
				c += rows[key]['nuclear'] + ', ';
				d += rows[key]['petroleum'] + ', ';
				e += rows[key]['renewable'] + ', ';
			}
			a = a.substring(0, a.length - 2);
			a += '];\n';
			b = b.substring(0, b.length - 2);
			b += '];\n';
			c = c.substring(0, c.length - 2);
			c += '];\n';
			d = d.substring(0, d.length - 2);
			d += '];\n';
			e = e.substring(0, e.length - 2);
			e += '];\n';
			
			
			var returnString = a +  b +  c +  d +  e;
			resolve(returnString);
		});
	});
}

function GetStateName(inputState) {
	return new Promise((resolve, reject) => {
		var c = "";
		db.all("SELECT state_name FROM States WHERE state_abbreviation = ?", [inputState], (err, rows) => {
			if(err) {
				throw err;
			}
			for(var key in rows[0]){
				c += rows[0][key];
			}
			resolve(c);
		});
	});
};

function GetEnergyData(energy_type) {
	return new Promise((resolve, reject) => {
		var sql = "";
		
		if (energy_type == 'coal') {
			sql = "SELECT year, state_abbreviation, coal FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'natural_gas') {
			sql = "SELECT year, state_abbreviation, natural_gas FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'nuclear') {
			sql = "SELECT year, state_abbreviation, nuclear FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'petroleum') {
			sql = "SELECT year, state_abbreviation, petroleum FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'renewable') {
			sql = "SELECT year, state_abbreviation, renewable FROM Consumption ORDER BY state_abbreviation, year";
		}
		db.all(sql, (err, rows) => {
		
			if(err) {
				throw err;
			}
			var energyDict = new Object();
			energyDict = {
				//"AK":	[]
			};
			
			var holder = [];
			
			for (var key in rows) {
			    energyDict[rows[key]['state_abbreviation']] = [];
			}
			
			var counter = 0;
			for (var state in energyDict) { //first state is AK
				
				for (var i = 0; i < 58; i++){
					
					
					energyDict[state][i] = rows[counter][energy_type];
					counter++;
				}
				
			}
			
			resolve(JSON.stringify(energyDict));
		});
	});
}

function GetEnergyTableData(energy_type) {
	return new Promise((resolve, reject) => {
		var sql = "";
		
		if (energy_type == 'coal') {
			sql = "SELECT year, state_abbreviation, coal FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'natural_gas') {
			sql = "SELECT year, state_abbreviation, natural_gas FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'nuclear') {
			sql = "SELECT year, state_abbreviation, nuclear FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'petroleum') {
			sql = "SELECT year, state_abbreviation, petroleum FROM Consumption ORDER BY state_abbreviation, year";
		}
		else if (energy_type == 'renewable') {
			sql = "SELECT year, state_abbreviation, renewable FROM Consumption ORDER BY state_abbreviation, year";
		}
		db.all(sql, (err, rows) => {
		
			if(err) {
				throw err;
			}
			var energyDict = new Object();
			energyDict = {
				//"AK":	[]
			};
			
			for (var key in rows) {
			    energyDict[rows[key]['state_abbreviation']] = [];
			}
			
			var counter = 0;
			for (var state in energyDict) { //first state is AK
				
				for (var i = 0; i < 58; i++){
					
					
					energyDict[state][i] = rows[counter][energy_type];
					counter++;
				}
				
			}
			
			var c = "";
			
			for (var i = 0; i < 58; i++) {
				c += '<tr>';
				c += '<td>' + (1960 + i) + '</td>\n';
				for (var key in energyDict) {
					c += '<td>' + energyDict[key][i] + '</td>\n';
				}
				c += '</tr>\n';
			}
			
			resolve(c);
		});
	});
}

function IndexCoalData() {
	return new Promise((resolve, reject) => {
		var c = "";
		db.all("SELECT SUM(coal) AS coalCount, SUM(natural_gas) AS gasCount, SUM(nuclear) AS nuclearCount, SUM(petroleum) as petroleumCount, SUM(renewable) AS renewableCount FROM Consumption WHERE year = 2017", (err, rows) => {
			if (err) {
				throw err;
			}
			
			
			for (var i = 0; i < 5; i++) {
				if (i == 0) {
					c += 'var coal_count = ' + rows[0]["coalCount"] + ';\n';
				}
				else if (i == 1) {
					c += 'var natural_gas_count = ' + rows[0]["gasCount"] + ';\n';
				}
				else if (i == 2) {
					c += 'var nuclear_count = ' + rows[0]["nuclearCount"] + ';\n';
				}
				else if (i == 3) {
					c += 'var petroleum_count = ' + rows[0]["petroleumCount"] + ';\n';
				}
				else if (i == 4) {
					c += 'var renewable_count = ' + rows[0]["renewableCount"] + ';\n';
				}
			}
			
			resolve(c);
			
		});
		
	});
}

function IndexTableData() {
	return new Promise((resolve, reject) => {
		var c = "";
		db.all("SELECT state_abbreviation, coal, natural_gas, nuclear, petroleum, renewable FROM Consumption WHERE year = 2017 ORDER BY state_abbreviation", (err, rows) => {
			if (err) {
				throw err;
			}
			
			for(var state in rows) {
				
				c += '<tr>';
				c += '<td>' + rows[state]["state_abbreviation"] + '</td>';
				c += '<td>' + rows[state]["coal"] + '</td>\n' + '<td>' + rows[state]["natural_gas"] + '</td>\n';
				c += '<td>' + rows[state]["nuclear"] + '</td>\n' + '<td>' + rows[state]["petroleum"] + '</td>\n' + '<td>' + rows[state]["renewable"] + '</td></tr>';
				
			}
			/*
			c += '<tr><td>' + rows[0]["state_abbrevation"] + '</td>' + '<td>' + [rows[0]["coalCount"] + '</td>\n' + '<td>' + rows[0]["gasCount"] + '</td>\n';
			c += '<td>' + rows[0]["nuclearCount"] + '</td>\n' + '<td>' + rows[0]["petroleumCount"] + '</td>\n' + '<td>' + rows[0]["renewableCount"] + '</td></tr>';
			*/
			resolve(c);
			
		});
		
	});
}



app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/', (req, res) => {
	
	
    ReadFile(path.join(template_dir, 'index.html')).then((template) => {
        let response = template;
		
		
		
		Promise.all([IndexCoalData(), IndexTableData()]).then((data) => {
			
			response = response.replace(/!!!INDEX_COUNTS!!!/g, data[0]);
			response = response.replace(/!!!INDEX_TABLE_DATA!!!/g, data[1]);
			
			WriteHtml(res, response);
		});
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
	
	if (Number(req.params.selected_year) < 1960 || Number(req.params.selected_year) > 2017) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('ERROR 404:  The requested year ' + req.params.selected_year + ' cannot be found in our database');
		res.end();
	}
	
    ReadFile(path.join(template_dir, 'year.html')).then((template) => {
        let response = template;
		response = response.toString();
		
		var currentYear = Number(req.params.selected_year);
		var prevYear;
		var nextYear;
		if (currentYear != 2017) {
			nextYear = currentYear + 1;
		}
		else {
			nextYear = currentYear;
		}
		if (currentYear != 1960) {
			prevYear = currentYear - 1;
		}
		else {
			prevYear = currentYear;
		}
		
		
		
		Promise.all([GetYearData(req.params.selected_year), getTotals(req.params.selected_year)]).then((data) => {
			
			response = response.replace(/!!!TABLE_DATA!!!/g, data[0]);
			response = response.replace(/!!!COUNTS!!!/g, data[1]);
			response = response.replace(/!!!YEAR_VALUE!!!/g, req.params.selected_year);
			
			response = response.replace(/!!!NEXT_YEAR!!!/g, nextYear);
			
			response = response.replace(/!!!PREV_YEAR!!!/g, prevYear);
			
			WriteHtml(res, response);
		});
		
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
	
	if (req.params.selected_year < 1960 || req.params.selected_year > 2017) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('ERROR 404:  The requested year ' + req.params.selected_year + ' cannot be found in our database');
		res.end();
	}
	
    ReadFile(path.join(template_dir, 'state.html')).then((template) => {
        let response = template;
		response = response.toString();
		var states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN',
		'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
		'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
		'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
		
		
		var currentState = states.indexOf(req.params.selected_state);
		console.log("INDEX OF STATE = " + currentState);
		var prevState;
		var nextState;
		
		nextState = states[(currentState + 1) % 51];
		
		if (currentState == 0) {
			console.log("IN THE IF STATMEETM@!");
			prevState = states[50];
			console.log("PREVSTATE = " + prevState);
		}
		else {
			prevState = states[(currentState - 1)];
		}
		
		console.log(nextState);
		console.log(prevState);
		

		
		Promise.all([StateData(req.params.selected_state), GetStateTotals(req.params.selected_state), GetStateName(req.params.selected_state)]).then((data) => {
			
			response = response.replace(/!!!STATE_TABLE_DATA!!!/g, data[0]);
			response = response.replace(/!!!STATE_DATA!!!/g, data[1]);
			response = response.replace(/!!!STATE_VALUE!!!/g, req.params.selected_state);
			response = response.replace(/!!!STATE_NAME!!!/g, data[2]);
			response = response.replace(/!!!PREV_STATE!!!/g, prevState);
			response = response.replace(/!!!NEXT_STATE!!!/g, nextState);
			
			WriteHtml(res, response);
        });
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
		response = response.toString();
		
		var energys = ['coal', 'natural_gas', 'nuclear', 'petroleum', 'renewable'];
		
		var currentEnergy = energys.indexOf(req.params.selected_energy_type);
		console.log("INDEX OF STATE = " + currentEnergy);
		var prevEnergy;
		var nextEnergy;
		
		nextEnergy = energys[(currentEnergy + 1) % 5];
		
		if (currentEnergy == 0) {
			console.log("IN THE IF STATMEET4r5667M@!");
			prevEnergy = energys[4];
			console.log("PREVSTATE = " + prevEnergy);
		}
		else {
			prevEnergy = energys[(currentEnergy - 1)];
		}
		
		
        Promise.all([GetEnergyData(req.params.selected_energy_type), GetEnergyTableData(req.params.selected_energy_type)]).then((data) => {
			
			response = response.replace(/!!!ENERGY_TYPE!!!/g, req.params.selected_energy_type.charAt(0).toUpperCase() + req.params.selected_energy_type.slice(1));
			response = response.replace(/!!!ENERGY_COUNTS!!!/g, data[0]);
			response = response.replace(/!!!ENERGY_COUNTS_TABLE_DATA!!!/g, data[1]);
			response = response.replace(/!!!PREV_ENERGY!!!/g, prevEnergy.charAt(0).toUpperCase() + prevEnergy.slice(1));
			response = response.replace(/!!!NEXT_ENERGY!!!/g, nextEnergy.charAt(0).toUpperCase() + nextEnergy.slice(1));
			WriteHtml(res, response);
		});
    }).catch((err) => {
        Write404Error(res);
    });
});

function ReadFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString());
            }
        });
    });
}

function Write404Error(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error: file not found');
    res.end();
}

function WriteHtml(res, html) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}


var server = app.listen(port);
