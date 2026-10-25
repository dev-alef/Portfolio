# Genesis Code Soluções

O site publicado na Vercel usa `prototypes/genesis-glass`, com vídeo da floresta,
painéis interativos, serviços, projetos demonstrativos, FAQ e contato.

```sh
npm --prefix prototypes/genesis-glass ci
npm --prefix prototypes/genesis-glass run dev
```

Abra http://localhost:5175. A configuração `vercel.json` da raiz instala e
compila essa pasta, publicando `prototypes/genesis-glass/build`.

[Guia da experiência](prototypes/genesis-glass/README.md)

## Portfólio anterior preservado

A versão “Portfólio de Alerson Ferreira — Dev Fullstack” está na branch
[`backup/portfolio-alerson-pre-video`](https://github.com/dev-alef/Portfolio/tree/backup/portfolio-alerson-pre-video),
commit `70bcab7bd3301e60c886b419120298ef00a2be93`. A pasta `dist` permanece no
repositório, mas não é mais a saída publicada.

Para recuperar uma cópia separada:

```sh
git fetch origin
git worktree add ../portfolio-alerson-backup origin/backup/portfolio-alerson-pre-video
python3 -m http.server 4173 --directory ../portfolio-alerson-backup/dist
```
