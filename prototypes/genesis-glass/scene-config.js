export const SCENE = {
  seed: 7319,
  fog: { color: '#82958d', density: 0.008 },
  light: { sky: '#b6d5df', ground: '#293324', ambient: 1.2, sun: '#ffe2a4', intensity: 3.1, position: [-18, 48, -14] },
  foregroundTrees: [
    [-7, 12, 2.0, 48], [7, 15, 2.4, 53], [-7.6, 2, 2.1, 49],
    [9, -8, 2.7, 54], [-7, -12, 2.0, 48], [14, -22, 1.7, 49],
    [-4.5, -25, 1.3, 43], [3.8, -31, 1.1, 46], [-12, -34, 1.8, 52],
  ],
};
export const pathX = z => -0.7 * Math.sin((z - 4) * 0.1);
export function terrainY(x, z) {
  if (z > -12 && z < 25 && Math.abs(x) < 7) return Math.sin(z * .19) * .025;
  const bank = Math.max(0, Math.abs(x - pathX(z)) - 2);
  return Math.min(bank * .1, 1.5) + Math.sin(z * .19) * .035;
}
export const STOPS = [
  { position: [.45, 1.72, 27.5], target: [.1, 1.9, 12] },
  { position: [-2.7, 2.1, 3.8], target: [2.6, 1.15, -3.8] },
  { position: [5.3, 2.15, -5.5], target: [2.65, 1.15, -3.5] },
  { position: [3, 76, -7], target: [-35, 17, -165] },
  { position: [-.6, 2, -.7], target: [2.6, 1.3, -3.8] },
  { position: [-4.7, 1.8, 1.2], target: [-8, 2.7, -5] },
];
// The return reuses the same clear corridor to the west of the living sequoia.
export const PATHS = [
  [[.45,1.72,27.5],[.05,1.75,18],[-.35,1.8,12],[-.5,1.9,7],[-2.7,2.1,3.8]],
  [[-2.7,2.1,3.8],[3.8,2.1,1.2],[5.8,2.2,-3],[5.3,2.15,-5.5]],
  [[5.3,2.15,-5.5],[4,7,-6],[3.3,25,-7],[3,48,-7],[3,76,-7]],
  [[3,76,-7],[3,48,-7],[3.3,25,-7],[4,7,-6],[4,2.2,-1],[-.6,2,-.7]],
  [[-.6,2,-.7],[-2,1.9,1],[-4,1.8,2.4],[-4.7,1.8,1.2]],
];
export const CAPTIONS = [
  ['A ORIGEM', 'Tecnologia que cria raízes.', 'Sites, sistemas e automações. Feitos para o seu negócio crescer.'],
  ['01 / ENCONTRO', 'Toda solução começa com uma ideia.', 'Escutar. Entender. Encontrar o caminho.'],
  ['02 / CRIAÇÃO', 'Código com propósito.', 'O cuidado está em cada detalhe.'],
  ['03 / PERSPECTIVA', 'Enxergar além.', 'Conectar o que você precisa hoje ao que pode ser amanhã.'],
  ['04 / CONEXÃO', 'Perto de quem cria.', 'Tecnologia feita por pessoas, para pessoas.'],
  ['05 / UM NOVO COMEÇO', 'Genesis Code Soluções', 'Sua próxima ideia pode começar aqui.'],
];
export const CONTACT = 'https://www.linkedin.com/in/alersonferreira/';
