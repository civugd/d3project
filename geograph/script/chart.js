/// Modified source copyright
// Copyright 2022 Takanori Fujiwara.
// Released under the BSD 3-Clause 'New' or 'Revised' License

/// Original source copyright
// Copyright 2018-2020 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/world-airports-voronoi

import { context2d } from "./dom-context2d.js";
const world = await fetch(
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
).then((response) => response.json());
export const worldAirportsVoronoi = (
  points,
  links,
  { svgId = "world-airports-voronoi", width = 1000, height = width } = {}
) => {
  // const mesh = d3.geoVoronoi(points).cellMesh();
  const land = topojson.feature(world, world.objects.countries);
  // const graticule = d3.geoGraticule10();
  const sphere = {
    type: "Sphere",
  };
  const projection = d3
    .geoEqualEarth()
    .fitExtent(
      [
        [1, 1],
        [width - 1, height - 1],
      ],
      sphere
    )
    .rotate([0, 0]);
  const context = context2d(width, height);
  const path = d3.geoPath(projection, context).pointRadius(1.5);
  const render = () => {
    context.clearRect(0, 0, width, height);

    // context.beginPath();
    // path(graticule);
    // context.lineWidth = 0.5;
    // context.strokeStyle = "#aaa";
    // context.stroke();

    // context.beginPath();
    // path(mesh);
    // context.lineWidth = 0.5;
    // context.strokeStyle = '#000';
    // context.stroke();
    context.beginPath(), path(land), (context.lineWidth = 1.5);
    context.lineWidth = 0.5;
    context.strokeStyle = "#aaa";
    context.stroke();

    context.beginPath();
    path(sphere);
    context.lineWidth = 1;
    context.strokeStyle = "#000";
    context.stroke();

    context.beginPath();
    path({
      type: "MultiPoint",
      coordinates: points,
    });
    context.lineWidth = 0.5;
    context.fillStyle = "rgba(96,143,173,0.5)";
    context.fill();

    context.beginPath();
    path({
      type: "MultiLineString",
      coordinates: links,
    });
    context.lineWidth = 0.5;
    context.strokeStyle = "#f00";
    context.stroke();
  };

  render();
  return context.canvas;
};
