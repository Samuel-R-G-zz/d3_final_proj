// adapted from force-graph tutorials on http://www.puzzlr.org/category/d3/

// toy data to be replaced with real imported data some point
//  var node_data =  [
//     {"name": "Mr. Moneybags", "contrib": "100"},
//     {"name": "Joe Billionaire", "contrib": "500"},
//     {"name": "Peter Peso", "contrib": "2"},
//     {"name": "Dr. von Deutchesmark", "contrib": "1000"},
//     {"name": "Bruce Wayne", "contrib": "50000"}]
//
// var link_data = [
//   {"source": "Mr. Moneybags", "target":"Joe Billionaire"},
//   {"source": "Mr. Moneybags", "target":"Peter Peso"},
//   {"source": "Mr. Moneybags", "target":"Dr. von Deutchesmark"},
//   {"source": "Mr. Moneybags", "target":"Bruce Wayne"},
//   {"source": "Bruce Wayne", "target":"Peter Peso"},
//   {"source": "Bruce Wayne", "target":"Joe Billionaire"}]

const width = 1000
const height = 1000

Promise.all([
  './nodes.json',
  './links.json'
].map(d => fetch(d).then(d => d.json())))
  .then(d => {
    myVis(d);
  })

function myVis([node_data, link_data]) {
  console.log(node_data, link_data)

  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)

  // create simulation and forces

  var simulation = d3.forceSimulation()

  var link_force = d3.forceLink(link_data)
                     .id(function(d) { return d.NAME; })

  // draw nodes and links
  function nodeSize(d) {
    return 5
  };

  var links = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(link_data)
                .enter()
                .append("line")
                .attr("stroke", "grey")
                .attr("stroke-width", 2);
                // change this to a function at some point
                // to adjust stroke width based on donations in common
                var nodes = svg.append("g")
                               .attr("class", "nodes")
                               .selectAll("circle")
                               .data(node_data)
                               .enter()
                               .append("circle")
                               .attr("r", 10)
                               .attr("fill", "green")
                               // for unclear reasons adding tooltips screws up the chart
                            //   .append("title")
                              // .text(function(d) {
                                //  return "Name: " + d.name + "Contributions" + d.contrib;
                              // });
                               // replace green with a function that chooses a color for each
                              // node based on a scheme tbd
  // drag handling
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
    nodes.attr("cx", function(d) {return d.x;})
    .attr("cy", function(d) {return d.y;});

    links.attr("x1", function(d) {return d.source.x;})
    .attr("y1", function(d) {return d.source.y;})
    .attr("x2", function(d) {return d.target.x;})
    .attr("y2", function(d) {return d.target.y;})
  }

  simulation.nodes(node_data)
            .force("charge_force", d3.forceManyBody())
            .force("center_force", d3.forceCenter(width/2, height/2))
            .on("tick", tickTock)
            .force("links", link_force);

  drag_handler(nodes);

}
