# Correção local da tampa do notebook

O vídeo gerado exibia código na face externa da tampa entre a aproximação e o
fechamento. `repair_laptop.py` reaproveita a superfície metálica do quadro 180,
remove a mão dessa textura e acompanha a tampa por homografia/fluxo óptico com
âncoras manuais. Uma máscara preserva os dedos; o brilho acompanha o fechamento.
A composição afeta os quadros 49–179 (24 fps), com entrada gradual quando o
notebook ainda é pequeno. O restante recebe apenas a recodificação do arquivo.

Requer FFmpeg e um ambiente Python separado com `numpy` e `opencv-python-headless`.
Essas bibliotecas não são dependências do site. Uso:

```sh
python repair_laptop.py /caminho/original.mp4 /caminho/copia-corrigida.mp4
```

`--preview` exporta os primeiros 196 quadros a 960 × 540. O script também salva
quadros de inspeção, comparação e JSON com hash SHA-256 da fonte. Recusa saída
com o mesmo caminho do original. Coordenadas são específicas deste vídeo.

Master desta edição: `/home/alerson/Dev-alef/Portfolio/video-edits/notebook/genesis-notebook-corrigido.mp4`.
Cópias anteriores do site estão na subpasta `previous-site` desse diretório.
As quatro versões web foram recodificadas a partir do master corrigido, mantendo
697 quadros a 24 fps. O áudio web não mudou. A cópia master preserva o áudio por
stream copy. A duração e as paradas de navegação permanecem iguais.

Comparativo: `/review/notebook-antes-depois.mp4` no servidor da prévia.
Esta é uma composição localizada, não uma regeneração da cena; detalhes originais
fora da tampa, incluindo outros artefatos de geração, permanecem no filme.
