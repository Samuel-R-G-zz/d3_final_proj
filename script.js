// adapted from force-graph tutorials on http://www.puzzlr.org/category/d3/


// width & height variables for main chart
const width = 1200
const height = 900

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

// for scaling https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
var contribMax = Math.max.apply(Math,node_data.map(function(o){return o.pac_contribs;}))
var contribMin = Math.min.apply(Math,node_data.map(function(o){return o.pac_contribs;}))
var commonMax = Math.max.apply(Math,link_data.map(function(o){return o.common_contributions;}))
var commonMin = Math.min.apply(Math,link_data.map(function(o){return o.common_contributions;}))

const rangeMax = 35
const rangeMin = 5

var nodeScaling = d3.scaleSqrt()
  .domain([contribMin, contribMax])
  .range([rangeMin, rangeMax]);

var linkScaling = d3.scaleLinear()
    .domain([commonMin, commonMax])
    .range([.1, 1]);

  var linkScaling2 = d3.scaleLinear()
      .domain([commonMin, commonMax])
      .range([1, 40]);

// create main network graph
  var svg = d3.select("#graph")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .on("click", function(d){
            //  if (FadeTracker = 1) {nodes.style("fill-opacity", 1), console.log(FadeTracker)}
              })

// create background rect for defading
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .on("click", function(d){defade(1)
      d3.selectAll("circle").style("stroke", "black").style("stroke-width", 2)
})


var node_legend_svg = d3.select("#node_legend").append("svg").attr("width", 100).attr("height", 45)
var link_legend_svg = d3.select("#node_legend").append("svg").attr("width", 100).attr("height", 40)

node_legend_svg.append("g").append("circle")
    .attr("r", 20)
    .attr("fill", "green")
    .style('transform', 'translate(50%, 50%)')

link_legend_svg.append('line')
    .attr("x1", 10)
    .attr("y1", 15)
    .attr("x2", 100)
    .attr("y2", 15)
    .attr("stroke", "grey")
    .attr("stroke-width", 10)


  // create simulation and link force
  var simulation = d3.forceSimulation()
  var link_force = d3.forceLink(link_data)
                     .id(function(d) { return d.NAME; })
                     .distance(150)
                     .strength(function(d){return linkScaling(d.common_contributions)})

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
 nodes.attr("cx", function(d) { return d.x = Math.max(rangeMax, Math.min(width - rangeMax, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(rangeMax, Math.min(height - rangeMax, d.y)); });

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
                .attr("stroke", "#3D3C3A")
                .attr("stroke-width", function(d){
                  return linkScaling2(d.common_contributions)});

var nodes = svg.append("g")
               .attr("class", "nodes")
               .selectAll("circle")
               .data(node_data)
               .enter()
               .append("circle")
               .attr("r", function(d){
                 return nodeScaling(d.pac_contribs)})
               .attr("fill", "green")
               .style("stroke", "black").style("stroke-width", 2)
               .on("mouseover", function(d) {
              var xPosition = d.x; // get current mouse position
              var yPosition = d.y;

              // Create the tooltip label
              d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#name")
                .text(d.NAME)
              d3.select("#contribs")
                .text(d.pac_contribs);
                d3.select("#tooltip").classed("hidden", false);
            })
              .on("click", function(d){
                fader(d)
                d3.selectAll("circle").style("stroke", "black").style("stroke-width", 2)
                selected_node = d3.select(this)
                selected_node.style("stroke", "gold").style("stroke-width", 5)
                d3.select("#name")
                  .text(d.NAME)
                d3.select("#employer")
                  .text(d.EMPLOYER);
                d3.select("#occupation")
                    .text(d.OCCUPATION);
                d3.select("#recipient_1")
                    .text(d.recipients[0]);
                d3.select("#recipient_2")
                    .text(d.recipients[1]);
                d3.select("#recipient_3")
                    .text(d.recipients[2]);
                d3.select("#recipient_4")
                    .text(d.recipients[3]);
                d3.select("#recipient_5")
                    .text(d.recipients[4]);
                d3.select("#recipient_6")
                    .text(d.recipients[5]);
                d3.select("#recipient_7")
                    .text(d.recipients[6]);
                d3.select("#recipient_8")
                    .text(d.recipients[7]);
                d3.select("#recipient_9")
                    .text(d.recipients[8]);
                d3.select("#recipient_10")
                    .text(d.recipients[9]);                                  })
            .on("mouseout", function() {
              d3.select("#tooltip").classed("hidden", true);
              })



// begin simulation and drag handling

simulation.nodes(node_data)
            .force("charge_force", d3.forceManyBody()
                                     .strength(-300)
                                      )
            .force("center_force", d3.forceCenter(width/3, height/2))
            .on("tick", tickTock)
            .force("links", link_force);

drag_handler(nodes);



}
