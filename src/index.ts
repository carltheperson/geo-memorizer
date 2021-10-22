import { tsv } from "d3-fetch";
import { codes, countryCode } from "emoji-flags";
import { MAP_DATA_URL } from "./constants";
import { Map } from "./map";

const map = new Map();
map.drawMap();

map.getSelectedCountryId().then(async (id) => {
  while (true) {
    const allCountryData: any[] = await tsv(MAP_DATA_URL);
    const code =
      allCountryData.find((countryData) => countryData.iso_n3 === id).iso_a2 ??
      "";
    map.idToLabelMappings = { [id]: countryCode(code).emoji };

    map.idToColorMappings = { [id]: "red" };

    id = await map.getSelectedCountryId();
  }
});
