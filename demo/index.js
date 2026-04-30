import { loadPlugin } from "@donkeyclip/motorcortex";
import Player from "@donkeyclip/motorcortex-player";
import MapsDef from "../src/";

const Maps = loadPlugin(MapsDef);

const london = MapsDef.utils.fromLonLat([-0.12755, 51.507222]);
const moscow = MapsDef.utils.fromLonLat([37.6178, 55.7517]);
const bern = MapsDef.utils.fromLonLat([7.4458, 46.95]);

const map = new Maps.Clip(
  {
    parameters: {
      view: { center: london, zoom: 8 },
    },
  },
  {
    host: document.getElementById("clip"),
    containerParams: { width: "1280px", height: "720px" },
  }
);

// ─── Original GoTo sequence: London → Bern → Moscow ─────────────────────
map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 3, center: bern } } },
    { duration: 4000, selector: "!#olmap", easing: "easeInExpo" }
  ),
  0
);

map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 8, center: moscow } } },
    { duration: 4000, selector: "!#olmap", easing: "easeInExpo" }
  ),
  4000
);

// ─── Once at Moscow (8s), add shapes (hidden) and reveal them ───────────

// Point marker: Moscow
map.addCustomEntity(
  { type: "point", coords: [37.6178, 55.7517], color: "#e76f51", label: "Moscow", size: 10 },
  "moscow_pin", ["cities"], true
);

// Point marker: Saint Petersburg
map.addCustomEntity(
  { type: "point", coords: [30.3351, 59.9343], color: "#2a9d8f", label: "St. Petersburg", size: 8 },
  "spb_pin", ["cities"], true
);

// Line: Moscow → St. Petersburg
map.addCustomEntity(
  { type: "line", coords: [[37.6178, 55.7517], [30.3351, 59.9343]], color: "#264653", width: 3 },
  "msk_spb_line", ["routes"], true
);

// Polygon: rough area around Moscow region
map.addCustomEntity(
  {
    type: "polygon",
    coords: [
      [36.0, 56.5], [39.0, 56.5], [39.0, 54.5], [36.0, 54.5], [36.0, 56.5],
    ],
    color: "#f4a261",
    fillColor: "rgba(244, 162, 97, 0.3)",
    width: 2,
  },
  "moscow_region", ["regions"], true
);

// ─── Reveal Moscow pin at 8.5s (fade in) ────────────────────────────────
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { opacity: 1 } },
    { selector: "!#moscow_pin", duration: 1000 }
  ),
  8500
);

// ─── Reveal St. Petersburg pin at 10s ───────────────────────────────────
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { opacity: 1 } },
    { selector: "!#spb_pin", duration: 1000 }
  ),
  10000
);

// ─── Reveal the connecting line at 11.5s ────────────────────────────────
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { opacity: 1 } },
    { selector: "!#msk_spb_line", duration: 1500 }
  ),
  11500
);

// ─── Reveal Moscow region polygon at 13.5s ──────────────────────────────
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { opacity: 1 } },
    { selector: "!#moscow_region", duration: 1500 }
  ),
  13500
);

// ─── Scale up Moscow pin (pulse) at 15.5s ───────────────────────────────
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { scale: 2 } },
    { selector: "!#moscow_pin", duration: 500 }
  ),
  15500
);
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { scale: 1 } },
    { selector: "!#moscow_pin", duration: 500 }
  ),
  16000
);

// ─── Zoom out to see both cities at 17s ─────────────────────────────────
map.addIncident(
  new Maps.GoTo(
    { animatedAttrs: { goto: { zoom: 5, center: MapsDef.utils.fromLonLat([34.0, 57.5]) } } },
    { duration: 3000, selector: "!#olmap", easing: "easeInOutCubic" }
  ),
  17000
);

// ─── Fade out the polygon at 20s ────────────────────────────────────────
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { opacity: 0 } },
    { selector: "!#moscow_region", duration: 1500 }
  ),
  20000
);

new Player({ clip: map });
