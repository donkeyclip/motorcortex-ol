import { Effect } from "@donkeyclip/motorcortex";

export default class ZoomTo extends Effect {
  onGetContext() {
    this.view = this.element.entity.getView();
    // intermediateZoom is a static param, not a composite attribute —
    // read from raw attrs, not from MC's decomposed targetValue.
    const gotoAttrs = this.attrs.animatedAttrs.goto || {};
    const intermediateZoom = gotoAttrs.intermediateZoom;
    this.animation = {
      anchor: this.targetValue.anchor,
      sourceResolution: this.view.getResolutionForZoom(this.initialValue.zoom),
      targetResolution: this.view.getResolutionForZoom(
        this.targetValue.zoom || this.initialValue.zoom
      ),
      intermediateResolution: intermediateZoom != null
        ? this.view.getResolutionForZoom(intermediateZoom)
        : null,
      sourceCenter: this.initialValue.center,
      targetCenter: this.targetValue.center || this.initialValue.center,
      sourceRotation: this.initialValue.rotation,
      targetRotation: this.targetValue.rotation
        ? this.initialValue.rotation +
          ((this.targetValue.rotation - this.initialValue.rotation + Math.PI) %
            (2 * Math.PI)) -
          Math.PI
        : this.initialValue.rotation,
    };
  }

  getScratchValue() {
    const view = this.element.entity.getView();
    return {
      zoom: view.getZoom(),
      center: view.getCenter(),
      rotation: view.getRotation(),
    };
  }

  onProgress(millisecond) {
    const f = this.getFraction(millisecond);
    const animation = this.animation;
    const isArc = animation.intermediateResolution != null;

    // ── Base easing (symmetric) ─────────────────────────────────────
    const t = isArc ? f + 0.084 * Math.sin(2 * Math.PI * f) : f;

    // ── Arc blend (symmetric pow 0.38 flattened sine) ───────────────
    const arc = isArc ? Math.pow(Math.sin(t * Math.PI), 0.38) : 0;

    // ── Braking (100%, zoom only) ───────────────────────────────────
    let brake = 1;
    if (isArc && f > 0.05) {
      const brakeF = (f - 0.05) / 0.95;
      brake = Math.pow(1 - brakeF, 3);
    }

    // ── Center (cubic ease-out for full flight) ───────────────────
    const x0 = animation.sourceCenter[0];
    const y0 = animation.sourceCenter[1];
    const x1 = animation.targetCenter[0];
    const y1 = animation.targetCenter[1];
    const centerT = isArc ? 1 - Math.pow(1 - f, 3) : t;
    this.view.setCenter([x0 + centerT * (x1 - x0), y0 + centerT * (y1 - y0)]);

    // ── Resolution (zoom) ──────────────────────────────────────────
    const zoomArc = arc * brake;

    let resolution;
    if (f === 1) {
      resolution = animation.targetResolution;
    } else if (isArc) {
      const linearRes = animation.sourceResolution +
        t * (animation.targetResolution - animation.sourceResolution);
      resolution = linearRes +
        zoomArc * (animation.intermediateResolution - linearRes);
    } else {
      resolution = animation.sourceResolution +
        f * (animation.targetResolution - animation.sourceResolution);
    }
    if (animation.anchor) {
      this.view.setCenter(
        this.view.calculateCenterZoom(resolution, animation.anchor)
      );
    }
    this.view.setResolution(resolution);

    // ── Rotation ───────────────────────────────────────────────────
    const rotation =
      f === 1
        ? ((animation.targetRotation + Math.PI) % (2 * Math.PI)) - Math.PI
        : animation.sourceRotation +
          f * (animation.targetRotation - animation.sourceRotation);
    if (animation.anchor) {
      this.view.setCenter(
        this.view.calculateCenterRotate(rotation, animation.anchor)
      );
    }
    this.view.setRotation(rotation);
  }
}
