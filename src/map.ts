import { zoom } from "d3-zoom";
import { TOPO_MAP_DATA_URL } from "./constants";
import { select, json, geoPath, geoNaturalEarth1 } from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { feature } from "topojson-client";

export class Map {
  private svg = select("svg");
  private projection = geoNaturalEarth1();
  private pathGenerator: any = geoPath().projection(this.projection);
  private g = this.svg.append("g");
  private clickListener: null | ((id: string) => void) = null;

  public idToLabelMappings: Record<string, string> = {};

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

  public async drawMap() {
    const allTopoData: any = await json(TOPO_MAP_DATA_URL);
    const countries = feature(allTopoData, allTopoData.objects.countries);

    this.g
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("id", (country: any) => {
        return "country-" + country.id;
      })
      .attr("d", this.pathGenerator)
      .on("click", (click) => {
        if (this.clickListener) {
          this.clickListener(click.target.__data__.id);
        }
      })
      .append("title")
      .text((country: any) => {
        if (!this.idToLabelMappings) return "";

        return this.idToLabelMappings[country.id];
      });
  }

  public getSelectedCountryId(): Promise<string> {
    return new Promise((resolve) => {
      this.clickListener = resolve;
    });
  }

  set idToColorMappings(mappings: Record<string, string>) {
    Object.entries(mappings).forEach(([id, color]) => {
      const svgPath = document.getElementById("country-" + id);
      if (!svgPath) throw new Error("Can't find svg element");
      svgPath.style.fill = color;
    });
  }
}
