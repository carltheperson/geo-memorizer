import { zoom } from "d3-zoom";
import { select, json, geoPath, geoNaturalEarth1 } from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { feature } from "topojson-client";

export class Map {
  private svg = select("svg");
  private projection = geoNaturalEarth1();
  private pathGenerator: any = geoPath().projection(this.projection);
  private g = this.svg.append("g");

  constructor() {
    this.g
      .append("path")
      .attr("class", "sphere")
      .attr("d", this.pathGenerator({ type: "Sphere" }));

    this.svg.call(
      zoom().on("zoom", (event) => {
        this.g.attr("transform", event.transform);
      }) as any
    );
  }

  public drawMap(): void {
    json("https://unpkg.com/world-atlas@1.1.4/world/50m.json").then(
      (data: any) => {
        const countries = feature(data, data.objects.countries);
        this.g
          .selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", this.pathGenerator)
          .append("title")
          .text(() => {
            console.log("hello");
            return "test";
          });
      }
    );
  }
}
