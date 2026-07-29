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
const paris = MapsDef.utils.fromLonLat([2.3522, 48.8566]);
const rome = MapsDef.utils.fromLonLat([12.4964, 41.9028]);
const rio = MapsDef.utils.fromLonLat([-43.1729, -22.9068]);
const cairo = MapsDef.utils.fromLonLat([31.2357, 30.0444]);
const reykjavik = MapsDef.utils.fromLonLat([-21.8174, 64.1466]);

// ═══════════════════════════════════════════════════════════════════════
// Single clip: Street map — arc flight London → Moscow (zoom 5→5, intermediate 2)
// Then standard flight Moscow → Athens (no arc)
// Then 10s slow arc NYC → London on same map
// ═══════════════════════════════════════════════════════════════════════
const map = new Maps.Clip(
  { parameters: { view: { center: london, zoom: 5 }, baseMap: "street" } },
  {
    host: document.getElementById("clip"),
    containerParams: { width: "1280px", height: "720px" },
  }
);

// 1. Arc flight: London → Moscow (zoom 5→5, intermediateZoom 2)
map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 5, center: moscow, intermediateZoom: 2 } } },
    { duration: 5000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  1000
);

// 2. Standard flight: Moscow → Athens (zoom 5→8, no arc)
map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 8, center: athens } } },
    { duration: 4000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  7000
);

// 3. Slow arc: Athens → NYC (zoom 8→6, intermediateZoom 2, 10s)
map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 6, center: nyc, intermediateZoom: 2 } } },
    { duration: 10000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  12000
);

// 4. Arc: NYC → Sydney (zoom 6→6, intermediateZoom 2)
map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 6, center: sydney, intermediateZoom: 2 } } },
    { duration: 6000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  23000
);

new Player({ clip: map });
