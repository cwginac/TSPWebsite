'use strict';

var populationSize = 1000;
var maxGens = 150;

var pMut = 0.01;
var pCross = 1.0;

var cities = [];

var variables = {};

var difference = 0;
var timesDifference = 0;

var runs = [];

function initialize () {
	cities = [];

	variables = {};

	document.getElementById('textinput').disabled = true;
	document.getElementById('parseData').disabled = true;
	document.getElementById('clearData').disabled = true;

	var popSizeString = document.getElementById('popSize').value;
	var popSizeTempValue = parseInt(popSizeString, 10);
	var pCrossString = document.getElementById('pCross').value;
	var pCrossTempValue = parseInt(pCrossString, 10);
	var pMutString = document.getElementById('pMut').value;
	var pMutTempValue = parseInt(pMutString, 10);

	if(!isNaN(popSizeTempValue) && popSizeTempValue > 500) {
		populationSize = popSizeTempValue;
	}

	if(!isNaN(pCrossTempValue) && pCrossTempValue >= 0 && pCrossTempValue <= 1) {
		pCross = pCrossTempValue;
	}

	if(!isNaN(pMutTempValue) && pMutTempValue >= 0 && pMutTempValue <= 1) {
		pMut = pMutTempValue;
	}
	
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

	variables.map = new google.visualization.LineChart(document.getElementById('map_div'));

	parseData();

	/*
	var bestIndiv = new Individual();

	bestIndiv.createBestTour ();
	bestIndiv.calculateTourLength ();

	alert (bestIndiv.tsp.length); */

	var pop = new Population();

	pop.generation();
}

