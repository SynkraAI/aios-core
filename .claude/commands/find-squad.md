Ao receber este comando, siga EXATAMENTE estes passos:

1. **Capture a demanda do usuário** — o argumento passado após `/find-squad` é a descrição da necessidade. Se não houver argumento, pergunte ao usuário o que ele precisa.

2. **Delegue para um subagente haiku** usando a Task tool com subagent_type "Explore":
   - O subagente DEVE ler o arquivo `.aiox-core/data/catalog.md`
   - O subagente DEVE buscar TODOS os squads, skills e agents que sejam genuinamente relevantes para a demanda
   - O subagente DEVE retornar para cada match: nome, slug (para ativação), descrição curta, e relevância (alta/média)
   - O subagente NÃO deve filtrar por quantidade — trazer TUDO que for relevante
   - O subagente DEVE ordenar por relevância (alta primeiro)

3. **Apresente os resultados ao usuário** no seguinte formato:

   ### Recomendados (top 3-5)
   Os mais relevantes com explicação de por que se encaixam.

   ### Também relevantes
   Outros que podem complementar, listados de forma mais compacta.

   ### Sugestão de combinação
   Se fizer sentido, sugira como combinar 2-3 squads para atender a demanda completa.

4. **Aguarde escolha** — o usuário decide qual ativar. Quando escolher, ative com o slash command correspondente.

IMPORTANTE:
- NUNCA leia o catalog.md no contexto principal — sempre delegue ao subagente
- O subagente roda em haiku para economia de tokens
- Traga TODOS os relevantes, mas DESTAQUE apenas os top 3-5
