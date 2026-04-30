import { Effect } from "@donkeyclip/motorcortex";
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";

/**
 * MapAttr — MC Effect for animating properties on OL Features.
 *
 * Animatable attrs:
 *   opacity: 0→1 — feature visibility
 *   scale: number — marker scale (point features only)
 */
export default class MapAttr extends Effect {
  getScratchValue() {
    const key = this.attributeKey;
    if (key === "opacity") return 0; // features start hidden
    if (key === "scale") return 1;
    return 0;
  }

  onProgress(millisecond) {
    const fraction = this.getFraction(millisecond);
    const feature = this.element?.entity;
    if (!feature || !feature._mcOriginalStyle) return;

    const key = this.attributeKey;
    const target = this.targetValue;
    const initial = this.initialValue ?? 0;
    const current = initial + (target - initial) * fraction;

    const origStyle = feature._mcOriginalStyle;

    if (key === "opacity") {
      // Rebuild style with opacity applied
      const newStyle = this._cloneStyleWithOpacity(origStyle, current);
      feature.setStyle(newStyle);
      feature._mcHidden = current < 0.01;
    } else if (key === "scale") {
      // Scale the marker image
      const image = origStyle.getImage();
      if (image) {
        const cloned = this._cloneStyleWithOpacity(
          origStyle,
          feature._mcHidden ? 0 : 1
        );
        const img = cloned.getImage();
        if (img && typeof img.setScale === "function") {
          img.setScale(current);
        }
        feature.setStyle(cloned);
      }
    }
  }

  /**
   * Clone an OL Style with a given opacity applied to all fill/stroke/image/text.
   */
  _cloneStyleWithOpacity(style, opacity) {
    const opts = {};

    const fill = style.getFill();
    if (fill) {
      opts.fill = new Fill({
        color: this._colorWithOpacity(fill.getColor(), opacity),
      });
    }

    const stroke = style.getStroke();
    if (stroke) {
      opts.stroke = new Stroke({
        color: this._colorWithOpacity(stroke.getColor(), opacity),
        width: stroke.getWidth(),
        lineDash: stroke.getLineDash(),
      });
    }

    const image = style.getImage();
    if (image instanceof CircleStyle) {
      const imgFill = image.getFill();
      const imgStroke = image.getStroke();
      opts.image = new CircleStyle({
        radius: image.getRadius(),
        fill: imgFill
          ? new Fill({
              color: this._colorWithOpacity(imgFill.getColor(), opacity),
            })
          : undefined,
        stroke: imgStroke
          ? new Stroke({
              color: this._colorWithOpacity(imgStroke.getColor(), opacity),
              width: imgStroke.getWidth(),
            })
          : undefined,
      });
    }

    const text = style.getText();
    if (text) {
      opts.text = new Text({
        text: text.getText(),
        font: text.getFont(),
        offsetY: text.getOffsetY(),
        fill: text.getFill()
          ? new Fill({
              color: this._colorWithOpacity(
                text.getFill().getColor(),
                opacity
              ),
            })
          : undefined,
        stroke: text.getStroke()
          ? new Stroke({
              color: this._colorWithOpacity(
                text.getStroke().getColor(),
                opacity
              ),
              width: text.getStroke().getWidth(),
            })
          : undefined,
      });
    }

    return new Style(opts);
  }

  /**
   * Apply opacity to a color string or array.
   */
  _colorWithOpacity(color, opacity) {
    if (!color) return `rgba(0,0,0,${opacity})`;
    if (typeof color === "string") {
      // Handle hex
      if (color.startsWith("#")) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${opacity})`;
      }
      // Handle rgba
      if (color.startsWith("rgba")) {
        return color.replace(/[\d.]+\)$/, `${opacity})`);
      }
      // Handle rgb
      if (color.startsWith("rgb(")) {
        return color.replace("rgb(", "rgba(").replace(")", `,${opacity})`);
      }
      return color;
    }
    // Array format [r,g,b,a]
    if (Array.isArray(color)) {
      return [color[0], color[1], color[2], opacity * 255];
    }
    return color;
  }
}
