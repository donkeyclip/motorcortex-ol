import Clip from "./MapClip";
import GoTo from "./GoTo";
import MapAttr from "./MapAttr";
import { fromLonLat } from "ol/proj.js";
import packageJSON from "../package.json";

export default {
  npm_name: packageJSON.name,
  version: packageJSON.version,
  incidents: [
    {
      exportable: GoTo,
      name: "GoTo",
      attributesValidationRules: {
        animatedAttrs: {
          type: "object",
          props: {
            goto: {
              type: "object",
              props: {
                zoom: { type: "number", min: 0 },
                center: { type: "array", items: "number", min: 2, max: 2 },
                intermediateZoom: { type: "number", min: 0, optional: true },
              },
            },
          },
        },
      },
    },
    {
      exportable: MapAttr,
      name: "MapAttr",
    },
  ],
  compositeAttributes: { goto: ["center", "zoom", "intermediateZoom"] },
  Clip,
  utils: {
    fromLonLat,
  },
};
