// adapted from force-graph tutorials on http://www.puzzlr.org/category/d3/


// width & height variables for main chart
const width = 1200
const height = 1200

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

var FadeTracker = 0

// create main network graph
  var svg = d3.select("#graph")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .on("click", function(d){
            //  if (FadeTracker = 1) {nodes.style("fill-opacity", 1), console.log(FadeTracker)}
              })

  // create simulation and link force
  var simulation = d3.forceSimulation()
  var link_force = d3.forceLink(link_data)
                     .id(function(d) { return d.NAME; })
                     .distance(80)

// create link map, adapted from https://stackoverflow.com/questions/8739072/highlight-selected-node-its-links-and-its-children-in-a-d3-force-directed-grap
 var linkedByIndex = {};
 link_data.forEach(function(d) {
   linkedByIndex[d.source + "," + d.target] = true;
   linkedByIndex[d.target + "," + d.source] = true; // solves nodeless link problem
 });

 function isConnected(a, b) {
       return linkedByIndex[a.NAME + "," + b.NAME] || linkedByIndex[b.NAME + "," + a.index] || a.index === b.index;
   }
// functions for handling drag
var drag_handler = d3.drag()
   .on("drag", drag_drag)
   .on("start", drag_start)
   .on("end", drag_end);

function drag_start(d){
 if (!d3.event.active) {
   simulation.alphaTarget(0.3).restart()
 }
}

function drag_drag(d){
   d.fx = d3.event.x;
   d.fy = d3.event.y;
};

function drag_end(d) {
 if (!d3.event.active) {
   simulation.alphaTarget(0);
 }
 d.fx = d.x;
 d.fy = d.y;
}

function fade(opacity) {
    return function(d) {
        nodes.style("stroke-opacity", function(o) {
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            return thisOpacity;
        });
        links.style("stroke-opacity", function(o) {
                return o.source === d || o.target === d ? 1 : opacity;
            })}};

const fader = fade(0.1);
const defade = fade(1);

// func to update position of nodes and links
function tickTock(){
 nodes.attr("cx", function(d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); });

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
                  return Math.log(d.common_contributions)/2});

var nodes = svg.append("g")
               .attr("class", "nodes")
               .selectAll("circle")
               .data(node_data)
               .enter()
               .append("circle")
               .attr("r", function(d){
                 return d.scale})
                 //return Math.log(d.pac_contribs)})
               .attr("fill", "green")
               .on("mouseover", function(d) {
              var xPosition = d.x; // get current mouse position
              var yPosition = d.y;

              // Create the tooltip label
              d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#name")
                .text(d.NAME)

              d3.select("#contribs") // one line?
                .text(d.pac_contribs);

                d3.select("#tooltip").classed("hidden", false);
            })
               // .on("click", fader)
               // , function(d){
               //   d3.select("#infobox")
               //     .append("text")
               //     .text(d.filler_text)
               //})
              .on("click", function(d){
                fader(d)
              //  else {defade(d), FadeTracker = 0};
              //  fader(d),
                d3.select("#Employer")
                  .text(d.EMPLOYER);
                d3.select("#Occupation")
                    .text(d.OCCUPATION);
              })
            // .on("click", function () {if (FadeTracker === 0) {fade(.1),
          //   FadeTracker = 1}
        //     else {fade(1), FadeTracker = 0}})
            .on("mouseout", function() {
              d3.select("#tooltip").classed("hidden", true);
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
