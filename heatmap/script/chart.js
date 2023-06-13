/// Modified source copyright
// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

/// Original source copyright (ISC License)
// Copyright 2012–2020 Mike Bostock
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED 'AS IS' AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

export const electricChart = (
  data,
  {
    svgId = "electric-chart",
    width = 900 + 40,
    height = 900 + 10,
    marginTop = 30,
    marginRight = 40,
    marginBottom = 10,
    marginLeft = 40,
    colors,
  } = {}
) => {
  const XValue = Array.from(new Set(data.map((d) => d.x)));
  const YValue = Array.from(new Set(data.map((d) => d.y)));
  const X = d3
    .scaleBand()
    .range([marginLeft, width - marginRight])
    .domain(XValue);
  const Y = d3
    .scaleBand()
    .range([marginTop, height - marginBottom])
    .domain(YValue);
  const formatValue = d3.format(".2f");

  const xAxis = (g) =>
    g
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(X))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "10")
      .style("text-anchor", "start")
      .attr("transform", "rotate(30 20 -35)");

  const yAxis = (g) =>
    g
      .attr("transform", `translate(${width - marginRight},0)`)
      .call(d3.axisRight(Y))
      .call((g) => g.select(".domain").remove());

  const [min, max] = d3.extent(data, (d) => d.value);
  if (colors === undefined) {
    colors = min < 0 ? d3.interpolateRdBu : d3.interpolateBlues;
  }
  const color =
    min < 0
      ? d3.scaleDiverging([-max, 0, max], (t) => colors(1 - t))
      : d3.scaleSequential([0, max], colors);

  const format = () => {
    const f = d3.format(",d");
    return (d) =>
      isNaN(d)
        ? "N/A cases"
        : d === 0
        ? "0 cases"
        : d < 1
        ? "<1 case"
        : d < 1.5
        ? "1 case"
        : `${f(d)} cases`;
  };

  const svg = d3
    .create("svg")
    .attr("id", svgId)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("background", "#fffffc");

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => X(d.x))
    .attr("y", (d) => Y(d.y))
    .attr("width", X.bandwidth() - 1)
    .attr("height", Y.bandwidth() - 1)
    .attr("fill", (d) => color(d.value))
    .append("title")
    .text((d) => `${d.x}, ${d.y}\n${formatValue(d.value)}`);
  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  return Object.assign(svg.node(), {
    scales: {
      color,
    },
  });
};
