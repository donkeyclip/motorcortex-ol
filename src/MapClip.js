import { BrowserClip } from "@donkeyclip/motorcortex";
import Map from "ol/Map";
import View from "ol/View";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import { fromLonLat } from "ol/proj";
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";

/**
 * Create a tile source based on the baseMap parameter.
 * Supported values:
 *   "street"     (default) — OpenStreetMap
 *   "satellite"            — Esri World Imagery
 *   "terrain"              — Stadia Stamen Terrain
 *   "dark"                 — CartoDB Dark Matter
 *   "light"                — CartoDB Positron
 *   "toner"                — Stadia Stamen Toner
 *   "watercolor"           — Stadia Stamen Watercolor
 *   "topo"                 — OpenTopoMap
 */
function createTileSource(baseMap) {
  switch (baseMap) {
    case "satellite":
      return new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 19,
        attributions: "Tiles &copy; Esri",
      });
    case "terrain":
      return new XYZ({
        url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png",
        maxZoom: 18,
        attributions: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
      });
    case "dark":
      return new XYZ({
        url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        maxZoom: 20,
        attributions: "&copy; OpenStreetMap contributors &copy; CARTO",
      });
    case "light":
      return new XYZ({
        url: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        maxZoom: 20,
        attributions: "&copy; OpenStreetMap contributors &copy; CARTO",
      });
    case "toner":
      return new XYZ({
        url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
        maxZoom: 18,
        attributions: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
      });
    case "watercolor":
      return new XYZ({
        url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
        maxZoom: 16,
        attributions: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
      });
    case "topo":
      return new XYZ({
        url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
        maxZoom: 17,
        attributions: "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap",
      });
    case "street":
    default:
      return new OSM();
  }
}

export default class OlMap extends BrowserClip {
  onAfterRender() {
    // Vector layer for dynamic entities (points, lines, polygons)
    this._vectorSource = new VectorSource();
    this._vectorLayer = new VectorLayer({ source: this._vectorSource });

    const baseMap = (this.attrs.parameters && this.attrs.parameters.baseMap) || "street";

    const olMap = new Map({
      target: this.context.rootElement,
      layers: [
        new Tile({
          preload: 10,
          source: createTileSource(baseMap),
        }),
        this._vectorLayer,
      ],
      controls: [],
      loadTilesWhileAnimating: true,
      view: new View(this.attrs.parameters.view),
    });

    this._olMap = olMap;
    this.context.setCustomEntity("olmap", olMap, ["maps"]);
    this.contextLoaded();
  }

  /**
   * Create an OL Feature from a definition and add to the vector layer.
   *
   * Definition shapes:
   *   { type: "point", coords: [lon, lat], color, size, label }
   *   { type: "line", coords: [[lon,lat], [lon,lat], ...], color, width }
   *   { type: "polyline", coords: [[lon,lat], ...], color, width }
   *   { type: "polygon", coords: [[lon,lat], ...], color, fillColor, fillOpacity }
   */
  renderCustomEntity(definition) {
    if (!definition || typeof definition !== "object") return null;
    // Already a live Feature (ClipCopy replay)
    if (definition instanceof Feature) return definition;

    const type = definition.type;
    let geometry;
    let style;

    if (type === "point") {
      geometry = new Point(fromLonLat(definition.coords));
      const color = definition.color || "#e76f51";
      const size = definition.size || 8;
      style = new Style({
        image: new CircleStyle({
          radius: size,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
        text: definition.label
          ? new Text({
              text: definition.label,
              font: '14px "Comic Sans MS", cursive',
              fill: new Fill({ color: "#2c3e50" }),
              stroke: new Stroke({ color: "#ffffff", width: 3 }),
              offsetY: -(size + 12),
            })
          : undefined,
      });
    } else if (type === "line" || type === "polyline") {
      geometry = new LineString(
        definition.coords.map((c) => fromLonLat(c))
      );
      style = new Style({
        stroke: new Stroke({
          color: definition.color || "#264653",
          width: definition.width || 3,
        }),
      });
    } else if (type === "polygon") {
      geometry = new Polygon([
        definition.coords.map((c) => fromLonLat(c)),
      ]);
      style = new Style({
        fill: new Fill({
          color: definition.fillColor || "rgba(42, 157, 143, 0.3)",
        }),
        stroke: new Stroke({
          color: definition.color || "#264653",
          width: definition.width || 2,
        }),
      });
    } else {
      return null;
    }

    const feature = new Feature({ geometry });
    feature.setStyle(style);
    // Store original style for restore
    feature._mcOriginalStyle = style;
    this._vectorSource.addFeature(feature);

    return feature;
  }

  /**
   * Hide a feature by setting its style opacity to 0.
   */
  hideEntity(element) {
    if (element instanceof Feature) {
      // Create a transparent clone of the style
      element.setStyle(new Style({}));
      element._mcHidden = true;
    }
  }
}
