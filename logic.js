'use strict';

var populationSize = 100;
var maxGens = 150;

var pmut = 0.50;

var cities = [];

var variables = {};

function initialize () {

	variables.data = new google.visualization.DataTable();
	variables.data.addColumn('number', 'X');
	variables.data.addColumn('number', 'Current Best');
	variables.data.addColumn('number', 'Current Average');

	variables.options = {
		hAxis: {
			title: 'Generation',
			format: '0',
			viewWindow: {
				min: 0
			}
		},
		vAxis: {
			title: 'Total Time',
			format: '0'
		}
	};

	variables.chart = new google.visualization.LineChart(document.getElementById('linechart_div'));

	parseData();
	var pop = new Population();

	// method to generate an function reference with properly scoped variables
	var fnGenerator = function(pop) {
	    var wrapperFn = function() {
	        pop.generation();
	        pop.updateChart();
	    };
	    return wrapperFn;
	};

	// call the generator and return the wrapping function
	var fnToCall = fnGenerator(pop);

	for (var c = 0; c < 1000; c++) {
		setTimeout(fnToCall, 10);
	}
}

function parseData () {
	cities = [];
	var text = document.getElementById ('textinput').value;

	var cityArray = text.split ('\n');

	for (var c = 0; c < cityArray.length; c++) {
		var currentCity = {};

		var curCityArray = cityArray[c].split(' ');

		currentCity.node = curCityArray[0];
		currentCity.x = curCityArray[1];
		currentCity.y = curCityArray[2];

		cities.push(currentCity);
	}
}

class Individual {
	constructor (indiv) {
		this.tsp = {
			tour: [],
			length: 0,
		};

		this.cities = [];

		for (var c = 0; c < cities.length; c++) {
			this.cities.push(cities[c]);
		}

		if (indiv !== undefined) {
			for (var a = 0; a < indiv.tsp.tour.length; a++) {
				var tempCity = {
					node: indiv.tsp.tour[a].node,
					x: indiv.tsp.tour[a].x,
					y: indiv.tsp.tour[a].y
				};

				this.tsp.tour.push(tempCity);
			}
		}
	}

	createTour () {
		while (this.cities.length > 0) {
			var city = Math.floor (Math.random() * this.cities.length);

			var currentCity = {
				node: this.cities[city].node,
				x: this.cities[city].x,
				y: this.cities[city].y
			};

			this.tsp.tour.push(currentCity);
			this.cities.splice(city, 1);
		}
	}

	calculateTourLength () {
		var tourLength = 0.0;

		for (var c = 0; c < this.tsp.tour.length - 1; c++) {
			var currentLegX = this.tsp.tour[c+1].x - this.tsp.tour[c].x;
			var currentLegY = this.tsp.tour[c+1].y - this.tsp.tour[c].y;
			var currentLeg = Math.sqrt((currentLegX*currentLegX) + (currentLegY*currentLegY));

			tourLength += currentLeg;
		}

		this.tsp.length = tourLength;
	}

	mutate () {
		for (var c = 0; c < this.tsp.tour.length; c++) {
			var mutation = Math.random();

			if (mutation < pmut) {
				var swap = Math.floor(Math.random() * this.tsp.tour.length);

				var tempCity = {
					node: this.tsp.tour[swap].node,
					x: this.tsp.tour[swap].x,
					y: this.tsp.tour[swap].y
				};

				this.tsp.tour[swap].node = this.tsp.tour[c].node;
				this.tsp.tour[swap].x = this.tsp.tour[c].x;
				this.tsp.tour[swap].y = this.tsp.tour[c].y;

				this.tsp.tour[c].node = tempCity.node;
				this.tsp.tour[c].x = tempCity.x;
				this.tsp.tour[c].y = tempCity.y;
			}
		}
	}
}

class Population {
	constructor () {
		this.pop = [];

		for (var c = 0; c < populationSize; c++) {
			var indiv = new Individual();
			indiv.createTour();
			indiv.calculateTourLength();
			this.pop.push (indiv);
		}

		this.pop.sort (function (a, b) {
			return a.tsp.length - b.tsp.length;
		});

		this.currentGen = 0;
	}

	generation () {
		for (var c = 0; c < populationSize; c++) {
			var newCity = new Individual (this.pop[c]);
			newCity.mutate ();
			newCity.calculateTourLength ();
			this.pop.push (newCity);
		}

		this.pop.sort (function (a, b) {
			return a.tsp.length - b.tsp.length;
		});

		this.pop.splice (populationSize, populationSize);

		this.currentGen++;
	}

	updateChart () {
		var bestTourLength = this.pop[0].tsp.length;
		var averageTourLength = 0;

		for (var c = 0; c < this.pop.length; c++) {
			averageTourLength += this.pop[c].tsp.length;
		}

		averageTourLength /= populationSize;

		variables.data.addRow([this.currentGen, bestTourLength, averageTourLength]);
		variables.chart.draw(variables.data, variables.options);
	}
}