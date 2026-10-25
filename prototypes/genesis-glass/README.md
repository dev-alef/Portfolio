# Genesis Code — edição glass

Nova versão independente, criada em 24/10/2026 a pedido do usuário. O vídeo com
a tampa do notebook corrigida permanece byte a byte igual. Não há câmera 3D
animada: Three.js desenha somente partículas discretas por shaders, com câmera
ortográfica fixa. O vidro interativo é DOM, CSS 3D, backdrop-filter e GSAP.

```sh
npm install
npm run dev
```

Prévia: http://localhost:5175. Versão anterior: http://localhost:5173, quando seu
servidor estiver iniciado. Nenhuma publicação foi feita.

## Cenas

| Cena | Pausa | Conteúdo |
| --- | --- | --- |
| 0 | 0 s | Apresentação e exploração |
| 1 | 4,6 s | Soluções: seis conceitos, filtros, galeria e detalhes |
| 2 | 6 s | Seis serviços em texto |
| 3 | 16 s | Explorar, entender, construir e evoluir |
| 4 | 23 s | Contato e formulário que prepara um e-mail |
| 5 | 29 s | Essência, FAQ, orçamento e rodapé |

Após o refinamento solicitado, as pausas são 4,6 / 6 / 16 / 23 / 29 segundos.
Configure em `film-config.js`. `PANEL_REVEAL_DELAY` controla os 0,5 segundo de
contemplação após a chegada, antes da entrada dos painéis. Na cena 05,
`FINAL_PANEL_REVEAL_DELAY` reduz a espera a 0,12 s, com entrada de 0,5 s. Movimento reduzido
continua imediato. A lista explícita de cenas do usuário
prevalece sobre a ordenação diferente no prompt de exemplo.

## Integração

`journey.js` mantém o bloqueio de inércia. `film-main.js` segue o relógio do vídeo,
aguarda a saída GSAP e só revela a nova seção após chegar ao quadro da parada.
Setas avançam/revertem um trecho; atalhos de seção saltam ao quadro desejado.
Durante movimento, botões continuam disponíveis e cancelam a operação anterior.
Wheel/touch dentro de conteúdo têm rolagem própria para não abandonar a leitura.
Fora dos painéis, gestos deliberados mudam uma cena por vez. No hero, a rolagem
sobre o texto também inicia a jornada.

| Arquivo | Responsabilidade |
| --- | --- |
| `content.js` | Textos, conceitos, serviços, processo, FAQ e e-mail |
| `panels.js` | Seções DOM, timelines, filtros, dialog, formulário e FAQ |
| `glass.css` | Vidro em camadas, bordas, profundidade e responsividade |
| `glass-effects.js` | Partículas com shaders; câmera fixa; renderização limitada |
| `film-main.js` | Integração do vídeo, cancelamento, controles e fallback |
| `film-config.js` | Arquivos de vídeo e cinco pausas |
| `design/concepts/` | Interfaces autorais usadas nas imagens demonstrativas |
| `public/concepts/` | Capturas WebP dessas interfaces (não são cases de clientes) |
| `tools/verify.mjs` | Verificação de integração em Chromium |

Os nomes MDR e o selo Lovable dos exemplos não representam esta marca e foram
substituídos/omitidos. Contato: genesis.code.solucoes@gmail.com. WhatsApp da cena 05: +55 31 98619-6863. O formulário abre um
`mailto:` preenchido; não envia nem armazena mensagens no servidor.

## Acessibilidade e custo

Painéis funcionam sem WebGL. Movimento reduzido troca diretamente de composição.
O motor Three.js é carregado à parte apenas em desktop sem movimento reduzido e
com memória declarada suficiente. Câmera fixa, 36 pontos, limite de 20 fps e pixel
ratio 1,25; animação suspensa com aba oculta. CSS preserva o vidro no celular.
O chunk opcional de Three.js é aproximadamente 526 kB (131 kB gzip) e gera aviso
de tamanho no build; não é necessário para ler, navegar ou entrar em contato.
Não há refração óptica física do vídeo: blur e reflexos são efeitos de composição.

```sh
npm test
npm run build
npm run test:browser
```

O último comando requer o dev server na porta 5175 e Chrome local. Ajuste
`CHROME_PATH` ou `PREVIEW_URL` se necessário. Resultados e capturas ficam em
`test-results/`, ignorado pelo Git. O teste usa navegador automatizado; não
substitui avaliação em celular físico. Build: `build/`, independente do `dist` da raiz.

## Recuperar o portfólio publicado antes dos vídeos

A branch remota `backup/portfolio-alerson-pre-video` preserva o commit
`70bcab7bd3301e60c886b419120298ef00a2be93`, com a introdução
“Portfólio de Alerson Ferreira — Dev Fullstack”. Para abrir uma cópia separada:

```sh
git fetch origin
git worktree add ../portfolio-alerson-backup origin/backup/portfolio-alerson-pre-video
python3 -m http.server 4173 --directory ../portfolio-alerson-backup/dist
```

Este projeto é independente. O deploy atual na raiz continua usando `dist`.
Para publicar Genesis, configure a raiz como `prototypes/genesis-glass`,
com `npm run build` e saída `build`.

## Backup local da edição anterior com vídeo

Na máquina de desenvolvimento, `../forest-3d` não foi alterada. Essa edição
local não faz parte deste PR. Basta iniciar seu `npm run dev` e abrir a porta
5173. Backup adicional, com manifesto SHA-256 verificado:

`/home/alerson/Dev-alef/Portfolio/version-backups/genesis-video-notebook-2026-10-24.tar.gz`

Para restaurar em uma pasta separada:

```sh
mkdir -p /tmp/genesis-restaurada
tar -xzf /home/alerson/Dev-alef/Portfolio/version-backups/genesis-video-notebook-2026-10-24.tar.gz -C /tmp/genesis-restaurada
cd /tmp/genesis-restaurada/forest-3d
npm install
npm run dev
```

A porta 5173 precisa estar livre nesse caso. O backup inclui código, lockfile e
recursos; exclui apenas dependências instaladas e build regenerável.

## Interação e áudio refinados

Painéis inclinam até cerca de 3° e sobem 4 px ao acompanhar o mouse; o retorno
é suavizado. O efeito não atua no toque, com movimento reduzido ou enquanto
um campo de formulário está em foco. Reflexos continuam acompanhando o cursor.

A trilha ativa é `public/film/forest-audio-ending-27.m4a`, derivada novamente da
faixa original preservada. O fade de 26,8 a 27 segundos evita um corte seco;
a partir de 27 segundos há silêncio. Vídeos e versão anterior permanecem intactos.

A marca do header aparece em maiúsculas e maior. Ações compartilham acabamento
esmeralda, reflexos e bordas de vidro; navegação do header permanece textual.
