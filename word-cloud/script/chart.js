/// Modified source copyright
// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

/// Original source copyright
// Copyright 2020 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/word-cloud

export const wordCloud = (
  data,
  {
    svgId = "word-cloud",
    size = (group) => group.length, // Given a grouping of words, returns the size factor for that word
    word = (d) => d, // Given an item of the data array, returns the word
    marginTop = 0, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 0, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    maxWords = 250, // maximum number of words to extract from the text
    fontFamily = "sans-serif", // font family
    fontScale = 15, // base font size
    padding = 0, // amount of padding between the words (in pixels)
    rotate = 0, // a constant or function to rotate the words
    invalidation = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 60000);
    }), // when this promise resolves, stop the simulation
  } = {}
) => {
  // const words = typeof text === "string" ? text.split(/\W+/g) : Array.from(text);

  // const data = d3.rollups(words, size, w => w)
  //   .sort(([, a], [, b]) => d3.descending(a, b))
  //   .slice(0, maxWords)
  //   .map(([key, size]) => ({
  //     text: word(key),
  //     size
  //   }));
  // const data = data;
  const colorList = ["#0A4D68", "#088395", "#05BFDB", "#00FFCA"];
  const svg = d3
    .create("svg")
    .attr("id", svgId)
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("font-family", fontFamily)
    .attr("text-anchor", "middle")
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const g = svg
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`);
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip-donut")
    .style("opacity", 0);
  const cloud = d3.layout
    .cloud()
    .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
    .words(data)
    .padding(padding)
    .rotate(rotate)
    .font(fontFamily)
    .fontSize((d) => (Math.sqrt(d.size) / 50) * fontScale)
    .on("word", ({ size, x, y, rotate, text }) => {
      g.append("text")
        .attr("font-size", size)
        .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
        .on("mouseover", function () {
          d3.select(this)
            .transition()
            .duration("100")
            .attr("font-size", size * 2);

          div.transition().duration("100").style("opacity", 1);
          console.log([x + 5 + "px", y - 5 + "px"]);
          div
            .text(Math.round(((size / fontScale) * 50) ** 2))
            .style("left", x + 5 + "px")
            .style("top", y - 5 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration("50").attr("font-size", size);
          div.transition().duration(50).style("opacity", 0);
        })
        .style("fill", colorList[size % 4])
        .text(text);
    });

  cloud.start();
  invalidation && invalidation.then(() => cloud.stop());
  return svg.node();
};
