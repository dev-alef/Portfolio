// Pure state machine: time, never scroll distance, drives a transition.
export const DURATIONS = [2900, 2900, 4800, 4800, 2800];
export class Journey {
  constructor({ now = () => performance.now(), reduced = false, onChange = () => {} } = {}) {
    Object.assign(this, { now, reduced, onChange, stage: 0, motion: null, lastWheel: -Infinity, settledAt: -Infinity, sum: 0, direction: 0 });
  }
  get busy() { return this.motion !== null; }
  get value() { return this.motion ? this.motion.from + (this.motion.to - this.motion.from) * this.motion.eased : this.stage; }
  go(direction) {
    if (this.busy) return false;
    const target = Math.max(0, Math.min(5, this.stage + Math.sign(direction)));
    if (target === this.stage) return false;
    if (this.reduced) { this.jump(target); return true; }
    this.motion = { from: this.stage, to: target, start: this.now(), duration: DURATIONS[Math.min(this.stage, target)], eased: 0 };
    this.sum = 0;
    this.onChange(this);
    return true;
  }
  tick() {
    if (!this.motion) return;
    const m = this.motion;
    const t = Math.min(1, (this.now() - m.start) / m.duration);
    m.eased = t * t * t * (t * (t * 6 - 15) + 10);
    if (t === 1) { this.stage = m.to; this.motion = null; this.settledAt = this.now(); this.sum = 0; }
    this.onChange(this);
  }
  jump(stage = 5) {
    this.stage = Math.max(0, Math.min(5, stage)); this.motion = null;
    this.settledAt = this.now(); this.sum = 0; this.onChange(this);
  }
  wheel(delta) {
    const time = this.now(), gap = time - this.lastWheel;
    this.lastWheel = time;
    // Every event, including discarded inertia, extends the quiet period.
    if (this.busy || time - this.settledAt < 450) { this.sum = 0; return false; }
    if (gap > 280) { this.sum = 0; this.direction = Math.sign(delta); this.armed = true; }
    if (!this.armed || Math.sign(delta) !== this.direction) return false;
    this.sum += Math.abs(delta);
    if (this.sum < 32) return false;
    this.armed = false;
    return this.go(this.direction);
  }
}
