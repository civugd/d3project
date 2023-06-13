// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

import { forceGraph } from "./chart.js";

const miserables = await d3.json("./data/concepts共现网络_.json");

const chart = forceGraph(miserables, {
  nodeId: (d) => d.id,
  // nodeGroup: (d) => d.level,
  nodeFillFunc: (d) => Math.sqrt(d.score),
  nodeTitle: (d) => `${d.name}\nworksCount: ${d.worksCount}`,
  nodeName: (d) => `${d.name}`,
  linkStrokeWidth: (l) => l.value / 1000,
  nodeRadius: (d) => Math.sqrt(d.worksCount / 10),
  linkStrength: (l) => Math.sqrt(l.value / 100000),
  width: 1000,
  height: 600,
});

d3.select("body").append(() => chart);
