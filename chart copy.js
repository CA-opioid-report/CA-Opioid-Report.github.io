var drawChart = function(){
    // Number to fill in
	var percentNumber = 24;

	// Setting up fonts and style elements for circles
	var fontFamily = "helvetica";
	var fill = "white";
	var inactiveOpacity = 0.20;
	var svgBackgroundColor = 'None';
	var r = 12;

	// Width and height of the SVG
	const width = 500;
	const height = 500;

	// Create an SVG with width and height
	var svg = d3.select('#grid-chart')
		.append('svg')
		.attr("width", width)
		.attr("height", height)
    	.style('background-color', svgBackgroundColor);

	// 10 rows and 10 columns 
	var numRows = 10;
	var numCols = 10;

	// X and y axis scales
	var y = d3.scaleBand()
		.range([0,250])
		.domain(d3.range(numRows));

	var x = d3.scaleBand()
		.range([0, 250])
		.domain(d3.range(numCols));

	// Data is just an array of numbers for each cell in the grid
	var data = [];
	d3.range(numCols*numRows).forEach(function(d){
        data.push({"index": d, "percentNumber": d+1,"active": d < percentNumber})
    })

	// Container to hold the grid
	var container = svg.append("g")
		.attr("transform", "translate(135,130)");
	
	container.selectAll("circle")
			.data(data)
			.enter().append("circle")
			.attr("id", function(d){return "id"+d.index;})
			.attr('cx', function(d){return x(d.index%numCols);})
			.attr('cy', function(d){return y(Math.floor(d.index/numCols));})
			.attr('r', r)
			.attr('fill', fill)
            .attr('opacity', (d) => d.active ? 1 : inactiveOpacity)
}

//Execute function
drawChart();