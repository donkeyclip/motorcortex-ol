# MotorCortex-Openlayers

**Table of Contents**

- [MotorCortex-Openlayers](#motorcortex-openlayers)
  - [Demo](#demo)
- [Intro / Features](#intro--features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Importing and Loading](#importing-and-loading)
- [Creating Incidents](#creating-incidents)
  - [Map Clip](#map-clip)
  - [GoTo](#goto)
- [Adding Incidents in your clip](#adding-incidents-in-your-clip)
- [Contributing](#contributing)
- [License](#license)
- [Sponsored by](#sponsored-by)

## Demo

[Check it out here](https://donkeyclip.github.io/motorcortex-ol/demo/)

# Intro / Features
MotorCortex Openlayers takes the capabilities of [Openlayers](https://openlayers.org/) library of creating a dynamic map in any web page.
The library exposes a Map Clip with the name Clip which will initialize an Openlayer Map instance where you can add animation with the "GoTo" Incident.

This Plugin exposes:
- **Map Clip** — creates an OpenLayers map
- **GoTo** — fly animation between locations (center, zoom, rotation)
- **MapAttr** — animate properties on map entities (opacity, scale)
- **addCustomEntity** — dynamically add points, lines, polylines, and polygons to the map

# Getting Started

## Installation
```bash
$ npm install @donkeyclip/motorcortex-ol
# OR
$ yarn add @donkeyclip/motorcortex-ol
```
## Importing and loading

```javascript
import { loadPlugin } from "@donkeyclip/motorcortex";
import MapsDef from "@donkeyclip/motorcortex-ol";
const Maps = loadPlugin(MapsDef);
```

# Creating Incidents

## Map Clip
```javascript
const london = MapsDef.utils.fromLonLat([-0.12755, 51.507222]);
const bern = MapsDef.utils.fromLonLat([7.4458, 46.95]);

const clip = new Maps.Clip(
  {
    parameters: {
      view: { center: london, zoom: 8 }
    }
  },
  {
    host: document.getElementById("clip"),
    containerParams: { width: "1280px", height: "720px" }
  }
);
```
### Map Clip Attrs
Map Clip take as a parameter a `view` object. This object contains the starting point (`center`) and the `zoom` number.
The `center` value has the following structure: 
```javascript
center: MapsDef.utils.fromLonLat([-0.12755, 51.507222])
```

## GoTo
```javascript
const gotoBern = new Maps.GoTo(
  {
    animatedAttrs: {
      goto: {
        zoom: 3,
        center: bern
      }
    }
  },
  { duration: 4000, selector: "!#olmap" }
);
```
### GoTo Attrs 
Goto Incident take as an attribute a `goto` object.This object contains the ending point (`center`) and the `zoom` number.

#### IMPORTANT
Along with the attributes, all `GoTo incidents` must take on their props the `selector` key with the value: `!#olmap`

## Dynamic Map Entities (addCustomEntity)

Add points, lines, polylines, and polygons dynamically. Entities start hidden (`hidden: true`) and are revealed via `MapAttr` incidents.

### Point (marker)
```javascript
map.addCustomEntity(
  { type: "point", coords: [37.6178, 55.7517], color: "#e76f51", label: "Moscow", size: 10 },
  "moscow", ["cities"], true
);
```

### Line
```javascript
map.addCustomEntity(
  { type: "line", coords: [[37.6, 55.7], [30.3, 59.9]], color: "#264653", width: 3 },
  "route1", ["routes"], true
);
```

### Polyline
```javascript
map.addCustomEntity(
  { type: "polyline", coords: [[37.6, 55.7], [30.3, 59.9], [24.9, 60.2]], color: "#2a9d8f", width: 2 },
  "path1", ["routes"], true
);
```

### Polygon
```javascript
map.addCustomEntity(
  {
    type: "polygon",
    coords: [[36, 56.5], [39, 56.5], [39, 54.5], [36, 54.5], [36, 56.5]],
    color: "#f4a261",
    fillColor: "rgba(244, 162, 97, 0.3)",
    width: 2,
  },
  "region1", ["regions"], true
);
```

**Definition shape:**

| Property  | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| type      | string   | `"point"`, `"line"`, `"polyline"`, or `"polygon"`              |
| coords    | array    | `[lon, lat]` for point, `[[lon,lat], ...]` for line/poly       |
| color     | string   | Stroke/marker color (e.g. `"#e76f51"`)                         |
| fillColor | string   | Fill color for polygons (e.g. `"rgba(42, 157, 143, 0.3)"`)    |
| width     | number   | Stroke width for lines/polygons                                |
| size      | number   | Marker radius for points (default: 8)                          |
| label     | string   | Text label displayed above point markers                       |

## MapAttr Effect

Animate properties on individual map entities. Targets entities by their MC selector (`!#id`).

### Opacity (reveal/hide)
```javascript
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { opacity: 1 } },
    { selector: "!#moscow", duration: 1000 }
  ),
  8500
);
```

### Scale (marker pulse)
```javascript
map.addIncident(
  new Maps.MapAttr(
    { animatedAttrs: { scale: 2 } },
    { selector: "!#moscow", duration: 500 }
  ),
  15000
);
```

| Animated Attr | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| opacity       | number | 0 (invisible) to 1 (fully visible)  |
| scale         | number | Marker scale multiplier (default: 1) |

# Adding Incidents in your clip

```javascript
mapsClipName.addIncident(incidentGoToName, startTime);
```

# Contributing 

In general, we follow the "fork-and-pull" Git workflow, so if you want to submit patches and additions you should follow the next steps:
1.	**Fork** the repo on GitHub
2.	**Clone** the project to your own machine
3.	**Commit** changes to your own branch
4.	**Push** your work back up to your fork
5.	Submit a **Pull request** so that we can review your changes

# License

[MIT License](https://opensource.org/licenses/MIT)

# Sponsored by
[<img src="https://presskit.donkeyclip.com/logos/donkey%20clip%20logo.svg" width=250></img>](https://donkeyclip.com)
