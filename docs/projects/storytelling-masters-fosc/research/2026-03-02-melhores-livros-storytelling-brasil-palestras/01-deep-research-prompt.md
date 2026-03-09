# Deep Research Prompt

## Sub-queries Decompostas

1. **Livros gerais de storytelling em português** - Listas curadas de melhores livros disponíveis no Brasil
2. **Livros para palestras e apresentações** - Foco em oratória, apresentações e comunicação pública
3. **Clássicos internacionais traduzidos** - McKee, Campbell, Duarte, Vogler e outros
4. **Autores brasileiros de storytelling** - Palacios, Terenzzo, Scartozzoni e outros
5. **Best sellers e avaliações** - Livros mais vendidos na Amazon Brasil com reviews

## Estratégia

- 5 workers Haiku em paralelo
- WebSearch + WebFetch (deep read) por worker
- Máx. 3 deep reads por worker
- Agregação e deduplicação no modelo principal
