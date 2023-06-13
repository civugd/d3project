// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

import { electricChart } from "./chart.js";

import { legend } from "./legend.js";

const electricData = await fetch("./data/heatmap_data.csv")
  .then((response) => response.text())
  .then((csvText) =>
    d3.csvParse(csvText, (d) => ({
      x: d["x"],
      y: d["y"],
      value: +d["value"],
    }))
  );

const chart = electricChart(electricData);

const chartLegend = legend(chart.scales.color, {
  title: "参考文献的重合度",
  // tickFormat: "+d",
  width: 360,
  marginLeft: 30,
});

d3.select("body").append(() => chartLegend);
d3.select("body").append(() => chart);
