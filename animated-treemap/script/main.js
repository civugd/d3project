// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

import { animatedTreemap } from "./chart.js";

import { scrubber } from "./scrubber.js";

const prepareData = async () => {
  const keys = d3.range(1956, 2024, 1);
  const [regions, states] = await Promise.all([
    d3.text("./data/State2Division.csv"),
    d3.text("./data/publication.tsv"),
  ]).then(([regions, states]) => [
    d3.csvParse(regions),
    d3.tsvParse(states, (d, i) =>
      i === 0
        ? null
        : {
            name: d["State"],
            country: d["Continent"],
            values: keys.map((key) => +d[key].replace(/,/g, "")),
          }
    ),
  ]);
  const divisionByState = new Map(regions.map((d) => [d.State, d.Division]));
  return {
    keys,
    group: d3.group(states, (d) => divisionByState.get(d.name)),
  };
};

const data = await prepareData();

const chart = animatedTreemap(data);

const scrubberForm = scrubber(d3.range(data.keys.length), {
  autoplay: false,
  chartUpdate: chart.update,
  delay: 100,
  loop: false,
  format: (i) => [...data.keys][i],
});

d3.select("body").append(() => scrubberForm.node());
d3.select("body").append(() => chart);
