function populateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Header
  var header = ["Nome", "Telefone", "Grupo WhatsApp", "Projeto/Nicho", "Descricao do Projeto", "Mensagem WhatsApp", "Link Direto"];
  sheet.getRange(1, 1, 1, 7).setValues([header]);
  sheet.getRange(1, 1, 1, 7).setFontWeight("bold");

  // Data
  var data = [
  [
    "Eduardo",
    "+5519988584419",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Amazon Code Pro - Top 1 prospect (score 10)",
    "Oi Eduardo! Tudo bem? Aqui é o Antonio, sou do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá naquele grupo do Renan e viu que você tá mandando muito bem com o Amazon Code Pro. Mais de 40k/mês é coisa de quem sabe o que tá fazendo, parabéns!\n\nEle reparou que você tava comentando sobre estruturar melhor o funil, checkout, CRM... tudo junto. A gente tem uma plataforma que junta tudo isso num lugar só, sem precisar ficar plugando Kommo com Typebot com Cademi com Greenn e rezando pra não quebrar 😅\n\nQueria te mostrar como ficaria o teu funil rodando tudo integrado. Rola um papo rápido de uns 15 min?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5519988584419&text=Oi%20Eduardo!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20sou%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20naquele%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20mandando%20muito%20bem%20com%20o%20Amazon%20Code%20Pro.%20Mais%20de%2040k%2Fm%C3%AAs%20%C3%A9%20coisa%20de%20quem%20sabe%20o%20que%20t%C3%A1%20fazendo%2C%20parab%C3%A9ns!%0A%0AEle%20reparou%20que%20voc%C3%AA%20tava%20comentando%20sobre%20estruturar%20melhor%20o%20funil%2C%20checkout%2C%20CRM...%20tudo%20junto.%20A%20gente%20tem%20uma%20plataforma%20que%20junta%20tudo%20isso%20num%20lugar%20s%C3%B3%2C%20sem%20precisar%20ficar%20plugando%20Kommo%20com%20Typebot%20com%20Cademi%20com%20Greenn%20e%20rezando%20pra%20n%C3%A3o%20quebrar%20%F0%9F%98%85%0A%0AQueria%20te%20mostrar%20como%20ficaria%20o%20teu%20funil%20rodando%20tudo%20integrado.%20Rola%20um%20papo%20r%C3%A1pido%20de%20uns%2015%20min%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Katia",
    "+5585981882333",
    "MENTORIA 50K",
    "client + partner",
    "Score 10/10 - Produtos educacionais digitais (score 10)",
    "Oi Katia! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, participa do grupo do Renan e viu que você ensina especialistas a criarem infoprodutos. Muito bacana o trabalho!\n\nEle notou também que você tava tendo uns problemas com o Asaas e a Cademi, bugs e tal. A gente trabalha com uma plataforma que tem área de membros, checkout e CRM tudo nativo, sem precisar ficar integrando ferramenta com ferramenta.\n\nComo você trabalha ensinando criação de cursos, achei que podia rolar uma conversa legal. Tanto pra você usar quanto talvez indicar pros seus alunos. Que acha de trocar uma ideia?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5585981882333&text=Oi%20Katia!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20participa%20do%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20ensina%20especialistas%20a%20criarem%20infoprodutos.%20Muito%20bacana%20o%20trabalho!%0A%0AEle%20notou%20tamb%C3%A9m%20que%20voc%C3%AA%20tava%20tendo%20uns%20problemas%20com%20o%20Asaas%20e%20a%20Cademi%2C%20bugs%20e%20tal.%20A%20gente%20trabalha%20com%20uma%20plataforma%20que%20tem%20%C3%A1rea%20de%20membros%2C%20checkout%20e%20CRM%20tudo%20nativo%2C%20sem%20precisar%20ficar%20integrando%20ferramenta%20com%20ferramenta.%0A%0AComo%20voc%C3%AA%20trabalha%20ensinando%20cria%C3%A7%C3%A3o%20de%20cursos%2C%20achei%20que%20podia%20rolar%20uma%20conversa%20legal.%20Tanto%20pra%20voc%C3%AA%20usar%20quanto%20talvez%20indicar%20pros%20seus%20alunos.%20Que%20acha%20de%20trocar%20uma%20ideia%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Roberta",
    "+5553999338893",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Mentoria negocios/marketing (score 10)",
    "Oi Roberta! Tudo bem? Aqui é o Antonio, sou do time da Ensinio.\n\nO Fosc, sócio fundador daqui, tá no grupo do Renan e viu que você tá montando sua mentoria empresarial e comparando plataformas. Hotmart, Mercado Pago, Kommo... muita coisa pra juntar né?\n\nA gente tem uma plataforma que resolve isso de um jeito bem mais simples. Área de membros, checkout, comunidade e CRM tudo no mesmo lugar. Sem ficar pagando 4-5 ferramentas separadas e torcendo pra integração não quebrar.\n\nSe você ainda tiver decidindo, acho que vale a pena dar uma olhada antes de fechar com qualquer uma. Posso te mostrar rapidinho?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5553999338893&text=Oi%20Roberta!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20sou%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20s%C3%B3cio%20fundador%20daqui%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20montando%20sua%20mentoria%20empresarial%20e%20comparando%20plataformas.%20Hotmart%2C%20Mercado%20Pago%2C%20Kommo...%20muita%20coisa%20pra%20juntar%20n%C3%A9%3F%0A%0AA%20gente%20tem%20uma%20plataforma%20que%20resolve%20isso%20de%20um%20jeito%20bem%20mais%20simples.%20%C3%81rea%20de%20membros%2C%20checkout%2C%20comunidade%20e%20CRM%20tudo%20no%20mesmo%20lugar.%20Sem%20ficar%20pagando%204-5%20ferramentas%20separadas%20e%20torcendo%20pra%20integra%C3%A7%C3%A3o%20n%C3%A3o%20quebrar.%0A%0ASe%20voc%C3%AA%20ainda%20tiver%20decidindo%2C%20acho%20que%20vale%20a%20pena%20dar%20uma%20olhada%20antes%20de%20fechar%20com%20qualquer%20uma.%20Posso%20te%20mostrar%20rapidinho%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Rachel",
    "+5524992126365",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Nutricao - perdeu 3 vendas por checkout (score 10)",
    "Oi Rachel! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você tá digitalizando suas consultorias de nutrição. Muito legal esse movimento!\n\nEle viu também que você perdeu 3 vendas por causa de problema no checkout da InfinityPay. Isso dói demais, né? Perder venda por falha técnica quando o cliente já queria comprar.\n\nA gente tem um checkout que foi feito justamente pra não deixar isso acontecer. E o melhor: vem junto com área de membros e comunidade, tudo integrado. Sem dor de cabeça com integração.\n\nPosso te mostrar como funciona? Acho que você ia gostar bastante 😊",
    "https://api.whatsapp.com/send?phone=5524992126365&text=Oi%20Rachel!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20digitalizando%20suas%20consultorias%20de%20nutri%C3%A7%C3%A3o.%20Muito%20legal%20esse%20movimento!%0A%0AEle%20viu%20tamb%C3%A9m%20que%20voc%C3%AA%20perdeu%203%20vendas%20por%20causa%20de%20problema%20no%20checkout%20da%20InfinityPay.%20Isso%20d%C3%B3i%20demais%2C%20n%C3%A9%3F%20Perder%20venda%20por%20falha%20t%C3%A9cnica%20quando%20o%20cliente%20j%C3%A1%20queria%20comprar.%0A%0AA%20gente%20tem%20um%20checkout%20que%20foi%20feito%20justamente%20pra%20n%C3%A3o%20deixar%20isso%20acontecer.%20E%20o%20melhor%3A%20vem%20junto%20com%20%C3%A1rea%20de%20membros%20e%20comunidade%2C%20tudo%20integrado.%20Sem%20dor%20de%20cabe%C3%A7a%20com%20integra%C3%A7%C3%A3o.%0A%0APosso%20te%20mostrar%20como%20funciona%3F%20Acho%20que%20voc%C3%AA%20ia%20gostar%20bastante%20%F0%9F%98%8A"
  ],
  [
    "Alexandra",
    "+19172043384",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Mentoria internacional - EUA (score 10)",
    "Oi Alexandra! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, sócio fundador daqui, tá no grupo do Renan e viu que você tá estruturando sua mentoria de fora do Brasil. E viu também que você tava com dificuldade pra achar as coisas na plataforma e que o suporte não responde. Chato demais isso, ainda mais estando em outro país e com fuso diferente.\n\nA gente trabalha com uma plataforma pensada pra ser bem intuitiva e com suporte que responde rápido de verdade. Além disso, funciona muito bem pra quem vende internacionalmente, com pagamentos em diferentes moedas.\n\nSe quiser, posso te mostrar num papo rápido. Acho que pode facilitar bastante a tua vida aí fora.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=19172043384&text=Oi%20Alexandra!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20s%C3%B3cio%20fundador%20daqui%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20estruturando%20sua%20mentoria%20de%20fora%20do%20Brasil.%20E%20viu%20tamb%C3%A9m%20que%20voc%C3%AA%20tava%20com%20dificuldade%20pra%20achar%20as%20coisas%20na%20plataforma%20e%20que%20o%20suporte%20n%C3%A3o%20responde.%20Chato%20demais%20isso%2C%20ainda%20mais%20estando%20em%20outro%20pa%C3%ADs%20e%20com%20fuso%20diferente.%0A%0AA%20gente%20trabalha%20com%20uma%20plataforma%20pensada%20pra%20ser%20bem%20intuitiva%20e%20com%20suporte%20que%20responde%20r%C3%A1pido%20de%20verdade.%20Al%C3%A9m%20disso%2C%20funciona%20muito%20bem%20pra%20quem%20vende%20internacionalmente%2C%20com%20pagamentos%20em%20diferentes%20moedas.%0A%0ASe%20quiser%2C%20posso%20te%20mostrar%20num%20papo%20r%C3%A1pido.%20Acho%20que%20pode%20facilitar%20bastante%20a%20tua%20vida%20a%C3%AD%20fora.%0A%0AAbra%C3%A7o!"
  ],
  [
    "⚖️",
    "+5561996116006",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Juridico/advocacia (score 10)",
    "Oi! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, sócio fundador daqui, tá no grupo do Renan e viu que você tá começando do zero no digital, na área jurídica. E que tava achando o método um pouco difícil no início. Normal, faz parte mesmo!\n\nA gente trabalha com uma plataforma que simplifica muito essa parte de montar a estrutura. Área de membros pra entregar o conteúdo, checkout pra receber, comunidade pros alunos, tudo num lugar só. Pra quem tá começando, não ter que aprender 5 ferramentas diferentes faz toda a diferença.\n\nSe você quiser, posso te mostrar como funciona. É bem mais simples do que parece 😊\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5561996116006&text=Oi!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20s%C3%B3cio%20fundador%20daqui%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20come%C3%A7ando%20do%20zero%20no%20digital%2C%20na%20%C3%A1rea%20jur%C3%ADdica.%20E%20que%20tava%20achando%20o%20m%C3%A9todo%20um%20pouco%20dif%C3%ADcil%20no%20in%C3%ADcio.%20Normal%2C%20faz%20parte%20mesmo!%0A%0AA%20gente%20trabalha%20com%20uma%20plataforma%20que%20simplifica%20muito%20essa%20parte%20de%20montar%20a%20estrutura.%20%C3%81rea%20de%20membros%20pra%20entregar%20o%20conte%C3%BAdo%2C%20checkout%20pra%20receber%2C%20comunidade%20pros%20alunos%2C%20tudo%20num%20lugar%20s%C3%B3.%20Pra%20quem%20t%C3%A1%20come%C3%A7ando%2C%20n%C3%A3o%20ter%20que%20aprender%205%20ferramentas%20diferentes%20faz%20toda%20a%20diferen%C3%A7a.%0A%0ASe%20voc%C3%AA%20quiser%2C%20posso%20te%20mostrar%20como%20funciona.%20%C3%89%20bem%20mais%20simples%20do%20que%20parece%20%F0%9F%98%8A%0A%0AAbra%C3%A7o!"
  ],
  [
    "Jonatas",
    "+5511943873119",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Migrou para mentoria 10k-15k (score 10)",
    "Oi Jonatas! Tudo bem? Aqui é o Antonio, sou do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você migrou de curso pra mentoria e já vendeu 10k e 15k. Resultado muito forte pra quem tá começando!\n\nAgora que você tá nessa fase de escalar, a estrutura por trás faz muita diferença. A gente tem uma plataforma que junta área de membros, checkout, CRM e comunidade tudo integrado. Nada de ficar plugando ferramenta com ferramenta e lidando com erro e bug.\n\nAchei que valia a pena te apresentar, principalmente pra essa próxima fase de crescimento. Rola um papo rápido?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511943873119&text=Oi%20Jonatas!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20sou%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20migrou%20de%20curso%20pra%20mentoria%20e%20j%C3%A1%20vendeu%2010k%20e%2015k.%20Resultado%20muito%20forte%20pra%20quem%20t%C3%A1%20come%C3%A7ando!%0A%0AAgora%20que%20voc%C3%AA%20t%C3%A1%20nessa%20fase%20de%20escalar%2C%20a%20estrutura%20por%20tr%C3%A1s%20faz%20muita%20diferen%C3%A7a.%20A%20gente%20tem%20uma%20plataforma%20que%20junta%20%C3%A1rea%20de%20membros%2C%20checkout%2C%20CRM%20e%20comunidade%20tudo%20integrado.%20Nada%20de%20ficar%20plugando%20ferramenta%20com%20ferramenta%20e%20lidando%20com%20erro%20e%20bug.%0A%0AAchei%20que%20valia%20a%20pena%20te%20apresentar%2C%20principalmente%20pra%20essa%20pr%C3%B3xima%20fase%20de%20crescimento.%20Rola%20um%20papo%20r%C3%A1pido%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Vittoria",
    "+5531981049769",
    "MENTORIA 50K",
    "client",
    "Score 10/10 - Consultoria de imagem (score 10)",
    "Oi Vittoria! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você trabalha com consultoria de imagem e posicionamento profissional. Que nicho incrível! Ajudar empresárias a se sentirem seguras e bem vestidas é muito potente.\n\nEle viu que você tá montando a estrutura da mentoria e tendo uns problemas com integração de ferramentas. A gente tem uma plataforma que tem tudo junto: área pra entregar conteúdo, comunidade pras alunas e CRM pra acompanhar cada uma. Sem precisar conectar nada externamente.\n\nSe quiser conhecer, posso te mostrar num papo rápido. Acho que vai fazer sentido pro que você tá construindo 😊",
    "https://api.whatsapp.com/send?phone=5531981049769&text=Oi%20Vittoria!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20trabalha%20com%20consultoria%20de%20imagem%20e%20posicionamento%20profissional.%20Que%20nicho%20incr%C3%ADvel!%20Ajudar%20empres%C3%A1rias%20a%20se%20sentirem%20seguras%20e%20bem%20vestidas%20%C3%A9%20muito%20potente.%0A%0AEle%20viu%20que%20voc%C3%AA%20t%C3%A1%20montando%20a%20estrutura%20da%20mentoria%20e%20tendo%20uns%20problemas%20com%20integra%C3%A7%C3%A3o%20de%20ferramentas.%20A%20gente%20tem%20uma%20plataforma%20que%20tem%20tudo%20junto%3A%20%C3%A1rea%20pra%20entregar%20conte%C3%BAdo%2C%20comunidade%20pras%20alunas%20e%20CRM%20pra%20acompanhar%20cada%20uma.%20Sem%20precisar%20conectar%20nada%20externamente.%0A%0ASe%20quiser%20conhecer%2C%20posso%20te%20mostrar%20num%20papo%20r%C3%A1pido.%20Acho%20que%20vai%20fazer%20sentido%20pro%20que%20voc%C3%AA%20t%C3%A1%20construindo%20%F0%9F%98%8A"
  ],
  [
    "Guilherme",
    "+5511965880619",
    "MENTORIA 50K",
    "client",
    "Score 9/10 - Social selling (score 9)",
    "Oi Guilherme! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, sócio fundador daqui, tá no grupo do Renan e viu que você tá focado em social selling com tráfego pro perfil. Estratégia bem inteligente!\n\nEle percebeu também que você tava comentando sobre custos de plataforma e problemas de integração. A gente tem uma plataforma que junta tudo que você precisa pra rodar o funil: área de membros, checkout, CRM e comunidade. Tudo nativo, sem custo extra de integração e sem risco de quebrar.\n\nSe quiser dar uma olhada, posso te mostrar rapidinho como funciona. Acho que vai te ajudar a focar no que importa que é vender.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511965880619&text=Oi%20Guilherme!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20s%C3%B3cio%20fundador%20daqui%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20focado%20em%20social%20selling%20com%20tr%C3%A1fego%20pro%20perfil.%20Estrat%C3%A9gia%20bem%20inteligente!%0A%0AEle%20percebeu%20tamb%C3%A9m%20que%20voc%C3%AA%20tava%20comentando%20sobre%20custos%20de%20plataforma%20e%20problemas%20de%20integra%C3%A7%C3%A3o.%20A%20gente%20tem%20uma%20plataforma%20que%20junta%20tudo%20que%20voc%C3%AA%20precisa%20pra%20rodar%20o%20funil%3A%20%C3%A1rea%20de%20membros%2C%20checkout%2C%20CRM%20e%20comunidade.%20Tudo%20nativo%2C%20sem%20custo%20extra%20de%20integra%C3%A7%C3%A3o%20e%20sem%20risco%20de%20quebrar.%0A%0ASe%20quiser%20dar%20uma%20olhada%2C%20posso%20te%20mostrar%20rapidinho%20como%20funciona.%20Acho%20que%20vai%20te%20ajudar%20a%20focar%20no%20que%20importa%20que%20%C3%A9%20vender.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Murilo",
    "+5511996909347",
    "MENTORIA 50K",
    "client",
    "Score 9/10 - Audio WhatsApp para vendas (score 9)",
    "Oi Murilo! Tudo bem? Aqui é o Antonio, sou do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu aquele lance de você mandar áudio do jeito que o Renan ensinou e o lead responder na hora. E depois fechar a venda! Muito bom ver o método funcionando assim na prática.\n\nAgora, pra você continuar escalando isso, a estrutura por trás precisa acompanhar. A gente tem uma plataforma com CRM, checkout e área de membros tudo integrado. Principalmente o CRM que te ajuda a acompanhar cada lead sem perder ninguém no meio do caminho.\n\nBora trocar uma ideia sobre isso? Acho que pode potencializar muito os teus resultados.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511996909347&text=Oi%20Murilo!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20sou%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20aquele%20lance%20de%20voc%C3%AA%20mandar%20%C3%A1udio%20do%20jeito%20que%20o%20Renan%20ensinou%20e%20o%20lead%20responder%20na%20hora.%20E%20depois%20fechar%20a%20venda!%20Muito%20bom%20ver%20o%20m%C3%A9todo%20funcionando%20assim%20na%20pr%C3%A1tica.%0A%0AAgora%2C%20pra%20voc%C3%AA%20continuar%20escalando%20isso%2C%20a%20estrutura%20por%20tr%C3%A1s%20precisa%20acompanhar.%20A%20gente%20tem%20uma%20plataforma%20com%20CRM%2C%20checkout%20e%20%C3%A1rea%20de%20membros%20tudo%20integrado.%20Principalmente%20o%20CRM%20que%20te%20ajuda%20a%20acompanhar%20cada%20lead%20sem%20perder%20ningu%C3%A9m%20no%20meio%20do%20caminho.%0A%0ABora%20trocar%20uma%20ideia%20sobre%20isso%3F%20Acho%20que%20pode%20potencializar%20muito%20os%20teus%20resultados.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Ci",
    "+5511996909347",
    "MENTORIA 50K",
    "client",
    "Score 9/10 - Audio WhatsApp para vendas (score 9)",
    "Oi Ci! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você tá rodando tráfego pro F30 e já começaram a entrar leads qualificados. Boa fase!\n\nEle reparou também que você tava com dúvida sobre gateway de pagamento e precisando de material sobre SDR e abordagem. A gente tem uma plataforma que resolve essa parte toda: checkout integrado, área de membros, e CRM pra acompanhar os leads da entrada até o fechamento. Tudo num lugar só, sem ficar juntando peças.\n\nSe quiser conhecer, posso te mostrar como ficaria o seu funil rodando integrado. Acho que ia facilitar bastante essa fase de escalar.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511996909347&text=Oi%20Ci!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20rodando%20tr%C3%A1fego%20pro%20F30%20e%20j%C3%A1%20come%C3%A7aram%20a%20entrar%20leads%20qualificados.%20Boa%20fase!%0A%0AEle%20reparou%20tamb%C3%A9m%20que%20voc%C3%AA%20tava%20com%20d%C3%BAvida%20sobre%20gateway%20de%20pagamento%20e%20precisando%20de%20material%20sobre%20SDR%20e%20abordagem.%20A%20gente%20tem%20uma%20plataforma%20que%20resolve%20essa%20parte%20toda%3A%20checkout%20integrado%2C%20%C3%A1rea%20de%20membros%2C%20e%20CRM%20pra%20acompanhar%20os%20leads%20da%20entrada%20at%C3%A9%20o%20fechamento.%20Tudo%20num%20lugar%20s%C3%B3%2C%20sem%20ficar%20juntando%20pe%C3%A7as.%0A%0ASe%20quiser%20conhecer%2C%20posso%20te%20mostrar%20como%20ficaria%20o%20seu%20funil%20rodando%20integrado.%20Acho%20que%20ia%20facilitar%20bastante%20essa%20fase%20de%20escalar.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Jovito",
    "+5545988230696",
    "MENTORIA 50K",
    "client",
    "Score 8/10 - Agendamento de reunioes (score 8)",
    "Oi Jovito! Tudo bem? Aqui é o Antonio, sou do time da Ensinio.\n\nO Fosc, nosso sócio fundador, participa do grupo do Renan e viu que você tá fazendo um trabalho bem estruturado com agendamento de reuniões e vendas por call. Aquele fluxo de mandar convite e vídeo antes da reunião é muito profissional!\n\nA gente trabalha com uma plataforma que tem justamente essa parte de CRM e automação pra acompanhar o lead desde o agendamento até o fechamento. Junto com checkout e comunidade, tudo integrado. Sem precisar de várias ferramentas separadas.\n\nSe quiser dar uma olhada, posso te mostrar como encaixaria no seu processo de vendas. Que acha?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5545988230696&text=Oi%20Jovito!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20sou%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20participa%20do%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20fazendo%20um%20trabalho%20bem%20estruturado%20com%20agendamento%20de%20reuni%C3%B5es%20e%20vendas%20por%20call.%20Aquele%20fluxo%20de%20mandar%20convite%20e%20v%C3%ADdeo%20antes%20da%20reuni%C3%A3o%20%C3%A9%20muito%20profissional!%0A%0AA%20gente%20trabalha%20com%20uma%20plataforma%20que%20tem%20justamente%20essa%20parte%20de%20CRM%20e%20automa%C3%A7%C3%A3o%20pra%20acompanhar%20o%20lead%20desde%20o%20agendamento%20at%C3%A9%20o%20fechamento.%20Junto%20com%20checkout%20e%20comunidade%2C%20tudo%20integrado.%20Sem%20precisar%20de%20v%C3%A1rias%20ferramentas%20separadas.%0A%0ASe%20quiser%20dar%20uma%20olhada%2C%20posso%20te%20mostrar%20como%20encaixaria%20no%20seu%20processo%20de%20vendas.%20Que%20acha%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Ferris",
    "+5535999738127",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Daiane Ferris (score 7)",
    "Oi Ferris! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, sócio fundador daqui, tá no grupo do Renan e viu que você tava discutindo sobre taxas de imposto e plataformas de pagamento. Aquele lance dos 2.5% chamou a atenção dele.\n\nA gente trabalha com uma plataforma que, além de ter checkout com taxas bem competitivas, traz junto área de membros e comunidade. Pra quem tá olhando SEO e Google Ads como você mencionou, ter tudo organizado num lugar só ajuda demais a escalar.\n\nSe tiver interesse, posso te mostrar as condições. Sem compromisso nenhum, só pra você avaliar.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5535999738127&text=Oi%20Ferris!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20s%C3%B3cio%20fundador%20daqui%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20tava%20discutindo%20sobre%20taxas%20de%20imposto%20e%20plataformas%20de%20pagamento.%20Aquele%20lance%20dos%202.5%25%20chamou%20a%20aten%C3%A7%C3%A3o%20dele.%0A%0AA%20gente%20trabalha%20com%20uma%20plataforma%20que%2C%20al%C3%A9m%20de%20ter%20checkout%20com%20taxas%20bem%20competitivas%2C%20traz%20junto%20%C3%A1rea%20de%20membros%20e%20comunidade.%20Pra%20quem%20t%C3%A1%20olhando%20SEO%20e%20Google%20Ads%20como%20voc%C3%AA%20mencionou%2C%20ter%20tudo%20organizado%20num%20lugar%20s%C3%B3%20ajuda%20demais%20a%20escalar.%0A%0ASe%20tiver%20interesse%2C%20posso%20te%20mostrar%20as%20condi%C3%A7%C3%B5es.%20Sem%20compromisso%20nenhum%2C%20s%C3%B3%20pra%20voc%C3%AA%20avaliar.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Regina",
    "+5534991465350",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Problemas com Kommo (score 7)",
    "Oi Regina! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você tava com aquele problema da Kommo desconectando o WhatsApp. Pagou o pacote de 6 meses e ficou sem suporte. Muito frustrante!\n\nA gente tem uma plataforma com CRM integrado nativamente, então não tem esse risco de desconectar ou parar de funcionar. E se rolar qualquer dúvida, o suporte responde rápido mesmo. Além do CRM, tem área de membros e comunidade tudo junto.\n\nSe quiser, posso te mostrar como funciona. Aposto que você ia ficar mais tranquila sem depender da Kommo 😊",
    "https://api.whatsapp.com/send?phone=5534991465350&text=Oi%20Regina!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20tava%20com%20aquele%20problema%20da%20Kommo%20desconectando%20o%20WhatsApp.%20Pagou%20o%20pacote%20de%206%20meses%20e%20ficou%20sem%20suporte.%20Muito%20frustrante!%0A%0AA%20gente%20tem%20uma%20plataforma%20com%20CRM%20integrado%20nativamente%2C%20ent%C3%A3o%20n%C3%A3o%20tem%20esse%20risco%20de%20desconectar%20ou%20parar%20de%20funcionar.%20E%20se%20rolar%20qualquer%20d%C3%BAvida%2C%20o%20suporte%20responde%20r%C3%A1pido%20mesmo.%20Al%C3%A9m%20do%20CRM%2C%20tem%20%C3%A1rea%20de%20membros%20e%20comunidade%20tudo%20junto.%0A%0ASe%20quiser%2C%20posso%20te%20mostrar%20como%20funciona.%20Aposto%20que%20voc%C3%AA%20ia%20ficar%20mais%20tranquila%20sem%20depender%20da%20Kommo%20%F0%9F%98%8A"
  ],
  [
    "Cintia",
    "+5511974830404",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Trafego pro F30 (score 9)",
    "Oi Cintia! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu aquele post da venda de mentoria individual de 35 mil. Que resultado absurdo! Parabéns demais!\n\nAgora que você tá nesse nível, a estrutura precisa acompanhar né? A gente tem uma plataforma com área de membros, comunidade e CRM tudo integrado. Pra quem vende mentoria de alto ticket assim, ter um lugar profissional pra entregar o conteúdo e acompanhar cada mentorado faz toda diferença na experiência do cliente.\n\nSe quiser conhecer, posso te mostrar rapidinho. Acho que combina muito com o momento que você tá vivendo.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511974830404&text=Oi%20Cintia!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20aquele%20post%20da%20venda%20de%20mentoria%20individual%20de%2035%20mil.%20Que%20resultado%20absurdo!%20Parab%C3%A9ns%20demais!%0A%0AAgora%20que%20voc%C3%AA%20t%C3%A1%20nesse%20n%C3%ADvel%2C%20a%20estrutura%20precisa%20acompanhar%20n%C3%A9%3F%20A%20gente%20tem%20uma%20plataforma%20com%20%C3%A1rea%20de%20membros%2C%20comunidade%20e%20CRM%20tudo%20integrado.%20Pra%20quem%20vende%20mentoria%20de%20alto%20ticket%20assim%2C%20ter%20um%20lugar%20profissional%20pra%20entregar%20o%20conte%C3%BAdo%20e%20acompanhar%20cada%20mentorado%20faz%20toda%20diferen%C3%A7a%20na%20experi%C3%AAncia%20do%20cliente.%0A%0ASe%20quiser%20conhecer%2C%20posso%20te%20mostrar%20rapidinho.%20Acho%20que%20combina%20muito%20com%20o%20momento%20que%20voc%C3%AA%20t%C3%A1%20vivendo.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Vitor",
    "+5547999410274",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - LP e nivel de consciencia (score 7)",
    "Oi Vitor! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, sócio fundador daqui, tá no grupo do Renan e viu que você tá estruturando um funil bem pensado, com LP pra aumentar o nível de consciência do lead e duas campanhas rodando, topo e meio de funil. Estratégia sólida!\n\nA gente trabalha com uma plataforma que ajuda muito nessa parte de funil. Tem landing page, área de membros e CRM tudo nativo. E como você tava comentando sobre custos, ter tudo num lugar só sai bem mais em conta do que pagar várias ferramentas.\n\nSe quiser, posso te mostrar como ficaria essa estrutura toda rodando integrada. Que acha?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5547999410274&text=Oi%20Vitor!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20s%C3%B3cio%20fundador%20daqui%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20estruturando%20um%20funil%20bem%20pensado%2C%20com%20LP%20pra%20aumentar%20o%20n%C3%ADvel%20de%20consci%C3%AAncia%20do%20lead%20e%20duas%20campanhas%20rodando%2C%20topo%20e%20meio%20de%20funil.%20Estrat%C3%A9gia%20s%C3%B3lida!%0A%0AA%20gente%20trabalha%20com%20uma%20plataforma%20que%20ajuda%20muito%20nessa%20parte%20de%20funil.%20Tem%20landing%20page%2C%20%C3%A1rea%20de%20membros%20e%20CRM%20tudo%20nativo.%20E%20como%20voc%C3%AA%20tava%20comentando%20sobre%20custos%2C%20ter%20tudo%20num%20lugar%20s%C3%B3%20sai%20bem%20mais%20em%20conta%20do%20que%20pagar%20v%C3%A1rias%20ferramentas.%0A%0ASe%20quiser%2C%20posso%20te%20mostrar%20como%20ficaria%20essa%20estrutura%20toda%20rodando%20integrada.%20Que%20acha%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Geanderson",
    "+5521971396295",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Produtos de alto valor (score 7)",
    "Oi Geanderson! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você vende produtos de alto valor e tava na imersão dele. Muito bom saber que você tá escalando com equipe!\n\nPra quem vende alto ticket e tá montando time, ter uma plataforma robusta faz muita diferença. A gente tem área de membros, comunidade e CRM tudo integrado. Principalmente o CRM, que ajuda a equipe toda acompanhar os leads e não perder oportunidade.\n\nSe quiser conhecer, posso te mostrar num papo rápido. Acho que encaixa bem no momento de escala que você tá.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5521971396295&text=Oi%20Geanderson!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20vende%20produtos%20de%20alto%20valor%20e%20tava%20na%20imers%C3%A3o%20dele.%20Muito%20bom%20saber%20que%20voc%C3%AA%20t%C3%A1%20escalando%20com%20equipe!%0A%0APra%20quem%20vende%20alto%20ticket%20e%20t%C3%A1%20montando%20time%2C%20ter%20uma%20plataforma%20robusta%20faz%20muita%20diferen%C3%A7a.%20A%20gente%20tem%20%C3%A1rea%20de%20membros%2C%20comunidade%20e%20CRM%20tudo%20integrado.%20Principalmente%20o%20CRM%2C%20que%20ajuda%20a%20equipe%20toda%20acompanhar%20os%20leads%20e%20n%C3%A3o%20perder%20oportunidade.%0A%0ASe%20quiser%20conhecer%2C%20posso%20te%20mostrar%20num%20papo%20r%C3%A1pido.%20Acho%20que%20encaixa%20bem%20no%20momento%20de%20escala%20que%20voc%C3%AA%20t%C3%A1.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Matheus",
    "+5521998332217",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Entrou recentemente, aplicou tarefas (score 7)",
    "Oi Matheus! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você entrou na mentoria e já saiu aplicando as tarefas em menos de 24h. Esse tipo de execução faz toda diferença!\n\nEle viu também que você tava perguntando sobre planilha de gestão de métricas do funil. A gente tem uma plataforma com CRM integrado que faz exatamente isso: acompanha cada lead, cada etapa do funil, métricas de conversão. Tudo automático, sem precisar de planilha manual. Além de ter área de membros e comunidade junto.\n\nSe quiser dar uma olhada, posso te mostrar rapidinho. Acho que vai facilitar muito essa organização que você tá buscando.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5521998332217&text=Oi%20Matheus!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20entrou%20na%20mentoria%20e%20j%C3%A1%20saiu%20aplicando%20as%20tarefas%20em%20menos%20de%2024h.%20Esse%20tipo%20de%20execu%C3%A7%C3%A3o%20faz%20toda%20diferen%C3%A7a!%0A%0AEle%20viu%20tamb%C3%A9m%20que%20voc%C3%AA%20tava%20perguntando%20sobre%20planilha%20de%20gest%C3%A3o%20de%20m%C3%A9tricas%20do%20funil.%20A%20gente%20tem%20uma%20plataforma%20com%20CRM%20integrado%20que%20faz%20exatamente%20isso%3A%20acompanha%20cada%20lead%2C%20cada%20etapa%20do%20funil%2C%20m%C3%A9tricas%20de%20convers%C3%A3o.%20Tudo%20autom%C3%A1tico%2C%20sem%20precisar%20de%20planilha%20manual.%20Al%C3%A9m%20de%20ter%20%C3%A1rea%20de%20membros%20e%20comunidade%20junto.%0A%0ASe%20quiser%20dar%20uma%20olhada%2C%20posso%20te%20mostrar%20rapidinho.%20Acho%20que%20vai%20facilitar%20muito%20essa%20organiza%C3%A7%C3%A3o%20que%20voc%C3%AA%20t%C3%A1%20buscando.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Ana",
    "+5521993228892",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Advogada/professora (score 7)",
    "Oi Ana! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você é advogada e professora e que passou por uma experiência chata de ficar sem orientação depois de comprar a mentoria. Que bom que resolveu!\n\nComo você tá estruturando o digital agora, queria te apresentar a Ensinio. A gente tem uma plataforma bem intuitiva que junta tudo: área pra entregar conteúdo, comunidade e o principal, um suporte que realmente responde. Sei que depois daquela experiência, ter alguém de verdade do outro lado faz toda diferença.\n\nSe quiser conhecer, posso te mostrar num papo rápido e sem compromisso. Que acha?\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5521993228892&text=Oi%20Ana!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20%C3%A9%20advogada%20e%20professora%20e%20que%20passou%20por%20uma%20experi%C3%AAncia%20chata%20de%20ficar%20sem%20orienta%C3%A7%C3%A3o%20depois%20de%20comprar%20a%20mentoria.%20Que%20bom%20que%20resolveu!%0A%0AComo%20voc%C3%AA%20t%C3%A1%20estruturando%20o%20digital%20agora%2C%20queria%20te%20apresentar%20a%20Ensinio.%20A%20gente%20tem%20uma%20plataforma%20bem%20intuitiva%20que%20junta%20tudo%3A%20%C3%A1rea%20pra%20entregar%20conte%C3%BAdo%2C%20comunidade%20e%20o%20principal%2C%20um%20suporte%20que%20realmente%20responde.%20Sei%20que%20depois%20daquela%20experi%C3%AAncia%2C%20ter%20algu%C3%A9m%20de%20verdade%20do%20outro%20lado%20faz%20toda%20diferen%C3%A7a.%0A%0ASe%20quiser%20conhecer%2C%20posso%20te%20mostrar%20num%20papo%20r%C3%A1pido%20e%20sem%20compromisso.%20Que%20acha%3F%0A%0AAbra%C3%A7o!"
  ],
  [
    "Rodrigo",
    "+5511991163257",
    "MENTORIA 50K",
    "client",
    "Score 7/10 - Dentista high ticket (score 7)",
    "Oi Rodrigo! Tudo bem? Aqui é o Antonio, do time da Ensinio.\n\nO Fosc, nosso sócio fundador, tá no grupo do Renan e viu que você tá montando funil pra captar pacientes high ticket pra dentistas. E que já tem 3 doutoras interessadas! Muito bom esse modelo de implementação.\n\nA gente tem uma plataforma que seria perfeita pra isso. Você pode montar o funil completo pros seus clientes dentistas: formulário, VSL, área de membros, checkout e CRM tudo num lugar só. E o melhor, dá pra replicar pra cada cliente novo sem ter que montar tudo do zero.\n\nSe quiser, posso te mostrar como funciona. Acho que vai facilitar muito a entrega pros seus clientes.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511991163257&text=Oi%20Rodrigo!%20Tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20do%20time%20da%20Ensinio.%0A%0AO%20Fosc%2C%20nosso%20s%C3%B3cio%20fundador%2C%20t%C3%A1%20no%20grupo%20do%20Renan%20e%20viu%20que%20voc%C3%AA%20t%C3%A1%20montando%20funil%20pra%20captar%20pacientes%20high%20ticket%20pra%20dentistas.%20E%20que%20j%C3%A1%20tem%203%20doutoras%20interessadas!%20Muito%20bom%20esse%20modelo%20de%20implementa%C3%A7%C3%A3o.%0A%0AA%20gente%20tem%20uma%20plataforma%20que%20seria%20perfeita%20pra%20isso.%20Voc%C3%AA%20pode%20montar%20o%20funil%20completo%20pros%20seus%20clientes%20dentistas%3A%20formul%C3%A1rio%2C%20VSL%2C%20%C3%A1rea%20de%20membros%2C%20checkout%20e%20CRM%20tudo%20num%20lugar%20s%C3%B3.%20E%20o%20melhor%2C%20d%C3%A1%20pra%20replicar%20pra%20cada%20cliente%20novo%20sem%20ter%20que%20montar%20tudo%20do%20zero.%0A%0ASe%20quiser%2C%20posso%20te%20mostrar%20como%20funciona.%20Acho%20que%20vai%20facilitar%20muito%20a%20entrega%20pros%20seus%20clientes.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Cristiano Tamiso",
    "+5519997661584",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6 - busca social midia, discute script",
    "E aí Cristiano, tudo certo?\n\nVi que você estava procurando alguém pra social mídia e também organizando seu processo de vendas, né? Aquela história do link da aula antes da reunião.\n\nTô te mandando mensagem porque ajudo o Fosc (sócio fundador da Ensinio) a conversar com quem tá estruturando processo de venda + entrega de curso. Pelos seus comentários no grupo, parece que você tá justamente nessa fase de deixar tudo mais fluido pro aluno.\n\nA Ensinio é a plataforma que o Renan usa pra mentoria dele — basicamente LMS + checkout + comunidade tudo integrado. Talvez faça sentido você dar uma olhada pra ver se encaixa no que você tá montando.\n\nSe quiser trocar uma ideia rápida sobre como tá seu fluxo hoje, me avisa. Sem pressão, só pra entender se faz sentido mesmo 👍",
    "https://api.whatsapp.com/send?phone=5519997661584&text=E%20a%C3%AD%20Cristiano%2C%20tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20estava%20procurando%20algu%C3%A9m%20pra%20social%20m%C3%ADdia%20e%20tamb%C3%A9m%20organizando%20seu%20processo%20de%20vendas%2C%20n%C3%A9%3F%20Aquela%20hist%C3%B3ria%20do%20link%20da%20aula%20antes%20da%20reuni%C3%A3o.%0A%0AT%C3%B4%20te%20mandando%20mensagem%20porque%20ajudo%20o%20Fosc%20(s%C3%B3cio%20fundador%20da%20Ensinio)%20a%20conversar%20com%20quem%20t%C3%A1%20estruturando%20processo%20de%20venda%20%2B%20entrega%20de%20curso.%20Pelos%20seus%20coment%C3%A1rios%20no%20grupo%2C%20parece%20que%20voc%C3%AA%20t%C3%A1%20justamente%20nessa%20fase%20de%20deixar%20tudo%20mais%20fluido%20pro%20aluno.%0A%0AA%20Ensinio%20%C3%A9%20a%20plataforma%20que%20o%20Renan%20usa%20pra%20mentoria%20dele%20%E2%80%94%20basicamente%20LMS%20%2B%20checkout%20%2B%20comunidade%20tudo%20integrado.%20Talvez%20fa%C3%A7a%20sentido%20voc%C3%AA%20dar%20uma%20olhada%20pra%20ver%20se%20encaixa%20no%20que%20voc%C3%AA%20t%C3%A1%20montando.%0A%0ASe%20quiser%20trocar%20uma%20ideia%20r%C3%A1pida%20sobre%20como%20t%C3%A1%20seu%20fluxo%20hoje%2C%20me%20avisa.%20Sem%20press%C3%A3o%2C%20s%C3%B3%20pra%20entender%20se%20faz%20sentido%20mesmo%20%F0%9F%91%8D"
  ],
  [
    "Helena Debiasi",
    "+5548996138258",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "Oi Helena!\n\nVi que você tava com aquele perrengue de anúncio rejeitado e também comentou sobre estar chamando os leads que aparecem, né?\n\nSou o Antonio, trabalho com o Fosc aqui na Ensinio (a plataforma que o Renan usa pra mentoria dele). Tô conversando com algumas pessoas do grupo que tão vendendo online e estruturando processo.\n\nPelo que você mencionou ali sobre script de mensagem e meta de 15-30k/mês trabalhando 2-3x/semana, parece que você já tá com oferta validada e agora é mais questão de organizar o operacional mesmo.\n\nA Ensinio junta LMS + checkout + CRM tudo num lugar só, então fica mais fácil de gerenciar sem depender de suporte de ferramenta que não responde 😅\n\nSe fizer sentido bater um papo rápido sobre como você tá fazendo hoje, me chama. Posso te mostrar como outras pessoas do grupo usam aqui.",
    "https://api.whatsapp.com/send?phone=5548996138258&text=Oi%20Helena!%0A%0AVi%20que%20voc%C3%AA%20tava%20com%20aquele%20perrengue%20de%20an%C3%BAncio%20rejeitado%20e%20tamb%C3%A9m%20comentou%20sobre%20estar%20chamando%20os%20leads%20que%20aparecem%2C%20n%C3%A9%3F%0A%0ASou%20o%20Antonio%2C%20trabalho%20com%20o%20Fosc%20aqui%20na%20Ensinio%20(a%20plataforma%20que%20o%20Renan%20usa%20pra%20mentoria%20dele).%20T%C3%B4%20conversando%20com%20algumas%20pessoas%20do%20grupo%20que%20t%C3%A3o%20vendendo%20online%20e%20estruturando%20processo.%0A%0APelo%20que%20voc%C3%AA%20mencionou%20ali%20sobre%20script%20de%20mensagem%20e%20meta%20de%2015-30k%2Fm%C3%AAs%20trabalhando%202-3x%2Fsemana%2C%20parece%20que%20voc%C3%AA%20j%C3%A1%20t%C3%A1%20com%20oferta%20validada%20e%20agora%20%C3%A9%20mais%20quest%C3%A3o%20de%20organizar%20o%20operacional%20mesmo.%0A%0AA%20Ensinio%20junta%20LMS%20%2B%20checkout%20%2B%20CRM%20tudo%20num%20lugar%20s%C3%B3%2C%20ent%C3%A3o%20fica%20mais%20f%C3%A1cil%20de%20gerenciar%20sem%20depender%20de%20suporte%20de%20ferramenta%20que%20n%C3%A3o%20responde%20%F0%9F%98%85%0A%0ASe%20fizer%20sentido%20bater%20um%20papo%20r%C3%A1pido%20sobre%20como%20voc%C3%AA%20t%C3%A1%20fazendo%20hoje%2C%20me%20chama.%20Posso%20te%20mostrar%20como%20outras%20pessoas%20do%20grupo%20usam%20aqui."
  ],
  [
    "André Bittencourt",
    "+5511964823000",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "Fala André, beleza?\n\nTenho acompanhado suas participações no grupo — você é engajado demais, mano! Sempre dando risada e agregando nas conversas.\n\nSou o Antonio, ajudo o Fosc (sócio fundador da Ensinio) a conversar com pessoal que tá vendendo curso/mentoria online. A Ensinio é a plataforma que o Renan usa pra rodar a mentoria dele.\n\nVi que você comentou sobre custo em algum momento — sei que esse é um ponto importante quando você tá escolhendo ferramentas. A vantagem da Ensinio é que você não precisa ficar juntando 5 ferramentas diferentes (LMS + checkout + comunidade...), então acaba compensando no final das contas.\n\nSe você quiser entender melhor como funciona e se faz sentido pro seu projeto, a gente pode trocar uma ideia rápida. Sem compromisso, só pra você conhecer mesmo.",
    "https://api.whatsapp.com/send?phone=5511964823000&text=Fala%20Andr%C3%A9%2C%20beleza%3F%0A%0ATenho%20acompanhado%20suas%20participa%C3%A7%C3%B5es%20no%20grupo%20%E2%80%94%20voc%C3%AA%20%C3%A9%20engajado%20demais%2C%20mano!%20Sempre%20dando%20risada%20e%20agregando%20nas%20conversas.%0A%0ASou%20o%20Antonio%2C%20ajudo%20o%20Fosc%20(s%C3%B3cio%20fundador%20da%20Ensinio)%20a%20conversar%20com%20pessoal%20que%20t%C3%A1%20vendendo%20curso%2Fmentoria%20online.%20A%20Ensinio%20%C3%A9%20a%20plataforma%20que%20o%20Renan%20usa%20pra%20rodar%20a%20mentoria%20dele.%0A%0AVi%20que%20voc%C3%AA%20comentou%20sobre%20custo%20em%20algum%20momento%20%E2%80%94%20sei%20que%20esse%20%C3%A9%20um%20ponto%20importante%20quando%20voc%C3%AA%20t%C3%A1%20escolhendo%20ferramentas.%20A%20vantagem%20da%20Ensinio%20%C3%A9%20que%20voc%C3%AA%20n%C3%A3o%20precisa%20ficar%20juntando%205%20ferramentas%20diferentes%20(LMS%20%2B%20checkout%20%2B%20comunidade...)%2C%20ent%C3%A3o%20acaba%20compensando%20no%20final%20das%20contas.%0A%0ASe%20voc%C3%AA%20quiser%20entender%20melhor%20como%20funciona%20e%20se%20faz%20sentido%20pro%20seu%20projeto%2C%20a%20gente%20pode%20trocar%20uma%20ideia%20r%C3%A1pida.%20Sem%20compromisso%2C%20s%C3%B3%20pra%20voc%C3%AA%20conhecer%20mesmo."
  ],
  [
    "Elisa",
    "+5548996806001",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "Oi Elisa!\n\nVi que você tá com um setup bem pensado: curso de entrada que direciona pro formulário da mentoria, VSL pronta, pensando em bônus pra aumentar aplicações...\n\nSou o Antonio, trabalho com o Fosc aqui na Ensinio (a plataforma que o Renan usa). Tô conversando com algumas pessoas do grupo que já tem oferta estruturada como você e querem deixar o funil mais automático.\n\nO legal da Ensinio é que você consegue conectar tudo isso: aluno termina o curso de entrada, já cai automaticamente no fluxo da aplicação pra mentoria, dá pra configurar os bônus condicionais... tudo integrado no CRM.\n\nComo você já tem bastante coisa montada, acho que pode fazer sentido você conhecer pra ver se otimiza o que você já tá fazendo.\n\nSe quiser bater um papo rápido sobre seu funil, me avisa. Posso te mostrar como isso funcionaria na prática 👍",
    "https://api.whatsapp.com/send?phone=5548996806001&text=Oi%20Elisa!%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20com%20um%20setup%20bem%20pensado%3A%20curso%20de%20entrada%20que%20direciona%20pro%20formul%C3%A1rio%20da%20mentoria%2C%20VSL%20pronta%2C%20pensando%20em%20b%C3%B4nus%20pra%20aumentar%20aplica%C3%A7%C3%B5es...%0A%0ASou%20o%20Antonio%2C%20trabalho%20com%20o%20Fosc%20aqui%20na%20Ensinio%20(a%20plataforma%20que%20o%20Renan%20usa).%20T%C3%B4%20conversando%20com%20algumas%20pessoas%20do%20grupo%20que%20j%C3%A1%20tem%20oferta%20estruturada%20como%20voc%C3%AA%20e%20querem%20deixar%20o%20funil%20mais%20autom%C3%A1tico.%0A%0AO%20legal%20da%20Ensinio%20%C3%A9%20que%20voc%C3%AA%20consegue%20conectar%20tudo%20isso%3A%20aluno%20termina%20o%20curso%20de%20entrada%2C%20j%C3%A1%20cai%20automaticamente%20no%20fluxo%20da%20aplica%C3%A7%C3%A3o%20pra%20mentoria%2C%20d%C3%A1%20pra%20configurar%20os%20b%C3%B4nus%20condicionais...%20tudo%20integrado%20no%20CRM.%0A%0AComo%20voc%C3%AA%20j%C3%A1%20tem%20bastante%20coisa%20montada%2C%20acho%20que%20pode%20fazer%20sentido%20voc%C3%AA%20conhecer%20pra%20ver%20se%20otimiza%20o%20que%20voc%C3%AA%20j%C3%A1%20t%C3%A1%20fazendo.%0A%0ASe%20quiser%20bater%20um%20papo%20r%C3%A1pido%20sobre%20seu%20funil%2C%20me%20avisa.%20Posso%20te%20mostrar%20como%20isso%20funcionaria%20na%20pr%C3%A1tica%20%F0%9F%91%8D"
  ],
  [
    "Rafael Siqueira",
    "+5515991521701",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "E aí Rafael, tudo certo?\n\nVi que você tava apanhando um pouco com as perguntas de qualificação e também teve aquele problema publicando a segunda página, né? Imagino que deve ser frustrante quando a ferramenta trava justamente na hora de configurar.\n\nSou o Antonio, ajudo o Fosc (sócio fundador da Ensinio) a conversar com pessoal que vende online. A Ensinio é a plataforma que o Renan usa pra mentoria dele — LMS + checkout integrado, sem erro de integração maluco.\n\nPelo que você mencionou sobre usar GPT (mas não Claude ainda), parece que você já gosta de otimizar processo com IA. A Ensinio tem algumas automações nativas que talvez te ajudem a não precisar ficar quebrando cabeça com config.\n\nSe fizer sentido, a gente pode trocar uma ideia rápida sobre como você tá fazendo hoje e ver se a Ensinio resolve esses perrengues técnicos. Sem pressão!",
    "https://api.whatsapp.com/send?phone=5515991521701&text=E%20a%C3%AD%20Rafael%2C%20tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20tava%20apanhando%20um%20pouco%20com%20as%20perguntas%20de%20qualifica%C3%A7%C3%A3o%20e%20tamb%C3%A9m%20teve%20aquele%20problema%20publicando%20a%20segunda%20p%C3%A1gina%2C%20n%C3%A9%3F%20Imagino%20que%20deve%20ser%20frustrante%20quando%20a%20ferramenta%20trava%20justamente%20na%20hora%20de%20configurar.%0A%0ASou%20o%20Antonio%2C%20ajudo%20o%20Fosc%20(s%C3%B3cio%20fundador%20da%20Ensinio)%20a%20conversar%20com%20pessoal%20que%20vende%20online.%20A%20Ensinio%20%C3%A9%20a%20plataforma%20que%20o%20Renan%20usa%20pra%20mentoria%20dele%20%E2%80%94%20LMS%20%2B%20checkout%20integrado%2C%20sem%20erro%20de%20integra%C3%A7%C3%A3o%20maluco.%0A%0APelo%20que%20voc%C3%AA%20mencionou%20sobre%20usar%20GPT%20(mas%20n%C3%A3o%20Claude%20ainda)%2C%20parece%20que%20voc%C3%AA%20j%C3%A1%20gosta%20de%20otimizar%20processo%20com%20IA.%20A%20Ensinio%20tem%20algumas%20automa%C3%A7%C3%B5es%20nativas%20que%20talvez%20te%20ajudem%20a%20n%C3%A3o%20precisar%20ficar%20quebrando%20cabe%C3%A7a%20com%20config.%0A%0ASe%20fizer%20sentido%2C%20a%20gente%20pode%20trocar%20uma%20ideia%20r%C3%A1pida%20sobre%20como%20voc%C3%AA%20t%C3%A1%20fazendo%20hoje%20e%20ver%20se%20a%20Ensinio%20resolve%20esses%20perrengues%20t%C3%A9cnicos.%20Sem%20press%C3%A3o!"
  ],
  [
    "Cleberson Nogueira",
    "+5567992926726",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "Fala Cleberson!\n\nCara, achei muito interessante seu modelo: call de R$350 + mentoria em grupo R$2k, primeira turma ao vivo e depois gravou os módulos. E vendendo tudo via Instagram DM — muito eficiente!\n\nSou o Antonio, trabalho com o Fosc aqui na Ensinio (a plataforma que o Renan usa pra mentoria dele). Tô conversando com profissionais como você que vendem conhecimento online.\n\nPra um psicanalista que já tem oferta validada e tá escalando (saindo do ao vivo pro gravado), faz muito sentido ter tudo integrado: área de membros pros módulos gravados, checkout pras calls, comunidade pra interação entre turmas, CRM pra gerenciar os leads do Instagram.\n\nSe você quiser entender como isso funcionaria pro seu modelo específico, posso te mostrar rapidinho. Talvez otimize bastante o seu operacional 😊",
    "https://api.whatsapp.com/send?phone=5567992926726&text=Fala%20Cleberson!%0A%0ACara%2C%20achei%20muito%20interessante%20seu%20modelo%3A%20call%20de%20R%24350%20%2B%20mentoria%20em%20grupo%20R%242k%2C%20primeira%20turma%20ao%20vivo%20e%20depois%20gravou%20os%20m%C3%B3dulos.%20E%20vendendo%20tudo%20via%20Instagram%20DM%20%E2%80%94%20muito%20eficiente!%0A%0ASou%20o%20Antonio%2C%20trabalho%20com%20o%20Fosc%20aqui%20na%20Ensinio%20(a%20plataforma%20que%20o%20Renan%20usa%20pra%20mentoria%20dele).%20T%C3%B4%20conversando%20com%20profissionais%20como%20voc%C3%AA%20que%20vendem%20conhecimento%20online.%0A%0APra%20um%20psicanalista%20que%20j%C3%A1%20tem%20oferta%20validada%20e%20t%C3%A1%20escalando%20(saindo%20do%20ao%20vivo%20pro%20gravado)%2C%20faz%20muito%20sentido%20ter%20tudo%20integrado%3A%20%C3%A1rea%20de%20membros%20pros%20m%C3%B3dulos%20gravados%2C%20checkout%20pras%20calls%2C%20comunidade%20pra%20intera%C3%A7%C3%A3o%20entre%20turmas%2C%20CRM%20pra%20gerenciar%20os%20leads%20do%20Instagram.%0A%0ASe%20voc%C3%AA%20quiser%20entender%20como%20isso%20funcionaria%20pro%20seu%20modelo%20espec%C3%ADfico%2C%20posso%20te%20mostrar%20rapidinho.%20Talvez%20otimize%20bastante%20o%20seu%20operacional%20%F0%9F%98%8A"
  ],
  [
    "Marco Antonio Executivo",
    "+5519996941687",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "Fala Marco Antonio!\n\nTenho visto suas participações no grupo — você sempre dá feedbacks muito construtivos e técnicos pros pitches dos outros membros. Dá pra ver que você entende bem de estrutura de negócio.\n\nSou o Antonio, ajudo o Fosc (sócio fundador da Ensinio) a conversar com pessoal do grupo que vende conhecimento online. A Ensinio é a plataforma que o Renan usa pra mentoria dele.\n\nVi que você perguntou sobre apresentações no grupo — você tem algum projeto de curso/mentoria rodando também? Pelo seu perfil de dar feedback técnico, imagino que se tiver, deve ser algo bem estruturado.\n\nSe fizer sentido, posso te mostrar como a Ensinio funciona (LMS + checkout + comunidade integrada). Talvez seja útil pro que você tá construindo. Me avisa se quiser trocar uma ideia rápida!",
    "https://api.whatsapp.com/send?phone=5519996941687&text=Fala%20Marco%20Antonio!%0A%0ATenho%20visto%20suas%20participa%C3%A7%C3%B5es%20no%20grupo%20%E2%80%94%20voc%C3%AA%20sempre%20d%C3%A1%20feedbacks%20muito%20construtivos%20e%20t%C3%A9cnicos%20pros%20pitches%20dos%20outros%20membros.%20D%C3%A1%20pra%20ver%20que%20voc%C3%AA%20entende%20bem%20de%20estrutura%20de%20neg%C3%B3cio.%0A%0ASou%20o%20Antonio%2C%20ajudo%20o%20Fosc%20(s%C3%B3cio%20fundador%20da%20Ensinio)%20a%20conversar%20com%20pessoal%20do%20grupo%20que%20vende%20conhecimento%20online.%20A%20Ensinio%20%C3%A9%20a%20plataforma%20que%20o%20Renan%20usa%20pra%20mentoria%20dele.%0A%0AVi%20que%20voc%C3%AA%20perguntou%20sobre%20apresenta%C3%A7%C3%B5es%20no%20grupo%20%E2%80%94%20voc%C3%AA%20tem%20algum%20projeto%20de%20curso%2Fmentoria%20rodando%20tamb%C3%A9m%3F%20Pelo%20seu%20perfil%20de%20dar%20feedback%20t%C3%A9cnico%2C%20imagino%20que%20se%20tiver%2C%20deve%20ser%20algo%20bem%20estruturado.%0A%0ASe%20fizer%20sentido%2C%20posso%20te%20mostrar%20como%20a%20Ensinio%20funciona%20(LMS%20%2B%20checkout%20%2B%20comunidade%20integrada).%20Talvez%20seja%20%C3%BAtil%20pro%20que%20voc%C3%AA%20t%C3%A1%20construindo.%20Me%20avisa%20se%20quiser%20trocar%20uma%20ideia%20r%C3%A1pida!"
  ],
  [
    "Rafael Nunes",
    "+5511975142506",
    "MENTORIA 50K",
    "client",
    "Score 6/10 - Score 6",
    "E aí Rafael, beleza?\n\nVi que você resolve gastrite em 3 meses (área de saúde) e tava perguntando sobre social seller recentemente, né? Você tem sido bem ativo no grupo ultimamente.\n\nSou o Antonio, trabalho com o Fosc aqui na Ensinio (a plataforma que o Renan usa pra mentoria dele). Tô conversando com profissionais da saúde que vendem programa online — é um nicho que tem crescido bastante.\n\nPra quem trabalha com saúde e tem processo estruturado (tipo seus 3 meses de acompanhamento), faz muito sentido ter checkout + área de membros + CRM integrado. Facilita tanto pra você quanto pro paciente acompanhar a evolução.\n\nSe você quiser entender melhor como a Ensinio pode encaixar no seu modelo, podemos bater um papo rápido. Sem compromisso, só pra você conhecer mesmo 👍",
    "https://api.whatsapp.com/send?phone=5511975142506&text=E%20a%C3%AD%20Rafael%2C%20beleza%3F%0A%0AVi%20que%20voc%C3%AA%20resolve%20gastrite%20em%203%20meses%20(%C3%A1rea%20de%20sa%C3%BAde)%20e%20tava%20perguntando%20sobre%20social%20seller%20recentemente%2C%20n%C3%A9%3F%20Voc%C3%AA%20tem%20sido%20bem%20ativo%20no%20grupo%20ultimamente.%0A%0ASou%20o%20Antonio%2C%20trabalho%20com%20o%20Fosc%20aqui%20na%20Ensinio%20(a%20plataforma%20que%20o%20Renan%20usa%20pra%20mentoria%20dele).%20T%C3%B4%20conversando%20com%20profissionais%20da%20sa%C3%BAde%20que%20vendem%20programa%20online%20%E2%80%94%20%C3%A9%20um%20nicho%20que%20tem%20crescido%20bastante.%0A%0APra%20quem%20trabalha%20com%20sa%C3%BAde%20e%20tem%20processo%20estruturado%20(tipo%20seus%203%20meses%20de%20acompanhamento)%2C%20faz%20muito%20sentido%20ter%20checkout%20%2B%20%C3%A1rea%20de%20membros%20%2B%20CRM%20integrado.%20Facilita%20tanto%20pra%20voc%C3%AA%20quanto%20pro%20paciente%20acompanhar%20a%20evolu%C3%A7%C3%A3o.%0A%0ASe%20voc%C3%AA%20quiser%20entender%20melhor%20como%20a%20Ensinio%20pode%20encaixar%20no%20seu%20modelo%2C%20podemos%20bater%20um%20papo%20r%C3%A1pido.%20Sem%20compromisso%2C%20s%C3%B3%20pra%20voc%C3%AA%20conhecer%20mesmo%20%F0%9F%91%8D"
  ],
  [
    "Tiago",
    "+5568999203739",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 5",
    "Fala Tiago! Tudo certo?\n\nVi que você estava simulando aquele fluxo de anúncio → formulário → aula gratuita lá no grupo. Achei bem interessante sua dúvida sobre falar do método sem mencionar mentoria direto.\n\nAqui na Ensinio a gente trabalha exatamente com isso — estruturar funis que convertem, integrando formulários, páginas de captura e área de membros de um jeito que faz sentido pro seu negócio. Se quiser trocar uma ideia sobre como otimizar esse fluxo, me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5568999203739&text=Fala%20Tiago!%20Tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20estava%20simulando%20aquele%20fluxo%20de%20an%C3%BAncio%20%E2%86%92%20formul%C3%A1rio%20%E2%86%92%20aula%20gratuita%20l%C3%A1%20no%20grupo.%20Achei%20bem%20interessante%20sua%20d%C3%BAvida%20sobre%20falar%20do%20m%C3%A9todo%20sem%20mencionar%20mentoria%20direto.%0A%0AAqui%20na%20Ensinio%20a%20gente%20trabalha%20exatamente%20com%20isso%20%E2%80%94%20estruturar%20funis%20que%20convertem%2C%20integrando%20formul%C3%A1rios%2C%20p%C3%A1ginas%20de%20captura%20e%20%C3%A1rea%20de%20membros%20de%20um%20jeito%20que%20faz%20sentido%20pro%20seu%20neg%C3%B3cio.%20Se%20quiser%20trocar%20uma%20ideia%20sobre%20como%20otimizar%20esse%20fluxo%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Ciça Oliver",
    "+5511974830404",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Trafego pro F30 (score 9)",
    "Oi Ciça! Aqui é o Antonio, da equipe do Fosc (Ensinio).\n\nVi que você estava com problema de plataforma travando e trabalha com profissionais da beleza que querem virar mentoras. Achei seu projeto muito bacana!\n\nA Ensinio é especializada em plataformas pra quem trabalha com mentoria e comunidades — e a gente tem um suporte bem próximo justamente pra evitar esses perrengues de travamento. Se quiser conversar sobre como podemos facilitar a sua operação, estou à disposição.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511974830404&text=Oi%20Ci%C3%A7a!%20Aqui%20%C3%A9%20o%20Antonio%2C%20da%20equipe%20do%20Fosc%20(Ensinio).%0A%0AVi%20que%20voc%C3%AA%20estava%20com%20problema%20de%20plataforma%20travando%20e%20trabalha%20com%20profissionais%20da%20beleza%20que%20querem%20virar%20mentoras.%20Achei%20seu%20projeto%20muito%20bacana!%0A%0AA%20Ensinio%20%C3%A9%20especializada%20em%20plataformas%20pra%20quem%20trabalha%20com%20mentoria%20e%20comunidades%20%E2%80%94%20e%20a%20gente%20tem%20um%20suporte%20bem%20pr%C3%B3ximo%20justamente%20pra%20evitar%20esses%20perrengues%20de%20travamento.%20Se%20quiser%20conversar%20sobre%20como%20podemos%20facilitar%20a%20sua%20opera%C3%A7%C3%A3o%2C%20estou%20%C3%A0%20disposi%C3%A7%C3%A3o.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Ricardo Soares",
    "+5549991628058",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 5",
    "Fala Ricardo! Tudo bem?\n\nVi suas conquistas lá no grupo — \"2 reuniões, 2 vendas, golaço!\" 🔥\n\nTrabalhar com perfil comportamental psicológico é muito forte, e vejo que você já está colhendo resultados. Aqui na Ensinio a gente ajuda mentorias e infoprodutos a estruturarem melhor a operação com LMS, checkout e comunidade integrados. Se quiser bater um papo sobre como escalar ainda mais, me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5549991628058&text=Fala%20Ricardo!%20Tudo%20bem%3F%0A%0AVi%20suas%20conquistas%20l%C3%A1%20no%20grupo%20%E2%80%94%20%222%20reuni%C3%B5es%2C%202%20vendas%2C%20gola%C3%A7o!%22%20%F0%9F%94%A5%0A%0ATrabalhar%20com%20perfil%20comportamental%20psicol%C3%B3gico%20%C3%A9%20muito%20forte%2C%20e%20vejo%20que%20voc%C3%AA%20j%C3%A1%20est%C3%A1%20colhendo%20resultados.%20Aqui%20na%20Ensinio%20a%20gente%20ajuda%20mentorias%20e%20infoprodutos%20a%20estruturarem%20melhor%20a%20opera%C3%A7%C3%A3o%20com%20LMS%2C%20checkout%20e%20comunidade%20integrados.%20Se%20quiser%20bater%20um%20papo%20sobre%20como%20escalar%20ainda%20mais%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Engenheiro Lucas Bandeira",
    "+5586999148644",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 5",
    "Fala Lucas! Beleza?\n\nVi que você está querendo montar uma área de membros e já entende bem de tráfego (público certo, investimento). Isso faz toda diferença!\n\nAqui na Ensinio a gente é especialista em área de membros integrada com LMS e comunidade — tudo preparado pra quem já sabe onde quer chegar. Se quiser trocar uma ideia sobre a melhor estrutura pro seu projeto, estou por aqui.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5586999148644&text=Fala%20Lucas!%20Beleza%3F%0A%0AVi%20que%20voc%C3%AA%20est%C3%A1%20querendo%20montar%20uma%20%C3%A1rea%20de%20membros%20e%20j%C3%A1%20entende%20bem%20de%20tr%C3%A1fego%20(p%C3%BAblico%20certo%2C%20investimento).%20Isso%20faz%20toda%20diferen%C3%A7a!%0A%0AAqui%20na%20Ensinio%20a%20gente%20%C3%A9%20especialista%20em%20%C3%A1rea%20de%20membros%20integrada%20com%20LMS%20e%20comunidade%20%E2%80%94%20tudo%20preparado%20pra%20quem%20j%C3%A1%20sabe%20onde%20quer%20chegar.%20Se%20quiser%20trocar%20uma%20ideia%20sobre%20a%20melhor%20estrutura%20pro%20seu%20projeto%2C%20estou%20por%20aqui.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Pam",
    "+5516992312897",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 5 - Pam (emoji flor)",
    "Oi Pam! Tudo bem?\n\nVi que você estava com erro de integração e apanhando com fluxo JSON no Typebot. Sei como essas paradas técnicas podem travar o projeto inteiro.\n\nAqui na Ensinio a gente oferece integração nativa com principais ferramentas e um suporte bem próximo pra evitar esse tipo de perrengue. Se quiser conversar sobre como simplificar sua operação (LMS + CRM integrados), me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5516992312897&text=Oi%20Pam!%20Tudo%20bem%3F%0A%0AVi%20que%20voc%C3%AA%20estava%20com%20erro%20de%20integra%C3%A7%C3%A3o%20e%20apanhando%20com%20fluxo%20JSON%20no%20Typebot.%20Sei%20como%20essas%20paradas%20t%C3%A9cnicas%20podem%20travar%20o%20projeto%20inteiro.%0A%0AAqui%20na%20Ensinio%20a%20gente%20oferece%20integra%C3%A7%C3%A3o%20nativa%20com%20principais%20ferramentas%20e%20um%20suporte%20bem%20pr%C3%B3ximo%20pra%20evitar%20esse%20tipo%20de%20perrengue.%20Se%20quiser%20conversar%20sobre%20como%20simplificar%20sua%20opera%C3%A7%C3%A3o%20(LMS%20%2B%20CRM%20integrados)%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Ariane Freitas",
    "+5512997843962",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 5",
    "Oi Ariane! Tudo certo?\n\nVi que você está criando dashboards com IA e já treinou GPT pra roteiros de VSL — muito forte! Percebi também que rolou erro de integração por aí.\n\nAqui na Ensinio a gente trabalha com plataforma preparada pra quem quer rodar mentoria/infoproduto com tecnologia (LMS, checkout, CRM integrados). Se quiser bater um papo sobre como estruturar melhor a operação técnica do seu projeto, estou à disposição.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5512997843962&text=Oi%20Ariane!%20Tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20est%C3%A1%20criando%20dashboards%20com%20IA%20e%20j%C3%A1%20treinou%20GPT%20pra%20roteiros%20de%20VSL%20%E2%80%94%20muito%20forte!%20Percebi%20tamb%C3%A9m%20que%20rolou%20erro%20de%20integra%C3%A7%C3%A3o%20por%20a%C3%AD.%0A%0AAqui%20na%20Ensinio%20a%20gente%20trabalha%20com%20plataforma%20preparada%20pra%20quem%20quer%20rodar%20mentoria%2Finfoproduto%20com%20tecnologia%20(LMS%2C%20checkout%2C%20CRM%20integrados).%20Se%20quiser%20bater%20um%20papo%20sobre%20como%20estruturar%20melhor%20a%20opera%C3%A7%C3%A3o%20t%C3%A9cnica%20do%20seu%20projeto%2C%20estou%20%C3%A0%20disposi%C3%A7%C3%A3o.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Gustavo Monteiro",
    "+5566996623439",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 4",
    "Fala Gustavo! Beleza?\n\nVi que você está bem ativo no grupo e já está estruturando scripts de mensagem pra leads (\"Olá nome do lead, você preencheu meu formulário...\"). Isso mostra que você já está pensando em automação e conversão.\n\nAqui na Ensinio a gente oferece LMS, CRM e Comunidade integrados — tudo preparado pra quem quer escalar com processos bem montados. Se quiser trocar uma ideia sobre otimizar seu funil, me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5566996623439&text=Fala%20Gustavo!%20Beleza%3F%0A%0AVi%20que%20voc%C3%AA%20est%C3%A1%20bem%20ativo%20no%20grupo%20e%20j%C3%A1%20est%C3%A1%20estruturando%20scripts%20de%20mensagem%20pra%20leads%20(%22Ol%C3%A1%20nome%20do%20lead%2C%20voc%C3%AA%20preencheu%20meu%20formul%C3%A1rio...%22).%20Isso%20mostra%20que%20voc%C3%AA%20j%C3%A1%20est%C3%A1%20pensando%20em%20automa%C3%A7%C3%A3o%20e%20convers%C3%A3o.%0A%0AAqui%20na%20Ensinio%20a%20gente%20oferece%20LMS%2C%20CRM%20e%20Comunidade%20integrados%20%E2%80%94%20tudo%20preparado%20pra%20quem%20quer%20escalar%20com%20processos%20bem%20montados.%20Se%20quiser%20trocar%20uma%20ideia%20sobre%20otimizar%20seu%20funil%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Marcio Araujo",
    "+5511974830404",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Trafego pro F30 (score 9)",
    "Fala Marcio! Tudo bem?\n\nVi que você estava procurando docs sobre VSL pra usar com IA. Achei bacana ver gente já pensando em otimizar processos com automação inteligente.\n\nAqui na Ensinio a gente trabalha com plataformas pra mentoria e infoprodutos — área de membros, checkout e comunidade integrados. Se quiser conversar sobre como estruturar melhor a entrega do seu conteúdo, estou por aqui.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511974830404&text=Fala%20Marcio!%20Tudo%20bem%3F%0A%0AVi%20que%20voc%C3%AA%20estava%20procurando%20docs%20sobre%20VSL%20pra%20usar%20com%20IA.%20Achei%20bacana%20ver%20gente%20j%C3%A1%20pensando%20em%20otimizar%20processos%20com%20automa%C3%A7%C3%A3o%20inteligente.%0A%0AAqui%20na%20Ensinio%20a%20gente%20trabalha%20com%20plataformas%20pra%20mentoria%20e%20infoprodutos%20%E2%80%94%20%C3%A1rea%20de%20membros%2C%20checkout%20e%20comunidade%20integrados.%20Se%20quiser%20conversar%20sobre%20como%20estruturar%20melhor%20a%20entrega%20do%20seu%20conte%C3%BAdo%2C%20estou%20por%20aqui.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Douglas",
    "+5511913176292",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 4",
    "Fala Douglas! Tudo certo?\n\nVi que você trabalha com reversão de crédito imobiliário negado — nicho bem específico e forte! E pelo que percebi, você já está usando IA pra otimizar processos.\n\nAqui na Ensinio a gente ajuda quem trabalha com mentoria/consultoria a ter um checkout robusto e integrado com área de membros. Se quiser conversar sobre como melhorar a conversão e a operação do seu negócio, me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5511913176292&text=Fala%20Douglas!%20Tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20trabalha%20com%20revers%C3%A3o%20de%20cr%C3%A9dito%20imobili%C3%A1rio%20negado%20%E2%80%94%20nicho%20bem%20espec%C3%ADfico%20e%20forte!%20E%20pelo%20que%20percebi%2C%20voc%C3%AA%20j%C3%A1%20est%C3%A1%20usando%20IA%20pra%20otimizar%20processos.%0A%0AAqui%20na%20Ensinio%20a%20gente%20ajuda%20quem%20trabalha%20com%20mentoria%2Fconsultoria%20a%20ter%20um%20checkout%20robusto%20e%20integrado%20com%20%C3%A1rea%20de%20membros.%20Se%20quiser%20conversar%20sobre%20como%20melhorar%20a%20convers%C3%A3o%20e%20a%20opera%C3%A7%C3%A3o%20do%20seu%20neg%C3%B3cio%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Rodrigo Leite",
    "+5524999970490",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 7 (analysis) / prospect 38",
    "Fala Rodrigo! Beleza?\n\nVi que você trabalha com médicos (\"Ajudo médicos que se sentem...\") e já está consumindo bastante conteúdo sobre criativos e tempo ideal de vídeo. Nicho forte!\n\nAqui na Ensinio a gente é especialista em LMS, Checkout e CRM integrados pra quem trabalha com mentorias. Se quiser trocar uma ideia sobre como estruturar melhor a entrega pro seu público de médicos, estou à disposição.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5524999970490&text=Fala%20Rodrigo!%20Beleza%3F%0A%0AVi%20que%20voc%C3%AA%20trabalha%20com%20m%C3%A9dicos%20(%22Ajudo%20m%C3%A9dicos%20que%20se%20sentem...%22)%20e%20j%C3%A1%20est%C3%A1%20consumindo%20bastante%20conte%C3%BAdo%20sobre%20criativos%20e%20tempo%20ideal%20de%20v%C3%ADdeo.%20Nicho%20forte!%0A%0AAqui%20na%20Ensinio%20a%20gente%20%C3%A9%20especialista%20em%20LMS%2C%20Checkout%20e%20CRM%20integrados%20pra%20quem%20trabalha%20com%20mentorias.%20Se%20quiser%20trocar%20uma%20ideia%20sobre%20como%20estruturar%20melhor%20a%20entrega%20pro%20seu%20p%C3%BAblico%20de%20m%C3%A9dicos%2C%20estou%20%C3%A0%20disposi%C3%A7%C3%A3o.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Paty",
    "+5548999939685",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 4",
    "Oi Paty! Tudo bem?\n\nVi que você está ansiosa pra compartilhar ganhos/erros/acertos no grupo e estava com erro de integração. Legal ver essa vontade de evoluir e trocar experiências!\n\nAqui na Ensinio a gente trabalha com LMS e Comunidade integrados — tudo preparado pra quem quer entregar mentoria com qualidade. Se quiser conversar sobre como estruturar melhor seu projeto (online ou presencial), me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5548999939685&text=Oi%20Paty!%20Tudo%20bem%3F%0A%0AVi%20que%20voc%C3%AA%20est%C3%A1%20ansiosa%20pra%20compartilhar%20ganhos%2Ferros%2Facertos%20no%20grupo%20e%20estava%20com%20erro%20de%20integra%C3%A7%C3%A3o.%20Legal%20ver%20essa%20vontade%20de%20evoluir%20e%20trocar%20experi%C3%AAncias!%0A%0AAqui%20na%20Ensinio%20a%20gente%20trabalha%20com%20LMS%20e%20Comunidade%20integrados%20%E2%80%94%20tudo%20preparado%20pra%20quem%20quer%20entregar%20mentoria%20com%20qualidade.%20Se%20quiser%20conversar%20sobre%20como%20estruturar%20melhor%20seu%20projeto%20(online%20ou%20presencial)%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Danielle Santana",
    "+5521997810744",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 4",
    "Oi Danielle! Tudo certo?\n\nVi que você está estruturando um funil completo (anúncio → VSL 6 min → aula gratuita → call). Isso mostra que você já está pensando estrategicamente na jornada do lead!\n\nAqui na Ensinio a gente oferece LMS e CRM integrados — perfeito pra quem quer hospedar aula gravada, landing page e área de membros tudo no mesmo lugar. Se quiser bater um papo sobre otimizar esse fluxo, estou por aqui.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5521997810744&text=Oi%20Danielle!%20Tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20est%C3%A1%20estruturando%20um%20funil%20completo%20(an%C3%BAncio%20%E2%86%92%20VSL%206%20min%20%E2%86%92%20aula%20gratuita%20%E2%86%92%20call).%20Isso%20mostra%20que%20voc%C3%AA%20j%C3%A1%20est%C3%A1%20pensando%20estrategicamente%20na%20jornada%20do%20lead!%0A%0AAqui%20na%20Ensinio%20a%20gente%20oferece%20LMS%20e%20CRM%20integrados%20%E2%80%94%20perfeito%20pra%20quem%20quer%20hospedar%20aula%20gravada%2C%20landing%20page%20e%20%C3%A1rea%20de%20membros%20tudo%20no%20mesmo%20lugar.%20Se%20quiser%20bater%20um%20papo%20sobre%20otimizar%20esse%20fluxo%2C%20estou%20por%20aqui.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Rhina Aquino",
    "+5534999945478",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 7 (analysis) / prospect 41",
    "Oi Rhina! Tudo bem?\n\nVi que você estava olhando taxas e teve aquele perrengue de plataforma não abrindo. Sei como isso atrapalha, ainda mais quando a gente trabalha com presencial também.\n\nAqui na Ensinio a gente oferece checkout com taxas competitivas e integração com área de membros/comunidade. Se quiser conversar sobre como melhorar a operação do seu negócio (online e presencial), me chama!\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5534999945478&text=Oi%20Rhina!%20Tudo%20bem%3F%0A%0AVi%20que%20voc%C3%AA%20estava%20olhando%20taxas%20e%20teve%20aquele%20perrengue%20de%20plataforma%20n%C3%A3o%20abrindo.%20Sei%20como%20isso%20atrapalha%2C%20ainda%20mais%20quando%20a%20gente%20trabalha%20com%20presencial%20tamb%C3%A9m.%0A%0AAqui%20na%20Ensinio%20a%20gente%20oferece%20checkout%20com%20taxas%20competitivas%20e%20integra%C3%A7%C3%A3o%20com%20%C3%A1rea%20de%20membros%2Fcomunidade.%20Se%20quiser%20conversar%20sobre%20como%20melhorar%20a%20opera%C3%A7%C3%A3o%20do%20seu%20neg%C3%B3cio%20(online%20e%20presencial)%2C%20me%20chama!%0A%0AAbra%C3%A7o!"
  ],
  [
    "Emerson - Pérola Tour",
    "+5544999001267",
    "MENTORIA 50K",
    "client",
    "Score 5/10 - Score 4",
    "Fala Emerson! Tudo certo?\n\nVi que você está indo passo a passo e usa PagBank no presencial com taxa boa. \"Rumo ao case de sucesso no grupo!\" — adorei a energia!\n\nAqui na Ensinio a gente trabalha com LMS, Checkout, Comunidade e CRM integrados — tudo preparado pra quem quer estruturar uma operação completa. Se quiser trocar uma ideia sobre como acelerar esse case de sucesso, estou à disposição.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5544999001267&text=Fala%20Emerson!%20Tudo%20certo%3F%0A%0AVi%20que%20voc%C3%AA%20est%C3%A1%20indo%20passo%20a%20passo%20e%20usa%20PagBank%20no%20presencial%20com%20taxa%20boa.%20%22Rumo%20ao%20case%20de%20sucesso%20no%20grupo!%22%20%E2%80%94%20adorei%20a%20energia!%0A%0AAqui%20na%20Ensinio%20a%20gente%20trabalha%20com%20LMS%2C%20Checkout%2C%20Comunidade%20e%20CRM%20integrados%20%E2%80%94%20tudo%20preparado%20pra%20quem%20quer%20estruturar%20uma%20opera%C3%A7%C3%A3o%20completa.%20Se%20quiser%20trocar%20uma%20ideia%20sobre%20como%20acelerar%20esse%20case%20de%20sucesso%2C%20estou%20%C3%A0%20disposi%C3%A7%C3%A3o.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Tati Ambrosio",
    "+5549988457213",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Tati, tudo bem? Aqui é o Antonio, da equipe do Fosc lá da Ensinio.\n\nVi que você tá usando InfinityPay e comentou sobre as taxas do link ficarem altas. A gente construiu a Ensinio justamente pra resolver isso — nossa plataforma já vem com checkout integrado, área de membros e CRM, tudo num lugar só. Quem migra geralmente economiza bastante em taxas e evita dor de cabeça com várias ferramentas.\n\nSe um dia você quiser dar uma olhada em como a gente pode simplificar sua operação, fica o convite. Fosc adora trocar ideia com quem tá fazendo acontecer no digital.\n\nSucesso aí!",
    "https://api.whatsapp.com/send?phone=5549988457213&text=Oi%20Tati%2C%20tudo%20bem%3F%20Aqui%20%C3%A9%20o%20Antonio%2C%20da%20equipe%20do%20Fosc%20l%C3%A1%20da%20Ensinio.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20usando%20InfinityPay%20e%20comentou%20sobre%20as%20taxas%20do%20link%20ficarem%20altas.%20A%20gente%20construiu%20a%20Ensinio%20justamente%20pra%20resolver%20isso%20%E2%80%94%20nossa%20plataforma%20j%C3%A1%20vem%20com%20checkout%20integrado%2C%20%C3%A1rea%20de%20membros%20e%20CRM%2C%20tudo%20num%20lugar%20s%C3%B3.%20Quem%20migra%20geralmente%20economiza%20bastante%20em%20taxas%20e%20evita%20dor%20de%20cabe%C3%A7a%20com%20v%C3%A1rias%20ferramentas.%0A%0ASe%20um%20dia%20voc%C3%AA%20quiser%20dar%20uma%20olhada%20em%20como%20a%20gente%20pode%20simplificar%20sua%20opera%C3%A7%C3%A3o%2C%20fica%20o%20convite.%20Fosc%20adora%20trocar%20ideia%20com%20quem%20t%C3%A1%20fazendo%20acontecer%20no%20digital.%0A%0ASucesso%20a%C3%AD!"
  ],
  [
    "Bruno Darós",
    "+5548996692757",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4 - dobrou ticket mentoria para 9.480",
    "Oi Bruno! Antonio aqui, da Ensinio.\n\nVi que você DOBROU o ticket pra R$9.480 — parabéns, cara! Melhorar pitch e mostrar resultados dos alunos faz toda diferença mesmo.\n\nAgora que você tá escalando, se fizer sentido ter tudo centralizado (área de membros + comunidade + vendas), a Ensinio foi feita pra isso. Vários mentorias high-ticket usam a gente pra não precisar ficar integrando mil ferramentas.\n\nQualquer coisa, estamos por aqui. Sucesso!",
    "https://api.whatsapp.com/send?phone=5548996692757&text=Oi%20Bruno!%20Antonio%20aqui%2C%20da%20Ensinio.%0A%0AVi%20que%20voc%C3%AA%20DOBROU%20o%20ticket%20pra%20R%249.480%20%E2%80%94%20parab%C3%A9ns%2C%20cara!%20Melhorar%20pitch%20e%20mostrar%20resultados%20dos%20alunos%20faz%20toda%20diferen%C3%A7a%20mesmo.%0A%0AAgora%20que%20voc%C3%AA%20t%C3%A1%20escalando%2C%20se%20fizer%20sentido%20ter%20tudo%20centralizado%20(%C3%A1rea%20de%20membros%20%2B%20comunidade%20%2B%20vendas)%2C%20a%20Ensinio%20foi%20feita%20pra%20isso.%20V%C3%A1rios%20mentorias%20high-ticket%20usam%20a%20gente%20pra%20n%C3%A3o%20precisar%20ficar%20integrando%20mil%20ferramentas.%0A%0AQualquer%20coisa%2C%20estamos%20por%20aqui.%20Sucesso!"
  ],
  [
    "Allysson Silveira",
    "+5554996566674",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Allysson, beleza? Antonio da Ensinio aqui.\n\nVi que você já tem SDR, 2k+ contatos no Instagram e tá estruturando o CRM. Quando chegar a hora de integrar tudo isso (LMS + checkout + CRM + comunidade), a Ensinio resolve em uma única plataforma. Facilita muito a vida do time comercial e evita perder lead na integração.\n\nSe quiser bater um papo sobre como a gente pode ajudar na operação, fica o convite. Fosc adora conversar com quem tá escalando de verdade.\n\nSucesso aí!",
    "https://api.whatsapp.com/send?phone=5554996566674&text=Oi%20Allysson%2C%20beleza%3F%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20j%C3%A1%20tem%20SDR%2C%202k%2B%20contatos%20no%20Instagram%20e%20t%C3%A1%20estruturando%20o%20CRM.%20Quando%20chegar%20a%20hora%20de%20integrar%20tudo%20isso%20(LMS%20%2B%20checkout%20%2B%20CRM%20%2B%20comunidade)%2C%20a%20Ensinio%20resolve%20em%20uma%20%C3%BAnica%20plataforma.%20Facilita%20muito%20a%20vida%20do%20time%20comercial%20e%20evita%20perder%20lead%20na%20integra%C3%A7%C3%A3o.%0A%0ASe%20quiser%20bater%20um%20papo%20sobre%20como%20a%20gente%20pode%20ajudar%20na%20opera%C3%A7%C3%A3o%2C%20fica%20o%20convite.%20Fosc%20adora%20conversar%20com%20quem%20t%C3%A1%20escalando%20de%20verdade.%0A%0ASucesso%20a%C3%AD!"
  ],
  [
    "Gustavo Zanardo",
    "+5514996580055",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Gustavo! Antonio aqui, da equipe do Fosc na Ensinio.\n\nParabéns pelas 3 vendas num dia — tá mandando bem! Vi que você recomenda PagarMe/Stone pra galera. A Ensinio já vem com checkout integrado e a gente costuma conseguir condições melhores de taxa quando o volume aumenta.\n\nSe fizer sentido unificar checkout + área de membros + comunidade num lugar só, vale a pena conhecer. Fica o convite pra quando quiser escalar ainda mais.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5514996580055&text=Oi%20Gustavo!%20Antonio%20aqui%2C%20da%20equipe%20do%20Fosc%20na%20Ensinio.%0A%0AParab%C3%A9ns%20pelas%203%20vendas%20num%20dia%20%E2%80%94%20t%C3%A1%20mandando%20bem!%20Vi%20que%20voc%C3%AA%20recomenda%20PagarMe%2FStone%20pra%20galera.%20A%20Ensinio%20j%C3%A1%20vem%20com%20checkout%20integrado%20e%20a%20gente%20costuma%20conseguir%20condi%C3%A7%C3%B5es%20melhores%20de%20taxa%20quando%20o%20volume%20aumenta.%0A%0ASe%20fizer%20sentido%20unificar%20checkout%20%2B%20%C3%A1rea%20de%20membros%20%2B%20comunidade%20num%20lugar%20s%C3%B3%2C%20vale%20a%20pena%20conhecer.%20Fica%20o%20convite%20pra%20quando%20quiser%20escalar%20ainda%20mais.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Eng Bruno Giachini",
    "+5511994999876",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Bruno, tudo bem? Antonio da Ensinio aqui.\n\nVi que você tá dando feedback técnico sobre typebot e gerencia obras pela Liderativa. Se um dia você quiser centralizar comunidade + CRM + área de membros numa plataforma só (sem depender de integrações), a Ensinio foi feita pra isso.\n\nFosc gosta de conversar com quem entende de tech e tá estruturando operação digital. Qualquer coisa, estamos por aqui.\n\nSucesso!",
    "https://api.whatsapp.com/send?phone=5511994999876&text=Oi%20Bruno%2C%20tudo%20bem%3F%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20dando%20feedback%20t%C3%A9cnico%20sobre%20typebot%20e%20gerencia%20obras%20pela%20Liderativa.%20Se%20um%20dia%20voc%C3%AA%20quiser%20centralizar%20comunidade%20%2B%20CRM%20%2B%20%C3%A1rea%20de%20membros%20numa%20plataforma%20s%C3%B3%20(sem%20depender%20de%20integra%C3%A7%C3%B5es)%2C%20a%20Ensinio%20foi%20feita%20pra%20isso.%0A%0AFosc%20gosta%20de%20conversar%20com%20quem%20entende%20de%20tech%20e%20t%C3%A1%20estruturando%20opera%C3%A7%C3%A3o%20digital.%20Qualquer%20coisa%2C%20estamos%20por%20aqui.%0A%0ASucesso!"
  ],
  [
    "Pedro Braz",
    "+5518988180711",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4 - Pedro Braz (maconico)",
    "Oi Pedro! Antonio aqui, da Ensinio (pode botar a culpa no Fosc dessa mensagem 😅).\n\nVi que você tá pedindo exemplos de conteúdo e estruturando tudo. Quando chegar a hora de colocar sua mentoria no ar, a Ensinio já vem com LMS + checkout + área de membros integrados. Facilita muito pra quem quer focar no conteúdo e não em ficar integrando ferramenta.\n\nSe quiser trocar ideia sobre como a gente pode ajudar, fica o convite. Sucesso aí!",
    "https://api.whatsapp.com/send?phone=5518988180711&text=Oi%20Pedro!%20Antonio%20aqui%2C%20da%20Ensinio%20(pode%20botar%20a%20culpa%20no%20Fosc%20dessa%20mensagem%20%F0%9F%98%85).%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20pedindo%20exemplos%20de%20conte%C3%BAdo%20e%20estruturando%20tudo.%20Quando%20chegar%20a%20hora%20de%20colocar%20sua%20mentoria%20no%20ar%2C%20a%20Ensinio%20j%C3%A1%20vem%20com%20LMS%20%2B%20checkout%20%2B%20%C3%A1rea%20de%20membros%20integrados.%20Facilita%20muito%20pra%20quem%20quer%20focar%20no%20conte%C3%BAdo%20e%20n%C3%A3o%20em%20ficar%20integrando%20ferramenta.%0A%0ASe%20quiser%20trocar%20ideia%20sobre%20como%20a%20gente%20pode%20ajudar%2C%20fica%20o%20convite.%20Sucesso%20a%C3%AD!"
  ],
  [
    "Dr Vinicius Soares",
    "+5511974830404",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Trafego pro F30 (score 9)",
    "Oi Dr. Vinicius, tudo bem? Antonio da Ensinio aqui.\n\nVi que você tá com 6 agendamentos mas taxa de no-show alta. A gente tem automações de CRM + lembretes integrados que ajudam bastante nisso. Vários closers conseguem reduzir falta usando a plataforma da Ensinio pra gestão de leads.\n\nSe fizer sentido melhorar essa taxa de comparecimento, vale a pena conhecer. Qualquer coisa, estamos por aqui. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511974830404&text=Oi%20Dr.%20Vinicius%2C%20tudo%20bem%3F%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20com%206%20agendamentos%20mas%20taxa%20de%20no-show%20alta.%20A%20gente%20tem%20automa%C3%A7%C3%B5es%20de%20CRM%20%2B%20lembretes%20integrados%20que%20ajudam%20bastante%20nisso.%20V%C3%A1rios%20closers%20conseguem%20reduzir%20falta%20usando%20a%20plataforma%20da%20Ensinio%20pra%20gest%C3%A3o%20de%20leads.%0A%0ASe%20fizer%20sentido%20melhorar%20essa%20taxa%20de%20comparecimento%2C%20vale%20a%20pena%20conhecer.%20Qualquer%20coisa%2C%20estamos%20por%20aqui.%20Sucesso!"
  ],
  [
    "Marcelo Fernandes",
    "+5573998382121",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Marcelo! Antonio da Ensinio aqui.\n\nVi que você manja de Typebot e ajuda a galera com soluções gratuitas — top demais! Quando você quiser escalar e centralizar tudo (CRM + LMS + checkout), a Ensinio resolve isso numa plataforma só.\n\nSe fizer sentido ter uma conversa sobre como profissionalizar a operação, fica o convite. Fosc adora trocar ideia com quem entende de automação.\n\nAbraço!",
    "https://api.whatsapp.com/send?phone=5573998382121&text=Oi%20Marcelo!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20manja%20de%20Typebot%20e%20ajuda%20a%20galera%20com%20solu%C3%A7%C3%B5es%20gratuitas%20%E2%80%94%20top%20demais!%20Quando%20voc%C3%AA%20quiser%20escalar%20e%20centralizar%20tudo%20(CRM%20%2B%20LMS%20%2B%20checkout)%2C%20a%20Ensinio%20resolve%20isso%20numa%20plataforma%20s%C3%B3.%0A%0ASe%20fizer%20sentido%20ter%20uma%20conversa%20sobre%20como%20profissionalizar%20a%20opera%C3%A7%C3%A3o%2C%20fica%20o%20convite.%20Fosc%20adora%20trocar%20ideia%20com%20quem%20entende%20de%20automa%C3%A7%C3%A3o.%0A%0AAbra%C3%A7o!"
  ],
  [
    "Eng Elicarlo Saboia",
    "+5569992663632",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Elicarlo, beleza? Antonio da Ensinio aqui.\n\nVi que você tá regravando criativos mais nichados e procurando robô do script na área de membros. A Ensinio já vem com área de membros + CRM + automações integradas — facilita muito pra quem quer organizar conteúdo e leads num lugar só.\n\nSe quiser conhecer como a gente pode simplificar sua operação, fica o convite. Sucesso aí!",
    "https://api.whatsapp.com/send?phone=5569992663632&text=Oi%20Elicarlo%2C%20beleza%3F%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20regravando%20criativos%20mais%20nichados%20e%20procurando%20rob%C3%B4%20do%20script%20na%20%C3%A1rea%20de%20membros.%20A%20Ensinio%20j%C3%A1%20vem%20com%20%C3%A1rea%20de%20membros%20%2B%20CRM%20%2B%20automa%C3%A7%C3%B5es%20integradas%20%E2%80%94%20facilita%20muito%20pra%20quem%20quer%20organizar%20conte%C3%BAdo%20e%20leads%20num%20lugar%20s%C3%B3.%0A%0ASe%20quiser%20conhecer%20como%20a%20gente%20pode%20simplificar%20sua%20opera%C3%A7%C3%A3o%2C%20fica%20o%20convite.%20Sucesso%20a%C3%AD!"
  ],
  [
    "Jane Florenzano",
    "+5531998216661",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Jane! Antonio aqui, da Ensinio.\n\nVi que você tá começando a receber leads e preocupada com custo. A Ensinio unifica LMS + checkout + CRM numa plataforma só, o que geralmente sai mais em conta do que pagar várias ferramentas separadas. Fora que facilita muito na hora de escalar.\n\nSe fizer sentido dar uma olhada, fica o convite pra bater um papo. Qualquer coisa, estamos por aqui. Sucesso!",
    "https://api.whatsapp.com/send?phone=5531998216661&text=Oi%20Jane!%20Antonio%20aqui%2C%20da%20Ensinio.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20come%C3%A7ando%20a%20receber%20leads%20e%20preocupada%20com%20custo.%20A%20Ensinio%20unifica%20LMS%20%2B%20checkout%20%2B%20CRM%20numa%20plataforma%20s%C3%B3%2C%20o%20que%20geralmente%20sai%20mais%20em%20conta%20do%20que%20pagar%20v%C3%A1rias%20ferramentas%20separadas.%20Fora%20que%20facilita%20muito%20na%20hora%20de%20escalar.%0A%0ASe%20fizer%20sentido%20dar%20uma%20olhada%2C%20fica%20o%20convite%20pra%20bater%20um%20papo.%20Qualquer%20coisa%2C%20estamos%20por%20aqui.%20Sucesso!"
  ],
  [
    "Fellipe Spoglianti",
    "+5519990198253",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Fellipe, tudo bem? Antonio da Ensinio aqui.\n\nVi que você tá com leads clicando mas não preenchendo formulário (problema clássico de typebot). A Ensinio já vem com landing pages + formulários + CRM integrados, o que resolve esse tipo de atrito. Vale a pena testar quando você for rodar a próxima campanha.\n\nSe quiser trocar ideia sobre como melhorar conversão, fica o convite. Sucesso aí!",
    "https://api.whatsapp.com/send?phone=5519990198253&text=Oi%20Fellipe%2C%20tudo%20bem%3F%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20com%20leads%20clicando%20mas%20n%C3%A3o%20preenchendo%20formul%C3%A1rio%20(problema%20cl%C3%A1ssico%20de%20typebot).%20A%20Ensinio%20j%C3%A1%20vem%20com%20landing%20pages%20%2B%20formul%C3%A1rios%20%2B%20CRM%20integrados%2C%20o%20que%20resolve%20esse%20tipo%20de%20atrito.%20Vale%20a%20pena%20testar%20quando%20voc%C3%AA%20for%20rodar%20a%20pr%C3%B3xima%20campanha.%0A%0ASe%20quiser%20trocar%20ideia%20sobre%20como%20melhorar%20convers%C3%A3o%2C%20fica%20o%20convite.%20Sucesso%20a%C3%AD!"
  ],
  [
    "Claiton Oliveira",
    "+5548991846222",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Claiton! Antonio da Ensinio aqui.\n\nVi que você tá pronto pra dar continuidade — boa! Se você precisa de LMS + CRM + área de membros pra colocar sua mentoria no ar, a Ensinio resolve tudo isso numa plataforma só. Facilita muito pra quem quer focar em vender e entregar conteúdo.\n\nSe fizer sentido conhecer, fica o convite. Fosc adora conversar com quem tá disposto a fazer acontecer. Sucesso!",
    "https://api.whatsapp.com/send?phone=5548991846222&text=Oi%20Claiton!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20pronto%20pra%20dar%20continuidade%20%E2%80%94%20boa!%20Se%20voc%C3%AA%20precisa%20de%20LMS%20%2B%20CRM%20%2B%20%C3%A1rea%20de%20membros%20pra%20colocar%20sua%20mentoria%20no%20ar%2C%20a%20Ensinio%20resolve%20tudo%20isso%20numa%20plataforma%20s%C3%B3.%20Facilita%20muito%20pra%20quem%20quer%20focar%20em%20vender%20e%20entregar%20conte%C3%BAdo.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Fosc%20adora%20conversar%20com%20quem%20t%C3%A1%20disposto%20a%20fazer%20acontecer.%20Sucesso!"
  ],
  [
    "Vinní Marçal",
    "+5513991313632",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Vinní! Antonio da Ensinio aqui.\n\nParabéns pelas 2 vendas de 9k com R$800 em tráfego — resultado show! Vi que você ainda não automatizou agendamentos. A Ensinio já vem com CRM + automações + Calendly integrado, facilita muito pra escalar esse processo.\n\nSe fizer sentido unificar tudo numa plataforma só, vale a pena conhecer. Qualquer coisa, estamos por aqui. Sucesso!",
    "https://api.whatsapp.com/send?phone=5513991313632&text=Oi%20Vinn%C3%AD!%20Antonio%20da%20Ensinio%20aqui.%0A%0AParab%C3%A9ns%20pelas%202%20vendas%20de%209k%20com%20R%24800%20em%20tr%C3%A1fego%20%E2%80%94%20resultado%20show!%20Vi%20que%20voc%C3%AA%20ainda%20n%C3%A3o%20automatizou%20agendamentos.%20A%20Ensinio%20j%C3%A1%20vem%20com%20CRM%20%2B%20automa%C3%A7%C3%B5es%20%2B%20Calendly%20integrado%2C%20facilita%20muito%20pra%20escalar%20esse%20processo.%0A%0ASe%20fizer%20sentido%20unificar%20tudo%20numa%20plataforma%20s%C3%B3%2C%20vale%20a%20pena%20conhecer.%20Qualquer%20coisa%2C%20estamos%20por%20aqui.%20Sucesso!"
  ],
  [
    "Rafael Costa",
    "+5531983329889",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Rafael! Antonio da Ensinio aqui.\n\nVi que você manja muito de gateways e cursos presenciais. A Ensinio já vem com checkout integrado (a gente negocia taxas competitivas quando o volume aumenta) + LMS + área de membros. Facilita bastante pra quem quer profissionalizar a operação.\n\nSe quiser trocar ideia sobre como a gente pode ajudar, fica o convite. Fosc adora conversar com quem entende do mercado. Abraço!",
    "https://api.whatsapp.com/send?phone=5531983329889&text=Oi%20Rafael!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20manja%20muito%20de%20gateways%20e%20cursos%20presenciais.%20A%20Ensinio%20j%C3%A1%20vem%20com%20checkout%20integrado%20(a%20gente%20negocia%20taxas%20competitivas%20quando%20o%20volume%20aumenta)%20%2B%20LMS%20%2B%20%C3%A1rea%20de%20membros.%20Facilita%20bastante%20pra%20quem%20quer%20profissionalizar%20a%20opera%C3%A7%C3%A3o.%0A%0ASe%20quiser%20trocar%20ideia%20sobre%20como%20a%20gente%20pode%20ajudar%2C%20fica%20o%20convite.%20Fosc%20adora%20conversar%20com%20quem%20entende%20do%20mercado.%20Abra%C3%A7o!"
  ],
  [
    "Alysson Campos",
    "+5531991964216",
    "MENTORIA 50K",
    "educational",
    "Score 4/10 - Score 4",
    "Oi Alysson, beleza? Antonio da Ensinio aqui.\n\nVi que você chegou recente e tá perdido em qual funil começar. Quando você estiver pronto pra estruturar, a Ensinio já vem com LMS + comunidade + CRM + checkout integrados. Facilita muito pra quem tá começando e não quer perder tempo integrando mil ferramentas.\n\nSe fizer sentido trocar uma ideia, fica o convite. Sucesso aí!",
    "https://api.whatsapp.com/send?phone=5531991964216&text=Oi%20Alysson%2C%20beleza%3F%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20chegou%20recente%20e%20t%C3%A1%20perdido%20em%20qual%20funil%20come%C3%A7ar.%20Quando%20voc%C3%AA%20estiver%20pronto%20pra%20estruturar%2C%20a%20Ensinio%20j%C3%A1%20vem%20com%20LMS%20%2B%20comunidade%20%2B%20CRM%20%2B%20checkout%20integrados.%20Facilita%20muito%20pra%20quem%20t%C3%A1%20come%C3%A7ando%20e%20n%C3%A3o%20quer%20perder%20tempo%20integrando%20mil%20ferramentas.%0A%0ASe%20fizer%20sentido%20trocar%20uma%20ideia%2C%20fica%20o%20convite.%20Sucesso%20a%C3%AD!"
  ],
  [
    "Luis Carlos Voltolini",
    "+5511984453853",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 4",
    "Oi Luis Carlos! Antonio da Ensinio aqui.\n\nVi que você tá acompanhando as aulas do grupo. Quando você decidir lançar sua própria mentoria, a Ensinio é uma plataforma completa (LMS + checkout + área de membros) pra quem quer focar no conteúdo e não em tech.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511984453853&text=Oi%20Luis%20Carlos!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20acompanhando%20as%20aulas%20do%20grupo.%20Quando%20voc%C3%AA%20decidir%20lan%C3%A7ar%20sua%20pr%C3%B3pria%20mentoria%2C%20a%20Ensinio%20%C3%A9%20uma%20plataforma%20completa%20(LMS%20%2B%20checkout%20%2B%20%C3%A1rea%20de%20membros)%20pra%20quem%20quer%20focar%20no%20conte%C3%BAdo%20e%20n%C3%A3o%20em%20tech.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Get and Go",
    "+5519991840739",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3 - busca closer",
    "Oi! Antonio da Ensinio aqui.\n\nVi que você tá procurando closer e discutindo comissões. Quando você estruturar a operação comercial, a Ensinio tem CRM + área de membros + comunidade integrados. Facilita muito pra gerenciar equipe de vendas e entregar resultado.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5519991840739&text=Oi!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20procurando%20closer%20e%20discutindo%20comiss%C3%B5es.%20Quando%20voc%C3%AA%20estruturar%20a%20opera%C3%A7%C3%A3o%20comercial%2C%20a%20Ensinio%20tem%20CRM%20%2B%20%C3%A1rea%20de%20membros%20%2B%20comunidade%20integrados.%20Facilita%20muito%20pra%20gerenciar%20equipe%20de%20vendas%20e%20entregar%20resultado.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Kate - Marketing e Vendas",
    "+5511984318184",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Kate! Antonio da Ensinio aqui.\n\nVi que você conhece expert que bateu 50k em 4 meses e tá procurando protocolo de follow up. A Ensinio já vem com CRM + automações + área de membros integrados. Facilita muito pra quem quer escalar vendas consultivas.\n\nSe fizer sentido trocar ideia, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511984318184&text=Oi%20Kate!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20conhece%20expert%20que%20bateu%2050k%20em%204%20meses%20e%20t%C3%A1%20procurando%20protocolo%20de%20follow%20up.%20A%20Ensinio%20j%C3%A1%20vem%20com%20CRM%20%2B%20automa%C3%A7%C3%B5es%20%2B%20%C3%A1rea%20de%20membros%20integrados.%20Facilita%20muito%20pra%20quem%20quer%20escalar%20vendas%20consultivas.%0A%0ASe%20fizer%20sentido%20trocar%20ideia%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Andrew Diniz",
    "+5514998400011",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Andrew! Antonio da Ensinio aqui.\n\nVi que você tá perguntando sobre boleto pra clientes sem limite no cartão. A Ensinio já vem com checkout integrado que aceita boleto + cartão + PIX, facilitando pra quem tem ticket alto e precisa flexibilidade de pagamento.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5514998400011&text=Oi%20Andrew!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20perguntando%20sobre%20boleto%20pra%20clientes%20sem%20limite%20no%20cart%C3%A3o.%20A%20Ensinio%20j%C3%A1%20vem%20com%20checkout%20integrado%20que%20aceita%20boleto%20%2B%20cart%C3%A3o%20%2B%20PIX%2C%20facilitando%20pra%20quem%20tem%20ticket%20alto%20e%20precisa%20flexibilidade%20de%20pagamento.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Lilia Silva",
    "+5533984047793",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3 - advocacia + mentoria, usa Asaas",
    "Oi Dra. Lilia! Antonio da Ensinio aqui.\n\nVi que você é advogada e usa Asaas no escritório + tá começando projeto de mentoria. A Ensinio é plataforma completa (checkout + LMS + área de membros) usada por vários advogados que digitalizaram serviços. Facilita muito a operação.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5533984047793&text=Oi%20Dra.%20Lilia!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20%C3%A9%20advogada%20e%20usa%20Asaas%20no%20escrit%C3%B3rio%20%2B%20t%C3%A1%20come%C3%A7ando%20projeto%20de%20mentoria.%20A%20Ensinio%20%C3%A9%20plataforma%20completa%20(checkout%20%2B%20LMS%20%2B%20%C3%A1rea%20de%20membros)%20usada%20por%20v%C3%A1rios%20advogados%20que%20digitalizaram%20servi%C3%A7os.%20Facilita%20muito%20a%20opera%C3%A7%C3%A3o.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Hannah",
    "+5568992449393",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Hannah! Antonio da Ensinio aqui.\n\nParabéns pela primeira venda real de 5k à vista — resultado show! Agora que você validou o script, se fizer sentido ter checkout + área de membros + comunidade integrados pra escalar, a Ensinio resolve tudo isso.\n\nFica o convite pra quando você quiser estruturar ainda mais. Sucesso!",
    "https://api.whatsapp.com/send?phone=5568992449393&text=Oi%20Hannah!%20Antonio%20da%20Ensinio%20aqui.%0A%0AParab%C3%A9ns%20pela%20primeira%20venda%20real%20de%205k%20%C3%A0%20vista%20%E2%80%94%20resultado%20show!%20Agora%20que%20voc%C3%AA%20validou%20o%20script%2C%20se%20fizer%20sentido%20ter%20checkout%20%2B%20%C3%A1rea%20de%20membros%20%2B%20comunidade%20integrados%20pra%20escalar%2C%20a%20Ensinio%20resolve%20tudo%20isso.%0A%0AFica%20o%20convite%20pra%20quando%20voc%C3%AA%20quiser%20estruturar%20ainda%20mais.%20Sucesso!"
  ],
  [
    "Vanessa Pelegrine",
    "+5511991438488",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Vanessa! Antonio da Ensinio aqui.\n\nVi que você tá procurando aula sobre formulário e área de membros. A Ensinio já vem com tudo isso integrado (formulários + checkout + LMS + comunidade). Facilita muito pra quem quer simplificar a operação.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511991438488&text=Oi%20Vanessa!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20procurando%20aula%20sobre%20formul%C3%A1rio%20e%20%C3%A1rea%20de%20membros.%20A%20Ensinio%20j%C3%A1%20vem%20com%20tudo%20isso%20integrado%20(formul%C3%A1rios%20%2B%20checkout%20%2B%20LMS%20%2B%20comunidade).%20Facilita%20muito%20pra%20quem%20quer%20simplificar%20a%20opera%C3%A7%C3%A3o.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Patrícia de Pieri",
    "+5511974830404",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Trafego pro F30 (score 9)",
    "Oi Patrícia! Antonio da Ensinio aqui.\n\nVi que sua primeira campanha tá rodando e leads começando a chegar — boa! A Ensinio já vem com CRM + automações integradas pra você saber exatamente que mensagem enviar em cada etapa do funil.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511974830404&text=Oi%20Patr%C3%ADcia!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20sua%20primeira%20campanha%20t%C3%A1%20rodando%20e%20leads%20come%C3%A7ando%20a%20chegar%20%E2%80%94%20boa!%20A%20Ensinio%20j%C3%A1%20vem%20com%20CRM%20%2B%20automa%C3%A7%C3%B5es%20integradas%20pra%20voc%C3%AA%20saber%20exatamente%20que%20mensagem%20enviar%20em%20cada%20etapa%20do%20funil.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Amilson Martin",
    "+5566996776977",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3 - duvidas com plataforma/typebot",
    "Oi Amilson! Antonio da Ensinio aqui.\n\nVi que você tá com dificuldade pra achar vídeos e abrir arquivos do Typebot. A Ensinio é plataforma all-in-one (LMS + área de membros) bem intuitiva, feita pra quem quer facilidade de uso sem precisar ser técnico.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5566996776977&text=Oi%20Amilson!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20com%20dificuldade%20pra%20achar%20v%C3%ADdeos%20e%20abrir%20arquivos%20do%20Typebot.%20A%20Ensinio%20%C3%A9%20plataforma%20all-in-one%20(LMS%20%2B%20%C3%A1rea%20de%20membros)%20bem%20intuitiva%2C%20feita%20pra%20quem%20quer%20facilidade%20de%20uso%20sem%20precisar%20ser%20t%C3%A9cnico.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Psicóloga Eduarda Khoury",
    "+5533991046807",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Dra. Eduarda! Antonio da Ensinio aqui.\n\nVi que você tá perguntando se implementação vale mais que mentoria. A Ensinio é plataforma completa (LMS + CRM + checkout) bem fácil de implementar — vários psicólogos usam pra digitalizar atendimentos e mentorias.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5533991046807&text=Oi%20Dra.%20Eduarda!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20perguntando%20se%20implementa%C3%A7%C3%A3o%20vale%20mais%20que%20mentoria.%20A%20Ensinio%20%C3%A9%20plataforma%20completa%20(LMS%20%2B%20CRM%20%2B%20checkout)%20bem%20f%C3%A1cil%20de%20implementar%20%E2%80%94%20v%C3%A1rios%20psic%C3%B3logos%20usam%20pra%20digitalizar%20atendimentos%20e%20mentorias.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Dra Aline Polimeni",
    "+5519996690570",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Dra. Aline! Antonio da Ensinio aqui.\n\nVi que você é advogada e orienta sobre contratos com cláusula de desistência. A Ensinio tem checkout integrado que facilita gestão de contratos digitais + área de membros. Vários advogados usam pra digitalizar serviços.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5519996690570&text=Oi%20Dra.%20Aline!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20%C3%A9%20advogada%20e%20orienta%20sobre%20contratos%20com%20cl%C3%A1usula%20de%20desist%C3%AAncia.%20A%20Ensinio%20tem%20checkout%20integrado%20que%20facilita%20gest%C3%A3o%20de%20contratos%20digitais%20%2B%20%C3%A1rea%20de%20membros.%20V%C3%A1rios%20advogados%20usam%20pra%20digitalizar%20servi%C3%A7os.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Tiago Avila",
    "+5568999203739",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 5",
    "Oi Tiago! Antonio da Ensinio aqui.\n\nParabéns pela 3a mentoria vendida e 3 fechamentos em 5 reuniões — resultado show! Agora que você tá escalando, se fizer sentido ter comunidade + área de membros + checkout integrados, a Ensinio resolve tudo isso.\n\nFica o convite pra quando você quiser estruturar ainda mais. Sucesso!",
    "https://api.whatsapp.com/send?phone=5568999203739&text=Oi%20Tiago!%20Antonio%20da%20Ensinio%20aqui.%0A%0AParab%C3%A9ns%20pela%203a%20mentoria%20vendida%20e%203%20fechamentos%20em%205%20reuni%C3%B5es%20%E2%80%94%20resultado%20show!%20Agora%20que%20voc%C3%AA%20t%C3%A1%20escalando%2C%20se%20fizer%20sentido%20ter%20comunidade%20%2B%20%C3%A1rea%20de%20membros%20%2B%20checkout%20integrados%2C%20a%20Ensinio%20resolve%20tudo%20isso.%0A%0AFica%20o%20convite%20pra%20quando%20voc%C3%AA%20quiser%20estruturar%20ainda%20mais.%20Sucesso!"
  ],
  [
    "Gustavo Ribeiro",
    "+5511964324868",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Gustavo! Antonio da Ensinio aqui.\n\nVi que você já tem depoimento pra VSL e tá estruturando copys. Quando for lançar, a Ensinio já vem com landing pages + checkout + área de membros integrados. Facilita muito pra quem quer focar em vender e entregar conteúdo.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511964324868&text=Oi%20Gustavo!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20j%C3%A1%20tem%20depoimento%20pra%20VSL%20e%20t%C3%A1%20estruturando%20copys.%20Quando%20for%20lan%C3%A7ar%2C%20a%20Ensinio%20j%C3%A1%20vem%20com%20landing%20pages%20%2B%20checkout%20%2B%20%C3%A1rea%20de%20membros%20integrados.%20Facilita%20muito%20pra%20quem%20quer%20focar%20em%20vender%20e%20entregar%20conte%C3%BAdo.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Fernanda",
    "+5547984312323",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Fernanda! Antonio da Ensinio aqui.\n\nVi que você trabalha com semijoias e já tem 10 criativos prontos. A Ensinio tem LMS + CRM + checkout integrados — facilita muito pra quem quer digitalizar conhecimento e vender mentorias no nicho de produtos físicos.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5547984312323&text=Oi%20Fernanda!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20trabalha%20com%20semijoias%20e%20j%C3%A1%20tem%2010%20criativos%20prontos.%20A%20Ensinio%20tem%20LMS%20%2B%20CRM%20%2B%20checkout%20integrados%20%E2%80%94%20facilita%20muito%20pra%20quem%20quer%20digitalizar%20conhecimento%20e%20vender%20mentorias%20no%20nicho%20de%20produtos%20f%C3%ADsicos.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Marcio",
    "+5511974830404",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Trafego pro F30 (score 9)",
    "Oi Marcio! Antonio da Ensinio aqui.\n\nVi que você tá bem engajado dando feedback técnico pra galera. Quando você decidir lançar sua própria mentoria, a Ensinio é plataforma completa (LMS + checkout + comunidade) pra quem quer profissionalizar a operação.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511974830404&text=Oi%20Marcio!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20t%C3%A1%20bem%20engajado%20dando%20feedback%20t%C3%A9cnico%20pra%20galera.%20Quando%20voc%C3%AA%20decidir%20lan%C3%A7ar%20sua%20pr%C3%B3pria%20mentoria%2C%20a%20Ensinio%20%C3%A9%20plataforma%20completa%20(LMS%20%2B%20checkout%20%2B%20comunidade)%20pra%20quem%20quer%20profissionalizar%20a%20opera%C3%A7%C3%A3o.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Thais Gatti",
    "+5511992661404",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Thais! Antonio da Ensinio aqui.\n\nParabéns pela consultoria de 66K — resultado absurdo! Vi que você tá estruturando mentoria sobre prevenção de assédio no trabalho (formação corporativa). A Ensinio é plataforma completa (LMS + checkout + área de membros) ideal pra treinamentos corporativos high-ticket.\n\nSe fizer sentido conhecer, fica o convite. Fosc adora conversar com quem tá escalando sério. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511992661404&text=Oi%20Thais!%20Antonio%20da%20Ensinio%20aqui.%0A%0AParab%C3%A9ns%20pela%20consultoria%20de%2066K%20%E2%80%94%20resultado%20absurdo!%20Vi%20que%20voc%C3%AA%20t%C3%A1%20estruturando%20mentoria%20sobre%20preven%C3%A7%C3%A3o%20de%20ass%C3%A9dio%20no%20trabalho%20(forma%C3%A7%C3%A3o%20corporativa).%20A%20Ensinio%20%C3%A9%20plataforma%20completa%20(LMS%20%2B%20checkout%20%2B%20%C3%A1rea%20de%20membros)%20ideal%20pra%20treinamentos%20corporativos%20high-ticket.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Fosc%20adora%20conversar%20com%20quem%20t%C3%A1%20escalando%20s%C3%A9rio.%20Sucesso!"
  ],
  [
    "Daniel",
    "+5521997810744",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 4",
    "Oi Daniel! Antonio da Ensinio aqui.\n\nParabéns pela primeira reunião marcada sem tráfego — validação orgânica é ouro! Vi que você usa Greenn. A Ensinio já vem com checkout integrado + área de membros, facilitando pra quando você escalar.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5521997810744&text=Oi%20Daniel!%20Antonio%20da%20Ensinio%20aqui.%0A%0AParab%C3%A9ns%20pela%20primeira%20reuni%C3%A3o%20marcada%20sem%20tr%C3%A1fego%20%E2%80%94%20valida%C3%A7%C3%A3o%20org%C3%A2nica%20%C3%A9%20ouro!%20Vi%20que%20voc%C3%AA%20usa%20Greenn.%20A%20Ensinio%20j%C3%A1%20vem%20com%20checkout%20integrado%20%2B%20%C3%A1rea%20de%20membros%2C%20facilitando%20pra%20quando%20voc%C3%AA%20escalar.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Drmariononato",
    "+5519999203840",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3 - Dr. Mario Nonato",
    "Oi Dr(a)! Antonio da Ensinio aqui.\n\nVi que você é médico(a) e tá começando no grupo. Vários médicos usam a Ensinio pra digitalizar conhecimento (LMS + checkout + área de membros integrados). Facilita muito pra quem quer profissionalizar a operação.\n\nSe fizer sentido conhecer, fica o convite. Sucesso!",
    "https://api.whatsapp.com/send?phone=5519999203840&text=Oi%20Dr(a)!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20%C3%A9%20m%C3%A9dico(a)%20e%20t%C3%A1%20come%C3%A7ando%20no%20grupo.%20V%C3%A1rios%20m%C3%A9dicos%20usam%20a%20Ensinio%20pra%20digitalizar%20conhecimento%20(LMS%20%2B%20checkout%20%2B%20%C3%A1rea%20de%20membros%20integrados).%20Facilita%20muito%20pra%20quem%20quer%20profissionalizar%20a%20opera%C3%A7%C3%A3o.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Sucesso!"
  ],
  [
    "Renata Arouca",
    "+5571996257282",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Renata! Antonio da Ensinio aqui.\n\nParabéns pela venda de 6k no primeiro dia com consultoria NR01 — resultado show! Engenharia de segurança é nicho forte. Se fizer sentido ter checkout + área de membros + comunidade integrados pra escalar, a Ensinio resolve tudo isso.\n\nFica o convite pra quando você quiser estruturar ainda mais. Sucesso!",
    "https://api.whatsapp.com/send?phone=5571996257282&text=Oi%20Renata!%20Antonio%20da%20Ensinio%20aqui.%0A%0AParab%C3%A9ns%20pela%20venda%20de%206k%20no%20primeiro%20dia%20com%20consultoria%20NR01%20%E2%80%94%20resultado%20show!%20Engenharia%20de%20seguran%C3%A7a%20%C3%A9%20nicho%20forte.%20Se%20fizer%20sentido%20ter%20checkout%20%2B%20%C3%A1rea%20de%20membros%20%2B%20comunidade%20integrados%20pra%20escalar%2C%20a%20Ensinio%20resolve%20tudo%20isso.%0A%0AFica%20o%20convite%20pra%20quando%20voc%C3%AA%20quiser%20estruturar%20ainda%20mais.%20Sucesso!"
  ],
  [
    "Thiago Burgers",
    "+5511991179203",
    "MENTORIA 50K",
    "educational",
    "Score 3/10 - Score 3",
    "Oi Thiago! Antonio da Ensinio aqui.\n\nVi que você perguntou sobre plataforma pra link de 12x com ticket de 30k. A Ensinio já vem com checkout integrado que aguenta tickets altos sem travar + área de membros. A gente negocia condições de taxa quando o volume aumenta.\n\nSe fizer sentido conhecer, fica o convite. Fosc adora conversar sobre operações high-ticket. Sucesso!",
    "https://api.whatsapp.com/send?phone=5511991179203&text=Oi%20Thiago!%20Antonio%20da%20Ensinio%20aqui.%0A%0AVi%20que%20voc%C3%AA%20perguntou%20sobre%20plataforma%20pra%20link%20de%2012x%20com%20ticket%20de%2030k.%20A%20Ensinio%20j%C3%A1%20vem%20com%20checkout%20integrado%20que%20aguenta%20tickets%20altos%20sem%20travar%20%2B%20%C3%A1rea%20de%20membros.%20A%20gente%20negocia%20condi%C3%A7%C3%B5es%20de%20taxa%20quando%20o%20volume%20aumenta.%0A%0ASe%20fizer%20sentido%20conhecer%2C%20fica%20o%20convite.%20Fosc%20adora%20conversar%20sobre%20opera%C3%A7%C3%B5es%20high-ticket.%20Sucesso!"
  ]
];

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 7).setValues(data);
  }

  // Format
  sheet.setColumnWidth(1, 180);  // Nome
  sheet.setColumnWidth(2, 160);  // Telefone
  sheet.setColumnWidth(3, 150);  // Grupo
  sheet.setColumnWidth(4, 120);  // Nicho
  sheet.setColumnWidth(5, 250);  // Descricao
  sheet.setColumnWidth(6, 400);  // Mensagem
  sheet.setColumnWidth(7, 200);  // Link

  // Wrap text in message column
  sheet.getRange(2, 6, data.length, 1).setWrap(true);

  // Auto-resize rows
  for (var i = 2; i <= data.length + 1; i++) {
    sheet.setRowHeight(i, 80);
  }

  // Freeze header
  sheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert(data.length + ' prospects inseridos com sucesso!');
}
