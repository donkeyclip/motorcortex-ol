import { loadPlugin } from "@donkeyclip/motorcortex";
import Player from "@donkeyclip/motorcortex-player";
import MapsDef from "../src/";

const Maps = loadPlugin(MapsDef);

const london = MapsDef.utils.fromLonLat([-0.12755, 51.507222]);
const moscow = MapsDef.utils.fromLonLat([37.6178, 55.7517]);
const tokyo = MapsDef.utils.fromLonLat([139.6917, 35.6895]);
const athens = MapsDef.utils.fromLonLat([23.7275, 37.9838]);
const nyc = MapsDef.utils.fromLonLat([-74.006, 40.7128]);
const sydney = MapsDef.utils.fromLonLat([151.2093, -33.8688]);

// ═══════════════════════════════════════════════════════════════════════
// TEST 1: Street map — arc flight, same zoom both ends (5→5, intermediate 2)
// London → Moscow
// ═══════════════════════════════════════════════════════════════════════
const map1 = new Maps.Clip(
  { parameters: { view: { center: london, zoom: 5 }, baseMap: "street" } },
  {
    host: document.getElementById("clip"),
    containerParams: { width: "1280px", height: "720px" },
  }
);

map1.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 5, center: moscow, intermediateZoom: 2 } } },
    { duration: 5000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  1000
);

// ═══════════════════════════════════════════════════════════════════════
// TEST 2: Satellite map — zoom-in flight, no arc (4→10)
// Athens → Tokyo
// ═══════════════════════════════════════════════════════════════════════
const map2 = new Maps.Clip(
  { parameters: { view: { center: athens, zoom: 4 }, baseMap: "satellite" } },
  {
    host: document.getElementById("clip2"),
    containerParams: { width: "1280px", height: "720px" },
  }
);

map2.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 10, center: tokyo } } },
    { duration: 5000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  1000
);

// ═══════════════════════════════════════════════════════════════════════
// TEST 3: Terrain map — long-haul arc flight (8→8, intermediate 2)
// NYC → Sydney
// ═══════════════════════════════════════════════════════════════════════
const map3 = new Maps.Clip(
  { parameters: { view: { center: nyc, zoom: 8 }, baseMap: "terrain" } },
  {
    host: document.getElementById("clip3"),
    containerParams: { width: "1280px", height: "720px" },
  }
);

map3.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 8, center: sydney, intermediateZoom: 2 } } },
    { duration: 6000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  1000
);

new Player({ clip: map1 });
new Player({ clip: map2 });
new Player({ clip: map3 });
