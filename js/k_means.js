(function() {

	//Width and height
	var w = 700;
	var h = 700;

	// variable for holding data when its loaded the first time
	var geo_data;
	var centroids;

	// color arrays - a single one is not used to avoid the colors jumping around
	// because of the arbitrary assigned numbers to the clusters in python
	var colors =[
				[], //dummy array
				[],	// dummy array
				["rgb(85, 214, 190)", "rgb(252,100,113)"], // k=2
				["rgb(252,100,113)", "rgb(85, 214, 190)", "rgb(125,91,166)"], // k=3
				["rgb(85, 214, 190)", "rgb(125,91,166)", "rgb(252,100,113)", "rgb(255,193,94)"], // k=4
				["rgb(85, 214, 190)", "rgb(252,100,113)", "rgb(125,91,166)", "rgb(255,193,94)", "rgb(71,255,141)"], // k=5
				["rgb(85, 214, 190)", "rgb(252,100,113)", "rgb(255,193,94)", "rgb(71,255,141)", "rgb(25, 130, 196)", "rgb(125,91,166)"] // k=6
				];

	//Create SVG elements
	var svg = d3.select("#map")
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
		d3.csv("data/alc_geodata_with_ks.csv", function(csv) {

			// store the data in the global variable
			geo_data = csv;

			// add the crime points 
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
				.attr("r", 5)
				.style("opacity", "0.6")
				.style("fill", function(d){
					return colors[2][d.k2];
				});

			// add the centroids on top of the crime data points
			// default k = 2
			d3.json("data/alc_centroids.json", function(json) {
				centroids = json;
				loadCentroids(centroids.k2);
			});

			
		})		

		// function for adding the centroids
		function loadCentroids(data) {

			svg.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("x", function(d) {
					return projection([d[0], d[1]])[0];
				})
				.attr("y", function(d) {
					return projection([d[0], d[1]])[1];
				})
				.attr("width", 20)
				.attr("height", 20)
				.attr("rx", 10)
				.attr("ry", 10)
				.style("opacity", "0.7")
				.style("fill", "none")
				.style("stroke", "#000");	

		}
		// set the default view to be k = 2
		var currentView = 2;

		// general event handling for the buttons
		d3.selectAll("button.btn.btn-default.kmeans")
			.on("mouseover", function() {
				if(currentView != +this.value){
					updateView(+this.value);
				}
			})
			.on("mouseout", function() {
				if(currentView != +this.value){
					updateView(currentView);
				}
			})
			.on("click", function() {
				if(currentView != +this.value) {
					currentView = +this.value;
					updateView(+this.value);
				}
			});

		function updateView(k) {
				// recolor the crime points depending on what button is triggered
				svg.selectAll("circle")
					.style("fill", function(d) {
						switch (k) {
							case 2:
								return colors[k][d.k2];
							case 3:
								return colors[k][d.k3];
							case 4:
								return colors[k][d.k4];
							case 5:
								return colors[k][d.k5];
							case 6:
								return colors[k][d.k6];
						}
					});

				// helper function for retrieving the right centroids
				function current_centroids(k) {
					switch (k) {
								case 2:
									return centroids.k2;
								case 3:
									return centroids.k3;
								case 4:
									return centroids.k4;
								case 5:
									return centroids.k5;
								case 6:
									return centroids.k6;
							}
						};

				var current_cents = current_centroids(k);

				// the now old centroids are removed 
				svg.selectAll("rect")
					.remove()

				// load the new centroids 	
				loadCentroids(current_cents)


		}
	});
})();