function parseData () {
	cities = [];
	var text = document.getElementById ('textinput').value;

	var cityArray = text.split ('\n');

	for (var c = 0; c < cityArray.length; c++) {
		var currentCity = {};

		var curCityArray = cityArray[c].split(' ');

		if(!isNaN(parseInt(curCityArray[0]))) {
			currentCity.node = curCityArray[0];
			currentCity.x = curCityArray[1];
			currentCity.y = curCityArray[2];

			cities.push(currentCity);
		}
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

	copy (indiv) {
		this.tsp.tour = [];
		for (var c = 0; c < indiv.tsp.tour.length; c++) {
			var tempCity = {
				node: indiv.tsp.tour[c].node,
				x: indiv.tsp.tour[c].x,
				y: indiv.tsp.tour[c].y
			};

			this.tsp.tour.push (tempCity);
		}
	}

/*
	createBestTour () {
		var bestTour = '1,49,32,45,19,41,8,9,10,43,33,51,11,52,14,13,47,26,27,28,12,25,4,6,15,5,24,48,38,37,40,39,36,35,34,44,46,16,29,50,20,23,30,2,7,42,21,17,3,18,31,22';
		var bestArray = bestTour.split (',');

		var current = 0;
		while (current < this.cities.length) {
			var city = bestArray[current] - 1;

			current++;
			var currentCity = {
				node: this.cities[city].node,
				x: this.cities[city].x,
				y: this.cities[city].y
			};

			this.tsp.tour.push(currentCity);
		}
	}
*/

	createTour () {
		var firstCity = {
			node: this.cities[0].node,
			x: this.cities[0].x,
			y: this.cities[0].y
		};

		this.tsp.tour.push(firstCity);
		this.cities.splice(0, 1);

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

		this.tsp.tour.push(firstCity);
	}

	calculateTourLength () {
		var tourLength = 0.0;

		for (var c = 0; c < this.tsp.tour.length - 1; c++) {
			var currentLegX = this.tsp.tour[c+1].x - this.tsp.tour[c].x;
			var currentLegY = this.tsp.tour[c+1].y - this.tsp.tour[c].y;
			var currentLeg = Math.floor(Math.sqrt((currentLegX*currentLegX) + (currentLegY*currentLegY)));

			tourLength += currentLeg;
		}

		this.tsp.length = tourLength;
	}

	mutate () {
		for (var c = 1; c < this.tsp.tour.length - 1; c++) {
			var mutation = Math.random();

			if (mutation < pMut) {
				var swap = Math.floor(Math.random() * (this.tsp.tour.length - 2)) + 1;

				var leg1x = this.tsp.tour[c].x - this.tsp.tour[c-1].x;
				var leg1y = this.tsp.tour[c].y - this.tsp.tour[c-1].y;
				var leg1 = Math.floor(Math.sqrt((leg1x*leg1x) + (leg1y*leg1y)));

				var leg2x = this.tsp.tour[c+1].x - this.tsp.tour[c].x;
				var leg2y = this.tsp.tour[c+1].y - this.tsp.tour[c].y;
				var leg2 = Math.floor(Math.sqrt((leg2x*leg2x) + (leg2y*leg2y)));

				var leg3x = this.tsp.tour[swap].x - this.tsp.tour[swap-1].x;
				var leg3y = this.tsp.tour[swap].y - this.tsp.tour[swap-1].y;
				var leg3 = Math.floor(Math.sqrt((leg3x*leg3x) + (leg3y*leg3y)));

				var leg4x = this.tsp.tour[swap+1].x - this.tsp.tour[swap].x;
				var leg4y = this.tsp.tour[swap+1].y - this.tsp.tour[swap].y;
				var leg4 = Math.floor(Math.sqrt((leg4x*leg4x) + (leg4y*leg4y)));

				var oldLength = leg1 + leg2 + leg3 + leg4;

				leg1x = this.tsp.tour[swap].x - this.tsp.tour[c-1].x;
				leg1y = this.tsp.tour[swap].y - this.tsp.tour[c-1].y;
				leg1 = Math.floor(Math.sqrt((leg1x*leg1x) + (leg1y*leg1y)));

				leg2x = this.tsp.tour[c+1].x - this.tsp.tour[swap].x;
				leg2y = this.tsp.tour[c+1].y - this.tsp.tour[swap].y;
				leg2 = Math.floor(Math.sqrt((leg2x*leg2x) + (leg2y*leg2y)));

				leg3x = this.tsp.tour[c].x - this.tsp.tour[swap-1].x;
				leg3y = this.tsp.tour[c].y - this.tsp.tour[swap-1].y;
				leg3 = Math.floor(Math.sqrt((leg3x*leg3x) + (leg3y*leg3y)));

				leg4x = this.tsp.tour[swap+1].x - this.tsp.tour[c].x;
				leg4y = this.tsp.tour[swap+1].y - this.tsp.tour[c].y;
				leg4 = Math.floor(Math.sqrt((leg4x*leg4x) + (leg4y*leg4y)));

				var newLength = leg1 + leg2 + leg3 + leg4;

				if (newLength < oldLength) {
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
		this.currentBest = 0;
		this.currentAverage = 1;

		this.bestIndiv = new Individual(this.pop[0]);
		this.bestIndiv.calculateTourLength();
	}

	generation () {
		for (var c = 0; c < populationSize / 2; c++) {
			this.pmx();
		}

		for (var d = 1; d < populationSize; d++) {
			this.pop[d].mutate();
		}

		this.pop.sort (function (a, b) {
			return a.tsp.length - b.tsp.length;
		});

		this.pop.splice (populationSize, populationSize);

		if(this.pop[0].tsp.length < this.bestIndiv.tsp.length) {
			this.bestIndiv.copy(this.pop[0]);
			this.bestIndiv.calculateTourLength();
		}

		this.currentGen++;

		this.updateChart();

		// method to generate an function reference with properly scoped variables
		var fnGenerator = function(population) {
		    var wrapperFn = function() {
		        population.generation();
		    };
		    return wrapperFn;
		};

		// call the generator and return the wrapping function
		var fnToCall = fnGenerator(this);

		if (difference == Math.floor(this.currentAverage) - Math.floor(this.currentBest)) {
			timesDifference++;
		}
		else {
			timesDifference = 0;
			difference = Math.floor(this.currentAverage) - Math.floor(this.currentBest);
		}

		//if (this.currentGen < 500) {
		//if (this.currentAverage > (this.currentBest) * 1.001) {
		if (timesDifference < 10) {
			setTimeout(fnToCall, 10);
		}
		else {
			document.getElementById('textinput').disabled = false;
			document.getElementById('parseData').disabled = false;
			document.getElementById('clearData').disabled = false;
			
			console.log (runs);
		}
	}

	pmx () {
		var child1 = new Individual();
		var child2 = new Individual();
		
		child1.copy (this.pop[this.getWeightedParent()]);
		child2.copy (this.pop[this.getWeightedParent()]);

		var xOver1 = Math.floor(Math.random() * (child1.cities.length - 2)) + 1;
		var xOver2 = Math.floor(Math.random() * (child1.cities.length - 2)) + 1;

		for (var c = Math.min (xOver1, xOver2); c < Math.max (xOver1, xOver2); c++) {
			var tempValue = 0;
			for (var d = 0; d < child1.tsp.tour.length; d++) {
				if (child1.tsp.tour[d].node == child2.tsp.tour[c].node) {
					tempValue = d;
				}
			}

			var tempCity = {
				node: child1.tsp.tour[c].node,
				x: child1.tsp.tour[c].x,
				y: child1.tsp.tour[c].y
			};

			child1.tsp.tour[tempValue].node = child1.tsp.tour[c].node;
			child1.tsp.tour[tempValue].x = child1.tsp.tour[c].x;
			child1.tsp.tour[tempValue].y = child1.tsp.tour[c].y;

			for (var e = 0; e < child2.tsp.tour.length; e++) {
				if (child2.tsp.tour[e].node == child1.tsp.tour[c].node) {
					tempValue = e;
				}
			}

			child2.tsp.tour[tempValue].node = child2.tsp.tour[c].node;
			child2.tsp.tour[tempValue].x = child2.tsp.tour[c].x;
			child2.tsp.tour[tempValue].y = child2.tsp.tour[c].y;

			child1.tsp.tour[c].node = child2.tsp.tour[c].node;
			child1.tsp.tour[c].x = child2.tsp.tour[c].x;
			child1.tsp.tour[c].y = child2.tsp.tour[c].y;

			child2.tsp.tour[c].node = tempCity.node;
			child2.tsp.tour[c].x = tempCity.x;
			child2.tsp.tour[c].y = tempCity.y;
		}

		//child1.mutate();
		child1.calculateTourLength();

		//child2.mutate();
		child2.calculateTourLength();

		this.pop.push(child1);
		this.pop.push(child2);
	}

	getWeightedParent () {
		var totalWeight = (populationSize*(populationSize + 1))/2;

		var random = Math.floor (Math.random () * totalWeight);

		var currentWeight = 0;
		for (var c = 0; c < populationSize; c++) {
			currentWeight += (populationSize - c);
			if(random < currentWeight) {
				return c;
			}
		}
	}

	updateChart () {
		var bestTourLength = this.pop[0].tsp.length;
		var averageTourLength = 0;

		for (var c = 0; c < this.pop.length; c++) {
			averageTourLength += this.pop[c].tsp.length;
		}

		averageTourLength /= populationSize;

		this.currentBest = bestTourLength;
		this.currentAverage = averageTourLength;

		variables.data.addRow([this.currentGen, bestTourLength, averageTourLength]);
		variables.chart.draw(variables.data, variables.options);
		document.getElementById('average').innerHTML = "Average: " + Math.floor(averageTourLength).toString();
		document.getElementById('best').innerHTML = "Best: " + Math.floor(bestTourLength).toString();
		document.getElementById('diff').innerHTML = "Difference: " + Math.floor(averageTourLength - bestTourLength).toString();

		variables.mapData = new google.visualization.DataTable();
		variables.mapData.addColumn('number', 'X');
		variables.mapData.addColumn('number', 'Y');

		for (var d = 0; d < this.bestIndiv.tsp.tour.length; d++) {
			variables.mapData.addRow([parseInt(this.bestIndiv.tsp.tour[d].x, 10), parseInt(this.bestIndiv.tsp.tour[d].y, 10)]);	
		}

		variables.map.draw(variables.mapData);
		
	}
}