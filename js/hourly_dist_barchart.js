(function() {
//chart heavily inspired by: https://bl.ocks.org/mbostock/3885304

var svg = d3.select("#barchart"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var weekday = false;

var dataset;

d3.csv("data/hourly_counts_combined.csv", function(d) {
  d.weekday = +d.weekday;
  d.weekend = +d.weekend;
  return d;
}, function(error, data) {
  if (error) throw error;

  dataset = data;

  x.domain(data.map(function(d) { return d.hour; }));
  y.domain([0, d3.max(data, function(d) { return d.weekday; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.hour); })
    .attr("y", function(d) { return y(d.weekday); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.weekday); });

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count");

  g.append("text")
      .attr("id", "barchart1title")
      .attr("x", width/2)
      .attr("y", -5)
      .style("text-anchor", "middle")
      .text("Hourly incident distribution in all boroughs - Weekdays");

    svg.on("click", function(){
      g.selectAll(".bar")
         .data(data)
         .transition()
         .delay(function(d, i) {
            return i * 50;
         })
         .duration(500)
        .attr("y", function(d) { 
                if (weekday){
                  return y(d.weekday); 
                }
                else{
                  return y(d.weekend);
                }
              })
        .attr("height", function(d) { 
                if (weekday){
                  return height - y(d.weekday); 
                }
                else{
                  return height - y(d.weekend); 
                }
        })
         .attr("fill", function(d) {
            return "rgb(0, " + (d * 10) + ", 0)";
         });
         if (weekday){
          weekday = false;
        } else {
          weekday = true;
        }

        g.select("#barchar1title")
          .text(function() {
            if (weekday){
              return "Hourly distribution in all boroughs - Weekends";
            } else {
              return "Hourly distribution in all boroughs - Weekdays";
            }
        });
    });
});

})();