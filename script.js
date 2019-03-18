// adapted from force-graph tutorials on http://www.puzzlr.org/category/d3/


// width & height variables for main chart
const width = 1500
const height = 1500

// load data
Promise.all([
  './nodes.json',
  './links.json'
].map(d => fetch(d).then(d => d.json())))
  .then(d => {
    myVis(d);
  })

// main function

function myVis([node_data, link_data]) {
  console.log(node_data, link_data)

// create main network graph
  var svg = d3.select("p")
              .append("svg")
              .attr("width", width)
              .attr("height", height)

  // create simulation and link force
  var simulation = d3.forceSimulation()
  var link_force = d3.forceLink(link_data)
                     .id(function(d) { return d.NAME; })
                     .distance(80)


// create link map, adapted from https://stackoverflow.com/questions/8739072/highlight-selected-node-its-links-and-its-children-in-a-d3-force-directed-grap
 var linkedByIndex = {};
 link_data.forEach(function(d) {
   linkedByIndex[d.source.index + "," + d.target.index] = 1;
 });

function neighboring(a, b) {
return linkedByIndex[a.index + "," + b.index];
}

// functions for handling drag
var drag_handler = d3.drag()
   .on("start", drag_start)
   .on("drag", drag_drag)
   .on("end", drag_end);

function drag_start(d){
 if (!d3.event.active) simulation.alphaTarget(0.3).restart()
 d.fx = d.x;
 d.fx = d.y;
}

function drag_drag(d){
   d.fx = d3.event.x;
   d.fy = d3.event.y;
};

function drag_end(d) {
 if (!d3.event.active) simulation.alphaTarget(0);
 d.fx = d.x;
 d.fy = d.y;
}

// func to update position of nodes and links
function tickTock(){
 nodes.attr("cx", function(d) { return d.x = Math.max(5, Math.min(width - 5, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(5, Math.min(height - 5, d.y)); });

 links.attr("x1", function(d) {return d.source.x;})
 .attr("y1", function(d) {return d.source.y;})
 .attr("x2", function(d) {return d.target.x;})
 .attr("y2", function(d) {return d.target.y;})
}

  // draw nodes and links
  var links = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(link_data)
                .enter()
                .append("line")
                .attr("stroke", "grey")
                .attr("stroke-width", function(d){
                  return Math.log(d.common_contributions)/3});

var nodes = svg.append("g")
               .attr("class", "nodes")
               .selectAll("circle")
               .data(node_data)
               .enter()
               .append("circle")
               .attr("r", function(d){
                 return Math.log(d.pac_contribs)})
               .attr("fill", "green")
               .on("mouseover", function(d) {
              var xPosition = d.x; // get current mouse position
              var yPosition = d.y;
               // replace green with a function that chooses a color for each
              // node based on a scheme tbd
              // Create the tooltip label
              svg.append("rect")
                 .attr("id", "tooltip_bg")
                .attr("x", xPosition - 150)
                .attr("y", yPosition - 40)
                .attr("fill", "yellow")
                .attr("width", 300)
                .attr("height", 25)
              svg.append("text")
              .attr("id", "tooltip")
              .attr("x", xPosition)
              .attr("y", yPosition - 25)
              .attr("text-anchor", "middle")
              .attr("font-family", "sans-serif")
              .attr("font-size", "15px")
              .attr("font-weight", "bold")
              .attr("fill", "black")
              .text(d.NAME + "\n $" + d.pac_contribs)
            })
              .on("click", function(d){
              svg.append("rect")
                 .attr("id", "infobox")
                 .attr("x", 0)
                 .attr("y", 0)
                 .attr("fill", "light blue")
                 .attr("width", 500)
                 .attr("height", 100)
               svg.append("text")
               .attr("id", "infotext")
               .attr("x", 15)
               .attr("y", 15)
               .attr("text-anchor", "middle")
               .attr("font-family", "sans-serif")
               .attr("font-size", "15px")
               .attr("font-weight", "bold")
               .attr("fill", "black")
               .text(d.filler_text)})

              // for highlighting neighoring nodes
              //      nodes.style("opacity", function(o) {
              //        return neighboring(d, o) ? 1 : opacity;
              //      });
            //)
            .on("mouseout", function() {
              //Remove the tooltip
              d3.select("#tooltip").remove()
              d3.select("#tooltip_bg").remove();
              })



// begin simulation and drag handling

simulation.nodes(node_data)
            .force("charge_force", d3.forceManyBody()
                                     .strength(-300)
                                      )
            .force("center_force", d3.forceCenter(width/2, height/2))
            .on("tick", tickTock)
            .force("links", link_force);

drag_handler(nodes);



}
