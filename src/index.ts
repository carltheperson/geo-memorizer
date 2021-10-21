import { Map } from "./map";

const map = new Map();
map.drawMap();
map.idToLabelMappings = { "840": "us" };

map.getSelectedCountryId().then((id) => {
  console.log(id);
});
