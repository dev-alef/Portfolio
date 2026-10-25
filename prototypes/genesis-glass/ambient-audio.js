// Original procedural ambience. No remote service, samples or autoplay.
export class AmbientAudio {
  constructor() { this.enabled = false; this.context = null; this.nodes = []; }
  async toggle() {
    if (!this.context) this.create();
    this.enabled = !this.enabled;
    if (this.enabled) await this.context.resume();
    this.master.gain.setTargetAtTime(this.enabled ? .23 : 0, this.context.currentTime, .2);
    return this.enabled;
  }
  create() {
    const c = this.context = new AudioContext();
    this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
    // Crossfaded periodic noise guarantees a seamless buffer boundary.
    const length = c.sampleRate * 12, buffer = c.createBuffer(1, length, c.sampleRate), data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) { last = .985 * last + .015 * (Math.random() * 2 - 1); data[i] = last * 6; }
    const blend = c.sampleRate;
    for (let i = 0; i < blend; i++) { const t = i / blend; data[length - blend + i] = data[length - blend + i] * (1-t) + data[i] * t; }
    this.noiseBuffer=buffer;
    const noise = c.createBufferSource(); noise.buffer = buffer; noise.loop = true; noise.loopStart = 1;
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650;
    const wind = c.createGain(); wind.gain.value = .8; noise.connect(filter).connect(wind).connect(this.master); noise.start();
    const lfo = c.createOscillator(), depth = c.createGain(); lfo.frequency.value = .07; depth.gain.value = .2;
    lfo.connect(depth).connect(wind.gain); lfo.start();
    this.fire = c.createGain(); this.fire.gain.value = 0;
    const fireFilter = c.createBiquadFilter(); fireFilter.type = 'highpass'; fireFilter.frequency.value = 1600;
    noise.connect(fireFilter).connect(this.fire).connect(this.master);
    // Very quiet harmonic bed; birds are individual envelopes, never a reset loop.
    for (const f of [98, 146.83]) { const tone=c.createOscillator(), gain=c.createGain(); tone.frequency.value=f; gain.gain.value=.008; tone.connect(gain).connect(this.master); tone.start(); }
    this.nextBird = 0;
  }
  update(time, phase) {
    if (!this.context || !this.enabled || this.context.state !== 'running') return;
    const c = this.context, near = phase > .8 && phase < 4.7 && !(phase > 2.4 && phase < 3.7);
    this.fire.gain.setTargetAtTime(near ? .22 + Math.sin(time * 17) * .06 : .015, c.currentTime, .5);
    if (time > this.nextBird) {
      this.nextBird = time + 5 + Math.random() * 9;
      const bird=c.createOscillator(), gain=c.createGain(); bird.type='sine';
      bird.frequency.setValueAtTime(1900,c.currentTime); bird.frequency.exponentialRampToValueAtTime(2850,c.currentTime+.12); bird.frequency.exponentialRampToValueAtTime(1650,c.currentTime+.28);
      gain.gain.setValueAtTime(0,c.currentTime); gain.gain.linearRampToValueAtTime(.035,c.currentTime+.06); gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.45);
      bird.connect(gain).connect(this.master); bird.start(); bird.stop(c.currentTime+.5);
      bird.onended=()=>{bird.disconnect();gain.disconnect();};
    }
  }
  whoosh() {
    if (!this.enabled || !this.context) return;
    const c=this.context, source=c.createBufferSource(), gain=c.createGain(), filter=c.createBiquadFilter();
    source.buffer=this.noiseBuffer;filter.type='bandpass';filter.frequency.setValueAtTime(750,c.currentTime);filter.frequency.exponentialRampToValueAtTime(170,c.currentTime+.7);filter.Q.value=.5;
    gain.gain.setValueAtTime(0,c.currentTime); gain.gain.linearRampToValueAtTime(.045,c.currentTime+.15); gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.7);
    source.connect(filter).connect(gain).connect(this.master); source.start(0,2); source.stop(c.currentTime+.8);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  suspend() { return this.context?.suspend(); }
  resume() { if(this.enabled) return this.context?.resume(); }
}
