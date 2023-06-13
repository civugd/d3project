/// Modified source copyright
// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

/// Original source copyright
// Copyright 2020 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/word-cloud

import { wordCloud } from "./chart.js";

const words = await d3.csv("./data/words.csv", d3.autoType);

const chart2 = wordCloud(words, {
  svgId: "word-cloud-2",
  width: 1200,
  height: 500,
  rotate: function () {
    return ~~(Math.random() * 2) * 90;
  },
  padding: 1,
});

d3.select("body").append(() => chart2);
