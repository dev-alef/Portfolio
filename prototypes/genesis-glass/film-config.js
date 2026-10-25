export const FILM = {
  forward: '/film/forest-forward.mp4?v=notebook-1',
  mobile: '/film/forest-mobile.mp4?v=notebook-1',
  reverseMobile: '/film/forest-reverse-mobile.mp4?v=notebook-1',
  reverse: '/film/forest-reverse.mp4?v=notebook-1',
  audio: '/film/forest-audio-ending-27.m4a',
  poster: '/film/poster.jpg',
  // Requested media times; the 24 fps decoder displays the corresponding frame.
  stops: [0, 4.6, 6, 16, 23, 29],
  lastFrame: 29,
};
export const COPY = [
  ['A ORIGEM', 'Tecnologia que cria raízes.', 'Sites, sistemas e automações para o seu negócio crescer.'],
  ['01 / ENCONTRO', 'Toda solução começa com uma ideia.', 'Escutar. Entender. Encontrar o caminho.'],
  ['02 / CRIAÇÃO', 'Código com propósito.', 'O cuidado está em cada detalhe.'],
  ['03 / PERSPECTIVA', 'Enxergar além.', 'Criar hoje, pensando no que vem depois.'],
  ['04 / CONEXÃO', 'Perto de quem cria.', 'Tecnologia feita por pessoas, para pessoas.'],
  ['05 / UM NOVO COMEÇO', 'Genesis Code Soluções', 'Sua próxima ideia pode começar aqui.'],
];
export const CONTACT = 'https://www.linkedin.com/in/alersonferreira/';
export function filmRange(from, to) {
  const reverse = to < from;
  return {
    reverse,
    start: reverse ? FILM.lastFrame - FILM.stops[from] : FILM.stops[from],
    end: reverse ? FILM.lastFrame - FILM.stops[to] : FILM.stops[to],
  };
}

export const PANEL_REVEAL_DELAY = 0.5;

export const FINAL_PANEL_REVEAL_DELAY = 0.12;
