import { zoom } from "d3-zoom";
import { MAP_DATA_URL, TOPO_MAP_DATA_URL } from "./constants";
import { select, json, geoPath, geoNaturalEarth1, tsv } from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { feature } from "topojson-client";

export class Map {
  private svg = select("svg");
  private projection = geoNaturalEarth1();
  private pathGenerator: any = geoPath().projection(this.projection);
  private g = this.svg.append("g");
  private clickListener: null | ((id: string) => void) = null;

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
    const allCountryData: any[] = await tsv(MAP_DATA_URL);
    const countries = feature(allTopoData, allTopoData.objects.countries);

    this.g
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", this.pathGenerator)
      .on("click", (click) => {
        if (this.clickListener) {
          this.clickListener(click.target.__data__.id);
        }
      })
      .append("title")
      .text((country: any) => {
        const name =
          allCountryData.find(
            (countryData) => countryData.iso_n3 === country.id
          ).name_long ?? "Name not found";
        return name;
      });
  }

  public getSelectedCountryId(): Promise<string> {
    return new Promise((resolve) => {
      this.clickListener = resolve;
    });
  }
}
