import { Map } from "./map";

const map = new Map();
map.drawMap();

map.getSelectedCountryId().then((id) => {
  console.log(id);
});
