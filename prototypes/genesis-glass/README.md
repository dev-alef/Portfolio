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

## Prévia local — navegação e áudio (25/10/2026)

Header e CTA de contato usam L07 (texto que se decodifica), com nomes acessíveis
estáveis e sem movimento em prefers-reduced-motion. O início oferece entrada
com som, autorizado por clique, ou silenciosa. O controle de som usa SVG e
aria-label. Em telas até 900 px, menu modal substitui o atalho Pular animação
e dá acesso às seis seções; Esc fecha e o foco retorna ao botão de abertura.

Setas em SVG/CSS adaptam as duas camadas, deslocamentos e ciclo de 61 frames
a 30 fps do arquivo fornecido, preservado em public/motion/scroll-down-original.json.
O aviso fica no header e no footer e é ocultado na última cena.

Com o dev server aberto, execute `node tools/verify-navigation.mjs`: verifica
som real após clique, modo silencioso, L07, menu, teclas e larguras 320–1100 px.
A coleção offline independente inclui H01 (header completo), L01–L08 e painéis
01–18. Estas alterações estão em prévia local e ainda não foram publicadas.

### Ajustes mobile e navegação — 25/10/2026

A abertura aceita um toque mesmo quando o navegador disponibiliza apenas metadados do vídeo. `play()` é solicitado antes de aguardar a saída dos painéis. A espera tem limite e, em falha, a interface estática continua navegável com “Tentar carregar vídeo”. Isso corrige o caso reproduzido de preload limitado; não equivale a validação em aparelho físico ou da conexão do visitante.

O menu mobile usa GSAP com entrada em sequência e respeita movimento reduzido. O aviso de rolagem aparece somente no footer desktop. “Explorar sem som” mantém semântica de ação, com aparência de link H01. “Vamos conversar” aponta à cena Sobre e FAQ, que reúne contato e redes sociais. Os JSON fornecidos ficam em `public/icons/`, renderizados pelo player SVG leve do Lottie, carregado sob demanda e animado apenas ao interagir.

Verificação: `npm test`, `npm run build`, `node tools/verify-mobile-video.mjs`, `node tools/verify-mobile-layout.mjs` e `node tools/verify-navigation.mjs`. Prévia local em http://localhost:5175; estas alterações ainda não foram publicadas.

### Vitrine comercial local — 10/11/2026

A cena Soluções usa `catalog.js` (serviços, escopo, preços propostos e checkouts), `catalog-view.js` (cartões e comparação de planos) e `catalog.css`. Capturas das demonstrações públicas ficam em `public/solutions/`. O catálogo substitui os conceitos genéricos da cena 01 e reutiliza sua navegação, filtros e dialog acessível.

O usuário autorizou a direção comercial de implantação única + mensalidade e ajustes de preço, escopo e franquias. `catalog.js` é a fonte dos valores e limites definidos para a vitrine; `commercialTerms` centraliza hospedagem, suporte e exclusões. Os planos de IA agora usam respostas/gerações, não conversas completas, e diferem da oferta externa ainda não atualizada. Clínica: só o site foi visto; sistema interno não validado. Estoque: acesso restrito, apresentado por demonstração guiada. As integrações opcionais de IA não estão incluídas automaticamente.

Nenhuma cobrança está ativa. `checkoutFor` exige aprovação explícita e URL HTTPS antes de retornar um destino de pagamento. Mesmo assim, a ativação comercial depende de revisar escopo, custos, limites, condições e checkout correto para cada plano. Os CTAs provisórios abrem uma conversa de interesse, sem envio automático. A autorização de preços não habilita o checkout: faltam os destinos reais de pagamento e a adequação dos produtos. A prévia indica contratação por proposta. A implementação atual não provisiona contas nem acompanha renovações/reembolsos; isso exige uma integração posterior ao pagamento.

Verificação: `npm test`, `npm run build`, `node tools/verify-catalog.mjs` e `npm run test:browser`. Preços atualizados apenas localmente; nenhum produto externo, banco ou checkout foi alterado. Não confundir as condições comerciais exibidas com bloqueios de uso implementados no servidor.

Direção visual escolhida: projetos em destaque. A vitrine usa capturas maiores, informações resumidas e preços somente nos detalhes da solução. As capturas e o botão “Conhecer solução” abrem a mesma comparação de planos; “Ver projeto” acessa a demonstração externa. Essa revisão visual permanece local até aprovação.

No desktop, a vitrine usa grade com várias linhas e rolagem vertical do painel, com barra à direita. O carrossel horizontal fica somente no mobile/tablet. Teclas de rolagem dentro da galeria desktop rolam o conteúdo; o footer continua disponível para navegar entre cenas.

A política de IA prevê 1.500 / 6.000 / 10.000 respostas mensais e pausa ao esgotar a franquia, sem excedente automático nem acumulação. Isso é configuração comercial do catálogo: é necessário alinhar contadores, modelos, limites de tokens, suporte e página do produto antes da ativação. Clínica e estoque exigem demonstração guiada e teste dos limites, permissões e backup previstos.

Publicação autorizada em 10/11/2026: vitrine e planos aprovados, mantendo a hospedagem atual. O usuário esclareceu que Genesis Atendimento ainda não está em funcionamento. A oferta aparece como “Em desenvolvimento”, com preços e franquias previstos; links desse produto preparam interesse no lançamento pelo WhatsApp, sem apresentar uma demonstração funcional nem habilitar pagamento. A migração para Railway será feita depois, em trabalho separado.
