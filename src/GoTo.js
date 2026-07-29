import { Effect } from "@donkeyclip/motorcortex";

export default class ZoomTo extends Effect {
  onGetContext() {
    this.view = this.element.entity.getView();
    const intermediateZoom = this.targetValue.intermediateZoom;
    const src = this.initialValue.center;
    const tgt = this.targetValue.center || src;
    // Distance in projected meters — drives plateau width for arc flights.
    const dx = tgt[0] - src[0];
    const dy = tgt[1] - src[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Map distance to arc exponent: longer flights → smaller exponent → wider plateau.
    // ~500km (short) → 0.55, ~5000km (medium) → 0.38, ~15000km+ (long) → 0.22
    const shortDist = 500000;   // 500km in projected meters
    const longDist = 15000000;  // 15000km
    const clampedDist = Math.max(shortDist, Math.min(longDist, dist));
    const distRatio = (clampedDist - shortDist) / (longDist - shortDist); // 0→1
    const arcExponent = 0.55 - distRatio * 0.33; // 0.55 (short) → 0.22 (long)

    this.animation = {
      anchor: this.targetValue.anchor,
      sourceResolution: this.view.getResolutionForZoom(this.initialValue.zoom),
      targetResolution: this.view.getResolutionForZoom(
        this.targetValue.zoom || this.initialValue.zoom
      ),
      intermediateResolution: intermediateZoom != null
        ? this.view.getResolutionForZoom(intermediateZoom)
        : null,
      arcExponent,
      sourceCenter: src,
      targetCenter: tgt,
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
    const arc = isArc ? Math.pow(Math.sin(t * Math.PI), animation.arcExponent) : 0;

    // ── Braking (100%, zoom only) ───────────────────────────────────
    let brake = 1;
    if (isArc && f > 0.05) {
      const brakeF = (f - 0.05) / 0.95;
      brake = Math.pow(1 - brakeF, 3);
    }

    // ── Center ──────────────────────────────────────────────────────
    const x0 = animation.sourceCenter[0];
    const y0 = animation.sourceCenter[1];
    const x1 = animation.targetCenter[0];
    const y1 = animation.targetCenter[1];
    let centerT = t;
    if (isArc && f > 0.05) {
      const brakeF = (f - 0.05) / 0.95;
      const tAtBrakeStart = 0.05 + 0.084 * Math.sin(2 * Math.PI * 0.05);
      const remaining = 1 - tAtBrakeStart;
      const easedBrakeF = 1 - Math.pow(1 - brakeF, 3);
      centerT = tAtBrakeStart + remaining * easedBrakeF;
    }
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
