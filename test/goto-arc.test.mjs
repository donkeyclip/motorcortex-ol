import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Standalone test for the GoTo arc math — no OL or MC dependency.
 * Extracts the pure math from GoTo.onProgress and verifies:
 * 1. centerT is monotonically increasing (never reverses direction)
 * 2. arc blend goes up then down (0 → peak → 0)
 * 3. Final values land exactly at the target
 */

// ── Replicate the GoTo math ──────────────────────────────────────────

function computeFrame(f, isArc) {
  // Base easing
  const t = isArc ? f + 0.084 * Math.sin(2 * Math.PI * f) : f;

  // Arc blend
  const arc = isArc ? Math.pow(Math.sin(t * Math.PI), 0.38) : 0;

  // Zoom brake (95%)
  let brake = 1;
  if (isArc && f > 0.05) {
    const brakeF = (f - 0.05) / 0.95;
    brake = Math.pow(1 - brakeF, 3);
  }

  // Center: cubic ease-out for full flight
  const centerT = isArc ? 1 - Math.pow(1 - f, 3) : t;

  // Zoom arc with brake
  const zoomArc = arc * brake;

  return { f, t, centerT, arc, zoomArc, brake };
}

function sampleFrames(steps = 1000, isArc = true) {
  const frames = [];
  for (let i = 0; i <= steps; i++) {
    frames.push(computeFrame(i / steps, isArc));
  }
  return frames;
}

// ── Tests ────────────────────────────────────────────────────────────

describe("GoTo arc flight math", () => {
  it("centerT is monotonically increasing (never reverses)", () => {
    const frames = sampleFrames(10000);
    for (let i = 1; i < frames.length; i++) {
      assert.ok(
        frames[i].centerT >= frames[i - 1].centerT,
        `centerT reversed at f=${frames[i].f.toFixed(5)}: ` +
          `${frames[i - 1].centerT.toFixed(8)} → ${frames[i].centerT.toFixed(8)}`
      );
    }
  });

  it("t (base easing) is monotonically increasing", () => {
    const frames = sampleFrames(10000);
    for (let i = 1; i < frames.length; i++) {
      assert.ok(
        frames[i].t >= frames[i - 1].t,
        `t reversed at f=${frames[i].f.toFixed(5)}: ` +
          `${frames[i - 1].t.toFixed(8)} → ${frames[i].t.toFixed(8)}`
      );
    }
  });

  it("arc blend starts at 0, peaks mid-flight, returns to 0", () => {
    const frames = sampleFrames(1000);
    assert.equal(frames[0].arc, 0, "arc should be 0 at start");
    assert.ok(frames[500].arc > 0.9, `arc at midpoint should be near 1, got ${frames[500].arc}`);
    // End: arc * brake should be near 0
    assert.ok(frames[1000].zoomArc < 0.001, `zoomArc at end should be ~0, got ${frames[1000].zoomArc}`);
  });

  it("centerT starts at 0 and ends at 1", () => {
    const frames = sampleFrames(1000);
    assert.equal(frames[0].centerT, 0, "centerT at f=0");
    assert.equal(frames[1000].centerT, 1, "centerT at f=1");
  });

  it("t starts at 0 and ends at 1", () => {
    const frames = sampleFrames(1000);
    assert.equal(frames[0].t, 0, "t at f=0");
    assert.equal(frames[1000].t, 1, "t at f=1");
  });

  it("without arc, centerT equals f (linear)", () => {
    const frames = sampleFrames(100, false);
    for (const frame of frames) {
      assert.ok(
        Math.abs(frame.centerT - frame.f) < 1e-10,
        `centerT should equal f without arc, got centerT=${frame.centerT} f=${frame.f}`
      );
    }
  });

  it("center position never overshoots target", () => {
    // Simulate center interpolation: x = x0 + centerT * (x1 - x0)
    // With x0=0, x1=1, center should always be in [0, 1]
    const frames = sampleFrames(10000);
    for (const frame of frames) {
      assert.ok(
        frame.centerT >= 0 && frame.centerT <= 1,
        `centerT out of [0,1] at f=${frame.f.toFixed(5)}: ${frame.centerT}`
      );
    }
  });
});
