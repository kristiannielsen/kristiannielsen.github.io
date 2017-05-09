(function() {

	//Width and height
	var w = 500;
	var h = 500;

	// variable for holding data when its loaded the first time
	var geo_data;

	var colors = ["rgb(85, 214, 190)", "rgb(252,100,113)", "rgb(125,91,166)", "rgb(255,193,94)", "rgb(71,255,141)"];

	//Create SVG elements
	var svg = d3.select("#infomap")
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	d3.json("data/boroughs.json", function(map_data){

		// method for calculating the right projection taken from Mike Bostock's 
		// answer here: http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object#14691788
		var projection = d3.geo.mercator()
			   .scale(1) 
			   .translate([0,0]);

		var path = d3.geo.path()
						 .projection(projection);

		var bbox = path.bounds(map_data);

		var scale = .95 / Math.max((bbox[1][0] - bbox[0][0]) / w, (bbox[1][1] - bbox[0][1]) / h);

		var translator = [(w - scale * (bbox[1][0] + bbox[0][0])) / 2, (h - scale * (bbox[1][1] + bbox[0][1])) / 2];
		
		projection.scale(scale)
			.translate(translator);

		// create the map
		svg.selectAll("path")
			.data(map_data.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("fill", "rgb(240, 239, 244)")
			.style("stroke", "rgb(180,180,180)");

		// read the crime data pointss
		d3.csv("data/borough_accident_count.csv", function(csv) {

			// store the data in the global variable
			geo_data = csv;

			// scale for the radius of the points cetering each borough
			var rScale = d3.scale.linear()
                     .domain([0, d3.max(csv, function(d) { return d.total_accidents; })])
                     .range([5,20]);

			// add a point for each borough
			svg.selectAll("circle")
				.data(csv)
				.enter()
				.append("circle")
				.attr("cx", function(d) {
					return projection([d.lon, d.lat])[0];
				})
				.attr("cy", function(d) {
					return projection([d.lon, d.lat])[1];
				})
				.attr("r", function(d) {
          			return rScale(d.total_accidents);
         		})
				.style("opacity", "0.6")
				.style("fill", function(d, i){
					return colors[i];
				});

			// add total accident values for each circle/borough
			svg.selectAll("text")
		         .data(csv)
		         .enter()
		         .append("text")
		         .text(function(d) {
		         	return d.total_accidents;
		         })
		         .attr("x", function(d) {
		          return projection([d.lon, d.lat])[0];
		         })
		         .attr("y", function(d) {
		          return projection([d.lon, d.lat])[1] + 4;
		         })
		         .attr("font-family", "sans-serif")
		         .attr("font-size", "11px")
		         .attr("fill", "Black")
		         .attr("text-anchor", "middle")
		         .on('mouseover', function(d){
		         	d3.select(this)
		         		.text( function(d) {
		         			return d.borough;
		         	})
		         })
		         .on('mouseout', function(d){
		         	d3.select(this)
		         		.text(function(d) {
		         			return d.total_accidents;
		         	})
		         });
		
		})		
	});
})();