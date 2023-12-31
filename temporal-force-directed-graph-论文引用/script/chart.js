/// Modified source copyright
// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

/// Original source copyright
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/temporal-force-directed-graph

// simulation will be stopped after 8 sec
export const simulationTimeout = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
  }, 8000);
});

const colors = d3.interpolateBlues;

const color = d3.scaleSequential([0, 1], colors);
export const temporalForceDirectedGraph = ({
  svgId = "temporal-force-directed-graph",
  width = 600,
  height = 600,
  invalidation = simulationTimeout,
} = {}) => {
  const svg = d3
    .create("svg")
    .attr("id", svgId)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  let link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.5)
    .selectAll("line");

  let node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("fill-opacity", 0.8)
    .selectAll("circle");

  const ticked = () => {
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
  };

  const simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody())
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", ticked);

  invalidation.then(() => simulation.stop());

  const drag = (simulation) => {
    const dragstarted = (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return Object.assign(svg.node(), {
    update({ nodes, links }) {
      // Make a shallow copy to protect against mutation, while
      // recycling old nodes to preserve position and velocity.
      const old = new Map(node.data().map((d) => [d.id, d]));
      nodes = nodes.map((d) => Object.assign(old.get(d.id) || {}, d));
      links = links.map((d) => Object.assign({}, d));

      node = node
        .data(nodes, (d) => d.id)
        .join((enter) =>
          enter
            .append("circle")
            .attr("r", (d) => Math.sqrt(d.cited / 10))
            .attr("fill", (d) => color(d.concept_score))
            .call(drag(simulation))
            .call((node) =>
              node.append("title").text(
                (d) =>
                  `${d.name}\ncited: ${
                    d.cited
                  }\npublish date: ${d.start.toLocaleString("en", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}`
              )
            )
        );

      link = link.data(links, (d) => [d.source, d.target]).join("line");

      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart().tick();
      ticked(); // render now!
    },
  });
};
