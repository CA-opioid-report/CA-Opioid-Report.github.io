var drawChart = function(percentNumber, grid_id_name, numCols, numRows){
	// Set up grid_id
	grid_id = "#" + grid_id_name

	// Setting up fonts and style elements for circles
	var fontFamily = "helvetica";
	var fill = "#054a91";
	var inactiveOpacity = 0.20;
	var svgBackgroundColor = 'None';
	var r = 12;

	// Width and height of the SVG
	const width = 400;
	const height = 400;

	// Create an SVG with width and height
	var svg = d3.select(grid_id)
		.append('svg')
		.attr("width", width)
		.attr("height", height)
    	.style('background-color', svgBackgroundColor);

	// 10 rows and 10 columns 
	//var numRows = numRows;
	//var numCols = numCols;

	// Set range for Y
	y_range = numRows * 25

	// X and y axis scales
	var y = d3.scaleBand()
		.range([0,y_range])
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
		.attr("transform", "translate(15,50)");
	
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
drawChart(0, "grid-chart", 10, 10);
drawChart(60, "grid-2012", 10, 10);
//drawChart(50, "grid-2017", 10, 10);
drawChart(30, "grid-2022", 10, 10);