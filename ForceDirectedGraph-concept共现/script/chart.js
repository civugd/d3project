/// Modified source copyright
// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

/// Original source copyright
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/force-directed-graph

export const forceGraph = (
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links, // an iterable of link objects (typically [{source, target}, …])
  },
  {
    svgId = "force-graph",
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeName,
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeFillFunc,
    nodeOpacity = 0.8,
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 0.8, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.3, // link stroke opacity
    linkStrokeWidth = 0.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation = new Promise((resolve, reject) => {
      // when this promise resolves, stop the simulation
      setTimeout(() => {
        resolve();
      }, 8000); // simulation will be stopped after 8 sec
    }),
  } = {}
) => {
  const intern = (value) =>
    value !== null && typeof value === "object" ? value.valueOf() : value;

  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
  const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const NName = nodeName == null ? null : d3.map(nodes, nodeName);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  const R = typeof nodeRadius !== "function" ? null : d3.map(nodes, nodeRadius);
  const NFill =
    typeof nodeFillFunc !== "function" ? null : d3.map(nodes, nodeFillFunc);
  const W =
    typeof linkStrokeWidth !== "function"
      ? null
      : d3.map(links, linkStrokeWidth);

  const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);
  const LStrength =
    typeof linkStrength !== "function" ? null : d3.map(links, linkStrength);
  const NStrength =
    typeof nodeStrength !== "function" ? null : d3.map(links, nodeStrength);
  var colorScale;
  if (NFill) {
    var max = d3.max(NFill);
    colorScale = d3.scaleSequential([0, max], d3.interpolateBlues);
  }
  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({
    id: N[i],
  }));
  links = d3.map(links, (_, i) => ({
    source: LS[i],
    target: LT[i],
  }));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Construct the forces.
  const forceNode = d3.forceManyBody();
  const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);
  forceLink.distance(200);
  if (nodeStrength !== undefined)
    forceNode.strength(({ index: i }) => NStrength[i]);
  if (linkStrength !== undefined)
    forceLink.strength(({ index: i }) => LStrength[i]);

  const svg = d3
    .create("svg")
    .attr("id", svgId)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const link = svg
    .append("g")
    .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
    .attr("stroke-opacity", linkStrokeOpacity)
    .attr(
      "stroke-width",
      typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
    )
    .attr("stroke-linecap", linkStrokeLinecap)
    .selectAll("line")
    .data(links)
    .join("line");

  const node = svg
    .append("g")
    .attr("fill", nodeFill)
    .attr("opacity", nodeOpacity)
    .attr("stroke", nodeStroke)
    .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-width", nodeStrokeWidth)
    .selectAll("circle")
    .data(nodes)
    .join("circle");
  const label = svg
    .selectAll(null)
    .data(nodes)
    .enter()
    .append("text")
    .text(null)
    .style("text-anchor", "middle")
    .style("fill", "#555")
    .style("font-family", "Arial")
    .style("font-size", 10)
    .style("user-select", "none");
  const simulation = d3
    .forceSimulation(nodes)
    .force("link", forceLink)
    .force("charge", forceNode)
    .force("center", d3.forceCenter())
    .on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label
        .attr("x", function (d) {
          return d.x;
        })
        .attr("y", function (d) {
          return d.y - 17;
        });
    });

  const drag = (simulation) => {
    const dragstarted = (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      if (invalidation != null) invalidation.then(() => simulation.stop());
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    };

    const dragged = (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragended = (event) => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    };

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  node.call(drag(simulation));
  if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
  if (L) link.attr("stroke", ({ index: i }) => L[i]);
  if (G) node.attr("fill", ({ index: i }) => color(G[i]));
  if (NFill) node.attr("fill", ({ index: i }) => colorScale(NFill[i]));
  if (R) node.attr("r", ({ index: i }) => R[i]);
  if (T) node.append("title").text(({ index: i }) => T[i]);
  if (R && NName) label.text(({ index: i }) => (R[i] > 10 ? NName[i] : null));

  if (invalidation != null) invalidation.then(() => simulation.stop());

  return Object.assign(svg.node(), {
    scales: {
      color,
    },
  });
};
