import MC from "@kissmybutton/motorcortex";
import { inAndOut } from "ol/easing.js";

export default class ZoomTo extends MC.Effect {
  onGetContext() {
    this.view = this.element.entity.getView();
    this.init(this.attrs.animatedAttrs.goto);
  }

  getScratchValue(/*mcid, attribute*/) {
    const _goto = {
      zoom: this.element.entity.getView().getZoom(),
      center: this.element.entity.getView().getCenter(),
      rotation: this.element.entity.getView().getRotation()
    };
    return _goto;
  }

  init(options) {
    const initialValue = this.getInitialValue("goto");
    const center = initialValue.center.slice();
    const resolution = this.view.getResolutionForZoom(initialValue.zoom);
    const rotation = initialValue.rotation;

    this.animation = {
      anchor: options.anchor,
      easing: options.easing || inAndOut
    };

    if (options.center) {
      this.animation.sourceCenter = center;
      this.animation.targetCenter = options.center;
    }

    if (options.zoom !== undefined) {
      this.animation.sourceResolution = resolution;
      this.animation.targetResolution = this.view.constrainResolution(
        this.view.maxResolution_,
        options.zoom - this.view.minZoom_,
        0
      );
    } else if (options.resolution) {
      this.animation.sourceResolution = resolution;
      this.animation.targetResolution = options.resolution;
    }

    if (options.rotation !== undefined) {
      this.animation.sourceRotation = rotation;
      const delta =
        ((options.rotation - rotation + Math.PI) % (2 * Math.PI)) - Math.PI;
      this.animation.targetRotation = rotation + delta;
    }
  }

  animate(progress) {
    progress = this.animation.easing(progress);
    if (this.animation.sourceCenter) {
      const x0 = this.animation.sourceCenter[0];
      const y0 = this.animation.sourceCenter[1];
      const x1 = this.animation.targetCenter[0];
      const y1 = this.animation.targetCenter[1];
      const x = x0 + progress * (x1 - x0);
      const y = y0 + progress * (y1 - y0);
      this.view.setCenter([x, y]);
    }
    if (this.animation.sourceResolution && this.animation.targetResolution) {
      const resolution =
        progress === 1
          ? this.animation.targetResolution
          : this.animation.sourceResolution +
            progress *
              (this.animation.targetResolution -
                this.animation.sourceResolution);
      if (this.animation.anchor) {
        this.view.setCenter(
          this.view.calculateCenterZoom(resolution, this.animation.anchor)
        );
      }
      this.view.setResolution(resolution);
    }
    if (
      this.animation.sourceRotation !== undefined &&
      this.animation.targetRotation !== undefined
    ) {
      const rotation =
        progress === 1
          ? ((this.animation.targetRotation + Math.PI) % (2 * Math.PI)) -
            Math.PI
          : this.animation.sourceRotation +
            progress *
              (this.animation.targetRotation - this.animation.sourceRotation);
      if (this.animation.anchor) {
        this.view.setCenter(
          this.view.calculateCenterRotate(rotation, this.animation.anchor)
        );
      }
      this.view.setRotation(rotation);
    }
  }
  onProgress(progress /*, millisecond*/) {
    this.animate(progress);
  }
}
