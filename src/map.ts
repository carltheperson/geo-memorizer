import { zoom } from "d3-zoom";
import { DEFAULT_COLOR, TOPO_MAP_DATA_URL } from "./constants";
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
  private currentColoredCountryIds: string[] = [];
  private currentLabeledCountryIds: string[] = [];

  constructor() {
    this.projection.translate([
      document.documentElement.clientWidth / 2,
      document.documentElement.clientHeight / 2,
    ]);
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
      });
  }

  public getSelectedCountryId(): Promise<string> {
    return new Promise((resolve) => {
      this.clickListener = resolve;
    });
  }

  // TODO reset the others

  private getSvgPath(id: string) {
    const svgPath = document.getElementById("country-" + id);
    if (!svgPath) throw new Error("Can't find svg element");
    return svgPath;
  }

  set idToColorMappings(mappings: Record<string, string>) {
    this.currentColoredCountryIds.forEach((id) => {
      const svgPath = this.getSvgPath(id);
      svgPath.style.fill = DEFAULT_COLOR;
    });
    Object.entries(mappings).forEach(([id, color]) => {
      const svgPath = this.getSvgPath(id);
      svgPath.style.fill = color;
    });
    this.currentColoredCountryIds = Object.keys(mappings);
  }

  set idToLabelMappings(mappings: Record<string, string>) {
    this.currentLabeledCountryIds.forEach((id) => {
      const svgPath = this.getSvgPath(id);
      const title = document.getElementById(id + "-title");
      if (title) svgPath.removeChild(title);
    });
    Object.entries(mappings).forEach(([id, title_]) => {
      const svgPath = this.getSvgPath(id);
      const title: any = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
      );
      title.textContent = title_;
      title.id = id + "-title";
      svgPath.appendChild(title);
    });
    this.currentLabeledCountryIds = Object.keys(mappings);
  }
}
