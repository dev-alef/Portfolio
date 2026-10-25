const smooth = (a, b, value) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// State derives from the same continuous phase as the camera, in both directions.
export function storyState(phase) {
  return {
    laptopClosed: smooth(1.5, 1.98, phase),
    phoneRaised: smooth(3.65, 4, phase),
    tap: smooth(4.1, 4.28, phase) * (1 - smooth(4.3, 4.55, phase)),
    projection: .55 * smooth(4.15, 4.3, phase) * (1 - smooth(4.55, 4.9, phase)),
    tunnelProjection: .38 * (1 - smooth(.9, 1, phase)),
  };
}
