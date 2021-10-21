import { select, json, geoPath, geoNaturalEarth1 } from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { feature } from "topojson-client";

const svg = select("svg");

const projection = geoNaturalEarth1();
const pathGenerator = geoPath().projection(projection);

svg
  .append("path")
  .attr("class", "sphere")
  .attr("d", pathGenerator({ type: "Sphere" }));

json("https://unpkg.com/world-atlas@1.1.4/world/110m.json").then(
  (data: any) => {
    const countries = feature(data, data.objects.countries);
    svg
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", pathGenerator as unknown as any);
  }
);
