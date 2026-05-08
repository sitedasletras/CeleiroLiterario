export function normalizarTexto(valor = '') {
  return String(valor || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function limparCamposVaziosOHE(valor = '') {
  return normalizarTexto(valor)
    .replace(/^\s*Base recebida:\s*$/gim, '')
    .replace(/^\s*Pessoa:\s*$/gim, '')
    .replace(/^\s*Data:\s*$/gim, '')
    .replace(/^\s*Sensorial:\s*$/gim, '')
    .replace(/^\s*Objeto:\s*$/gim, '')
    .replace(/^\s*Mem[oó]ria:\s*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function detectarForma({ tipo = 'prosa', dados = '', forma = '' }) {
  const t = `${forma} ${tipo} ${dados}`.toLowerCase();
  if (t.includes('sestina medieval') || t.includes('sestina do século xii') || t.includes('sestina do seculo xii')) return 'sestina_medieval';
  if (t.includes('sextilha clássica') || t.includes('sextilha classica') || t.includes('sextilha literária antiga') || t.includes('sextilha literaria antiga')) return 'sextilha_classica';
  if (t.includes('sextilha de cordel') || t.includes('cordel') || t.includes('sextilha popular')) return 'sextilha_cordel';
  if (t.includes('novo movimento estrofista') || t.includes('estrofista') || t.includes('1-2-3-4-3-2-1')) return 'novo_estrofista';
  if (t.includes('haikai') || t.includes('haicai')) return 'haikai';
  if (t.includes('tanka')) return 'tanka';
  if (t.includes('senryu')) return 'senryu';
  if (t.includes('choka') || t.includes('chōka')) return 'choka';
  if (t.includes('soneto shakespeariano')) return 'soneto_shakespeariano';
  if (t.includes('soneto italiano')) return 'soneto_italiano';
  if (t.includes('soneto')) return 'soneto';
  if (t.includes('sextina')) return 'sextina';
  if (t.includes('vilanelle') || t.includes('vilanela')) return 'vilanelle';
  if (t.includes('rondó') || t.includes('rondo')) return 'rondo';
  if (t.includes('pantum')) return 'pantum';
  if (t.includes('ghazal') || t.includes('gazal')) return 'ghazal';
  if (t.includes('ode')) return 'ode';
  if (t.includes('elegia')) return 'elegia';
  if (t.includes('trova')) return 'trova';
  if (t.includes('poesia concreta')) return 'poesia_concreta';
  if (t.includes('prosa poética') || t.includes('prosa poetica')) return 'prosa_poetica';
  if (t.includes('poema narrativo')) return 'poema_narrativo';
  if (t.includes('conto')) return 'conto';
  if (t.includes('crônica') || t.includes('cronica')) return 'cronica';
  if (t.includes('romance')) return 'romance';
  if (t.includes('novela')) return 'novela';
  return String(tipo).toLowerCase() || 'prosa';
}

export function extrairQuantidade(dados = '') {
  const d = String(dados).toLowerCase();
  const m = d.match(/\b(\d{1,2})\s+(haikais|haicais|poemas|textos|contos|crônicas|cronicas|cordeis|cordéis|estrofismos|estrofes)/);
  if (m) return Math.min(Math.max(parseInt(m[1], 10), 1), 20);
  const mapa = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10 };
  for (const [k, v] of Object.entries(mapa)) {
    if (d.includes(`${k} haic`) || d.includes(`${k} haik`) || d.includes(`${k} poema`) || d.includes(`${k} texto`) || d.includes(`${k} conto`)) return v;
  }
  return null;
}

export function leitorVisual({ dados = '', temImagem = false }) {
  if (!temImagem) return 'INATIVO: nenhuma imagem valida foi enviada; proibido mencionar imagem, foto, figura, cena visual carregada ou dizer "a imagem".';
  const d = String(dados).toLowerCase();
  const sinais = ['imagem enviada como fonte visual dominante'];
  if (d.includes('espelho') || d.includes('máscara') || d.includes('mascara') || d.includes('sombra')) sinais.push('reflexo, mascara, sombra, identidade fragmentada');
  if (d.includes('fogo')) sinais.push('fogo, calor, transformacao');
  if (d.includes('faca')) sinais.push('faca, corte, preparo');
  if (d.includes('comida') || d.includes('culin') || d.includes('receita')) sinais.push('comida, mesa, partilha');
  if (d.includes('outono') || d.includes('folha')) sinais.push('folhas, outono, passagem do tempo');
  if (d.includes('pai')) sinais.push('figura paterna e ausencia');
  if (d.includes('filha')) sinais.push('filha e vinculo vivo');
  if (d.includes('cheiro')) sinais.push('cheiro, memoria involuntaria, retorno sensorial');
  if (d.includes('som')) sinais.push('som ambiente, eco, presenca indireta');
  return sinais.join('; ');
}

export function leitorSimbolico({ dados = '' }) {
  const d = String(dados).toLowerCase();
  const s = [];
  if (d.includes('espelho')) s.push('reflexo, duplicidade, confronto consigo');
  if (d.includes('máscara') || d.includes('mascara')) s.push('persona publica, verdade escondida');
  if (d.includes('sombra')) s.push('sombra interior, repressao, abismo psicologico');
  if (d.includes('eternidade') || d.includes('eterno') || d.includes('para sempre')) s.push('desejo de permanencia diante da finitude');
  if (d.includes('amor')) s.push('vinculo, perda possivel, promessa fragil');
  if (d.includes('mar') || d.includes('água') || d.includes('agua')) s.push('impossibilidade de segurar o que ainda assim se ama');
  if (d.includes('fogo')) s.push('memoria acesa e transformacao');
  if (d.includes('faca')) s.push('corte, separacao e preparo');
  if (d.includes('comida') || d.includes('receita')) s.push('heranca afetiva e familia');
  if (d.includes('outono') || d.includes('folha')) s.push('fim de ciclo e transicao');
  if (d.includes('saudade')) s.push('presenca ausente');
  if (d.includes('morte') || d.includes('exumar')) s.push('luto e despedida repetida');
  return s.length ? s.join('; ') : 'simbolo dominante deve vir apenas da entrada atual';
}

export function leitorEmocional({ dados = '' }) {
  const d = String(dados).toLowerCase();
  const e = [];
  if (d.includes('espelho') || d.includes('máscara') || d.includes('mascara') || d.includes('sombra')) e.push('tensao psicologica');
  if (d.includes('eternidade') || d.includes('para sempre') || d.includes('eterno')) e.push('permanencia impossivel');
  if (d.includes('amor')) e.push('amor consciente da finitude');
  if (d.includes('mar') || d.includes('água') || d.includes('agua')) e.push('entrega maior que posse');
  if (d.includes('saudade')) e.push('saudade');
  if (d.includes('pai') || d.includes('morte') || d.includes('exumar')) e.push('luto');
  if (d.includes('filha')) e.push('ausencia viva');
  if (d.includes('outono')) e.push('melancolia serena');
  if (d.includes('comida') || d.includes('receita')) e.push('memoria sensorial');
  if (d.includes('cheiro')) e.push('memoria pelo olfato');
  if (d.includes('anivers') || d.includes('data') || d.includes('junho')) e.push('calendario afetivo');
  return e.length ? e.join('; ') : 'emocao dominante deve ser extraida somente da entrada atual';
}

export function motorHumanidadeLiteraria({ dados = '', memoria = '', tipo = '', forma = '' }) {
  const t = `${dados}\n${memoria}\n${tipo}\n${forma}`.toLowerCase();
  const sinais = [];
  if (/máscara|mascara|persona|sombra|espelho|abismo|verdade|rosto oculto/.test(t)) sinais.push('psicologico humano: persona, sombra, autoengano, reflexo, fissura interior e silencio opressivo');
  if (/eternidade|eterno|para sempre|amor|namorados|junho|mar|água|agua/.test(t)) sinais.push('amor humano maduro: desejo de eternidade, finitude, perda possivel e continuidade depois da ruptura');
  if (/terror|horror|medo|sombrio|monstro|fantasma|sangue|noite|escuro/.test(t)) sinais.push('terror humano: cotidiano contaminado, medo crescente, pessoa imperfeita diante do inexplicavel, sem susto gratuito');
  if (/fantasia|mito|épico|epico|reino|dragão|dragao|deus|deuses|jornada/.test(t)) sinais.push('fantasia humana: nostalgia, amizade, perda do mundo antigo, legado e travessia moral');
  if (/realismo|cotidiano|cidade|familia|família|casa|trabalho|interior/.test(t)) sinais.push('realismo humano: observacao de gesto comum, contradicao social, ironia discreta e vida pequena com peso grande');
  if (/intimo|íntimo|consciência|consciencia|interioridade|sensacao|sensação/.test(t)) sinais.push('interioridade humana: percepcao fragmentada, sensacao corporal, pensamento em fluxo e estranhamento delicado');
  if (/poesia|poema|haikai|tanka|elegia|saudade|luto|memoria|memória/.test(t)) sinais.push('lirismo humano: silencio, imagem concreta, perda contida, eco emocional e ausencia nao explicada');
  if (/antologia|edital|comunidade|pertencimento|publicar|autor/.test(t)) sinais.push('comunidade literaria: desejo de pertencimento, voz reconhecida, proximidade humana e cuidado com clichês de chamada');
  return sinais.length ? sinais.join('; ') : 'ler humanidade profunda do nicho: nao copiar autores; compreender respiracao, tensao, silencio e visao de mundo';
}

export function motorCadencia(forma) {
  const cad = {
    haikai: 'silencio, corte, instante, imagem natural, nenhuma explicacao',
    senryu: 'lampejo humano, ironia discreta, gesto e corte final',
    tanka: 'cinco movimentos: imagem, emocao, dobra, eco, repouso',
    choka: 'alternancia longa, folego narrativo e fechamento lirico',
    soneto: 'progressao argumentativa, tensao crescente e fechamento forte',
    soneto_italiano: 'dois quartetos e dois tercetos com virada nos tercetos',
    soneto_shakespeariano: 'tres quartetos e distico final conclusivo',
    sextina: 'circulo formal com repeticao controlada de palavras finais',
    sestina_medieval: 'seis estrofes de seis versos com palavras finais rotativas e terceto/envoi conclusivo',
    sextilha_cordel: 'oralidade, ritmo popular, clareza narrativa, estrofes de seis versos',
    sextilha_classica: 'seis linhas de progressao lirica com virada interna e terceto final arrebatador quando solicitado',
    pantum: 'eco e repeticao encadeada com retorno transformado',
    ghazal: 'disticos autonomos, recorrencia emocional, distanciamento elegante',
    vilanelle: 'repeticao obsessiva, refrao, circularidade',
    rondo: 'retorno de refrao breve como memoria',
    elegia: 'lentidao, perda, pausa, meditacao',
    ode: 'ascensao, louvor e contemplacao',
    trova: 'brevidade popular e fechamento musical',
    poesia_concreta: 'espaco visual, economia lexical, impacto grafico',
    prosa_poetica: 'prosa lirica, imagem continua, sem quebra artificial',
    poema_narrativo: 'versos com cena, acontecimento e progressao',
    novo_estrofista: 'simetria 1-2-3-4-3-2-1, expansao, apice e recolhimento',
    conto: 'cena concreta, conflito humano, subtexto e fechamento narrativo',
    prosa: 'cena concreta, progressao emocional, subtexto e fechamento'
  };
  return cad[forma] || cad.prosa;
}

export function motorAntiIA(forma) {
  const base = 'Evitar modo relatorio. Proibir frases como "a imagem abre", "a imagem representa", "o texto trata", "base recebida", "simboliza", "transmite". Evitar moralizacao, resumo explicativo, frases vagas, excesso de abstracao, dramaticidade artificial e metaforas recicladas. Preferir detalhe concreto, gesto, objeto, som, cheiro, silencio e subtexto.';
  if (forma === 'haikai' || forma === 'senryu') return `${base} Proibir explicacao emocional. Deixar o corte falar.`;
  if (forma === 'conto' || forma === 'cronica' || forma === 'prosa') return `${base} Mostrar por cena e gesto; nao explicar sentimento que pode aparecer em acao.`;
  if (forma === 'elegia') return `${base} Conter o luto; nao gritar a dor.`;
  if (forma === 'sextilha_cordel') return `${base} Manter oralidade natural, sem tom didatico.`;
  return base;
}

export function motorIdentidadeProfunda({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  const partes = [];
  if (t.includes('eternidade') || t.includes('amor')) partes.push('visao de mundo atravessada por permanencia impossivel e afeto que nao cabe na posse');
  if (t.includes('mar') || t.includes('água') || t.includes('agua')) partes.push('relacao com o vasto: a mao perde, mas o ser escolhe o mar');
  if (t.includes('pai')) partes.push('visao de mundo marcada por origem, legado, ausencia paterna e dignidade silenciosa');
  if (t.includes('filha')) partes.push('relacao com futuro, cuidado, distancia viva e continuidade afetiva');
  if (t.includes('saudade')) partes.push('tempo entendido como permanencia do que nao volta');
  if (t.includes('morte') || t.includes('exumar')) partes.push('consciencia de finitude, materia, rito e despedida repetida');
  return partes.length ? partes.join('; ') : 'visao de mundo discreta, humana, concreta e nao explicativa';
}

export function motorTransformacaoInterna({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  if (t.includes('eternidade') || t.includes('amor') || t.includes('mar')) return 'transformacao interna: do desejo de segurar o amor para a aceitacao amarga de que amar tambem e deixar ir';
  if (t.includes('luto') || t.includes('morte') || t.includes('saudade')) return 'transformacao interna: da dor nomeada para gesto pequeno de permanencia; evitar cura facil';
  if (t.includes('aventura') || t.includes('heroi') || t.includes('herói')) return 'transformacao interna: chamado, medo, travessia, perda e retorno transformado';
  if (t.includes('vilania') || t.includes('vilao') || t.includes('vilão')) return 'transformacao interna: ferida, desejo, endurecimento, ruptura moral e consequencia';
  return 'transformacao interna: uma percepcao se altera sem precisar ser explicada';
}

export function motorEcoHumano({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  const ecos = [];
  if (t.includes('mar') || t.includes('água') || t.includes('agua')) ecos.push('agua escapando da mao como imagem de permanencia impossivel');
  if (t.includes('junho') || t.includes('namorados')) ecos.push('calendario amoroso como promessa e ameaça');
  if (t.includes('espelho')) ecos.push('reflexo como acusacao silenciosa');
  if (t.includes('cheiro')) ecos.push('cheiro retornando como memoria involuntaria');
  if (t.includes('objeto')) ecos.push('objeto simples reaparecendo como testemunha');
  return ecos.length ? ecos.join('; ') : 'usar somente detalhes recorrentes nascidos da entrada atual';
}

export function motorRespiracaoReal(forma) {
  if (forma === 'haikai' || forma === 'senryu') return 'respiracao minima: tres linhas, pausa, corte, silencio final';
  if (forma === 'elegia') return 'respiracao lenta: frases contidas, pausas, sem explosao melodramatica';
  if (forma === 'conto' || forma === 'cronica' || forma === 'prosa') return 'respiracao narrativa: alternar frase curta e media; permitir um vazio entre gesto e sentido';
  if (forma === 'sextilha_cordel') return 'respiracao oral: cadencia cantavel, clara e popular';
  if (forma === 'sextilha_classica') return 'respiracao lirica: progressao em seis linhas e impacto final controlado';
  if (forma === 'sestina_medieval') return 'respiracao circular: retorno obsessivo das palavras finais e fechamento em envoi';
  if (forma === 'novo_estrofista') return 'respiracao simetrica: crescer ate quatro versos e recolher ate um verso final';
  return 'respiracao organica: pausas naturais e cortes discretos';
}

export function motorMemoriaGeracional({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  const g = [];
  if (t.includes('amor') || t.includes('eternidade')) g.push('escrever o amor como algo que tenta atravessar o tempo, mesmo sabendo que o corpo nao atravessa');
  if (t.includes('filho') || t.includes('filha') || t.includes('neto') || t.includes('neta')) g.push('escrever como algo que pode atravessar geracoes sem explicar essa intencao');
  if (t.includes('pai') || t.includes('mae') || t.includes('mãe')) g.push('preservar linhagem afetiva por gesto, objeto ou frase lembrada');
  return g.length ? g.join('; ') : 'manter possibilidade de permanencia, sem discurso sobre legado';
}

export function regraDaForma(forma, quantidade = null) {
  const q = quantidade ? ` Quantidade obrigatoria: ${quantidade}.` : '';
  const regras = {
    haikai: `HAIKAI: exatamente 3 versos curtos por poema.${q} Cada bloco deve ter so 3 versos.`,
    tanka: `TANKA: cinco versos por poema.${q}`,
    senryu: `SENRYU: tres versos curtos por poema.${q}`,
    choka: 'CHOKA: poema longo de alternancia curta/longa, com fechamento lirico.',
    soneto: 'SONETO: 14 versos, preferencialmente 2 quartetos e 2 tercetos.',
    soneto_italiano: 'SONETO ITALIANO: 14 versos, 2 quartetos e 2 tercetos.',
    soneto_shakespeariano: 'SONETO SHAKESPEARIANO: 14 versos, 3 quartetos e 1 distico final.',
    sextina: 'SEXTINA: seis estrofes de seis versos com repeticao estrutural.',
    sestina_medieval: 'SESTINA MEDIEVAL: seis estrofes de seis versos com repeticao rotativa de seis palavras finais, mais terceto/envoi conclusivo.',
    sextilha_cordel: `SEXTILHA DE CORDEL: cada estrofe deve ter exatamente 6 versos, oralidade e cadencia popular.${q}`,
    sextilha_classica: 'SEXTILHA LITERARIA ANTIGA: seis linhas de progressao lirica; quando pedido, usar variacao 6-6-6-6-6-6-3 com terceto final arrebatador.',
    pantum: 'PANTUM: repeticoes encadeadas com retorno emocional.',
    ghazal: 'GHAZAL: disticos autonomos com recorrencia tematica.',
    vilanelle: 'VILANELLE: 19 versos, cinco tercetos e um quarteto final, com repeticoes refranicas.',
    rondo: 'RONDO: poema com retorno de refrao curto.',
    ode: 'ODE: exaltacao lirica e contemplacao.',
    elegia: 'ELEGIA: luto, memoria e meditacao.',
    trova: 'TROVA: quatro versos, fechamento simples e musical.',
    poesia_concreta: 'POESIA CONCRETA: disposicao visual significativa, poucas palavras e impacto grafico.',
    prosa_poetica: 'PROSA POETICA: prosa em blocos liricos, sem virar verso quebrado artificial.',
    poema_narrativo: 'POEMA NARRATIVO: versos com acontecimento, imagem e progressao.',
    novo_estrofista: 'NOVO MOVIMENTO ESTROFISTA: sete estrofes obrigatorias com 1, 2, 3, 4, 3, 2 e 1 versos.',
    conto: 'CONTO: prosa com cena, personagem, conflito e fechamento. Texto colado deve virar semente, nao ser copiado como miolo.',
    cronica: 'CRONICA: prosa breve, observacional e literaria. Texto colado deve virar semente, nao ser copiado como miolo.',
    romance: 'ROMANCE: narrativa longa, jornada, arco e desenvolvimento.',
    novela: 'NOVELA: narrativa intermediaria com eixo central forte.',
    prosa: 'PROSA: paragrafos naturais, cena concreta e progressao. Texto colado deve virar semente, nao ser copiado como miolo.'
  };
  return regras[forma] || regras.prosa;
}

export function motorJornada({ forma = 'conto', dados = '' }) {
  const d = String(dados).toLowerCase();
  if (d.includes('eternidade') || d.includes('amor') || d.includes('mar')) return 'jornada amorosa: promessa de permanencia, consciencia da perda, gesto de seguir em frente sem apagar o vinculo';
  if (d.includes('máscara') || d.includes('mascara') || d.includes('sombra') || d.includes('espelho')) return 'jornada psicologica: persona, fissura, confronto com sombra, verdade parcial e silencio final';
  if (d.includes('vilania') || d.includes('vilão') || d.includes('vilao')) return 'jornada de vilania: desejo, ruptura moral, escalada, queda ou dominio';
  if (d.includes('heroi') || d.includes('herói') || d.includes('aventura') || forma === 'romance') return 'jornada do heroi: chamado, recusa, mentor, travessia, provacoes, abismo, retorno';
  if (d.includes('luto') || d.includes('saudade') || d.includes('pai')) return 'jornada emocional: ferida, lembranca concreta, confronto com ausencia, gesto de permanencia';
  return 'jornada minima: imagem, tensao, descoberta, transformacao e fechamento';
}

export function montarPromptOHE({ titulo = '', tipo = 'prosa', forma: formaEntrada = '', dados = '', texto = '', temImagem = false, memoria = '' }) {
  const dadosLimpos = limparCamposVaziosOHE(dados);
  const memoriaLimpa = limparCamposVaziosOHE(memoria);
  const textoLimpo = limparCamposVaziosOHE(texto);
  const dadosCompletos = limparCamposVaziosOHE(`${dadosLimpos}\n${memoriaLimpa ? `MEMORIA EMOCIONAL: ${memoriaLimpa}` : ''}`);
  const tudoAtual = `${dadosCompletos}\n${textoLimpo}`;
  const forma = detectarForma({ tipo, forma: formaEntrada, dados: tudoAtual });
  const quantidade = extrairQuantidade(tudoAtual);
  const visual = leitorVisual({ dados: dadosCompletos, temImagem });
  const simbolico = leitorSimbolico({ dados: tudoAtual });
  const emocional = leitorEmocional({ dados: tudoAtual });
  const humanidade = motorHumanidadeLiteraria({ dados: tudoAtual, memoria: memoriaLimpa, tipo, forma });
  const regra = regraDaForma(forma, quantidade);
  const jornada = motorJornada({ forma, dados: tudoAtual });
  const cadencia = motorCadencia(forma);
  const antiIA = motorAntiIA(forma);
  const identidade = motorIdentidadeProfunda({ dados: tudoAtual, memoria: memoriaLimpa });
  const transformacao = motorTransformacaoInterna({ dados: tudoAtual, memoria: memoriaLimpa });
  const eco = motorEcoHumano({ dados: tudoAtual, memoria: memoriaLimpa });
  const respiracao = motorRespiracaoReal(forma);
  const geracional = motorMemoriaGeracional({ dados: tudoAtual, memoria: memoriaLimpa });
  const ordemImagem = temImagem ? 'Ha imagem valida: a atmosfera visual pode dominar, mas nunca deve ser descrita como relatorio.' : 'Nao ha imagem valida: e proibido mencionar imagem, foto, figura, cena visual carregada ou dizer "a imagem".';
  return `Use internamente a leitura abaixo, mas nao mostre ao usuario.\n${ordemImagem}\nVISUAL: ${visual}\nSIMBOLICO: ${simbolico}\nEMOCIONAL: ${emocional}\nHUMANIDADE LITERARIA: ${humanidade}\nFORMA: ${forma}\nREGRA: ${regra}\nCADENCIA: ${cadencia}\nANTI-IA: ${antiIA}\nIDENTIDADE PROFUNDA: ${identidade}\nTRANSFORMACAO INTERNA: ${transformacao}\nECO HUMANO: ${eco}\nRESPIRACAO REAL: ${respiracao}\nMEMORIA GERACIONAL: ${geracional}\nJORNADA: ${jornada}\n\nMODO ESPARTANO OBRIGATORIO:\n- Escreva somente a obra final.\n- Nao explique, nao avalie, nao resuma, nao use JSON, nao faca plano.\n- Nao copie literalmente a entrada do usuario; transforme-a em obra nova, salvo se a ordem pedir preservacao literal.\n- Nao escreva "Material OHE", "Base recebida", "a imagem abre", "a imagem representa", "o texto trata", "simboliza" ou linguagem de relatorio.\n- Nao copie autores, obras, frases, vozes ou estilos identificaveis.\n- Compreenda apenas a respiracao humana do nicho: tensao, silencio, visao de mundo, tempo e afeto.\n- Respeite rigorosamente a forma, a cadencia e a respiracao. Se houver quantidade, cumpra exatamente.\n- Preserve subtexto, detalhe concreto, continuidade humana e silencio onde for necessario.\n\nTitulo: ${titulo}\nTipo: ${tipo}\nForma exata: ${forma}\nDados atuais limpos: ${String(dadosCompletos).slice(0, 12000)}\nSemente textual atual: ${String(textoLimpo).slice(0, 12000)}`;
}

export function limparMetatexto(miolo = '') {
  return String(miolo || '')
    .replace(/Material OHE/gi, '')
    .replace(/PROSA\s+—\s+Conto/gi, '')
    .replace(/POESIA\s+—\s+[^\n]+/gi, '')
    .replace(/Base recebida:[\s\S]*?(\n\n|$)/gi, '')
    .replace(/Pessoa:\s*Data:\s*Sensorial:\s*Objeto:\s*Mem[oó]ria:/gi, '')
    .replace(/^\s*Pessoa:\s*$/gim, '')
    .replace(/^\s*Data:\s*$/gim, '')
    .replace(/^\s*Sensorial:\s*$/gim, '')
    .replace(/^\s*Objeto:\s*$/gim, '')
    .replace(/^\s*Mem[oó]ria:\s*$/gim, '')
    .replace(/A imagem abre uma cena[\s\S]*?(\n\n|$)/gi, '')
    .replace(/A imagem (representa|transmite|simboliza)[\s\S]*?(\n\n|$)/gi, '')
    .replace(/O primeiro texto acompanha/gi, '')
    .replace(/O segundo texto assume/gi, '')
    .replace(/O terceiro texto observa/gi, '')
    .replace(/Este texto trata[\s\S]*?(\n\n|$)/gi, '')
    .replace(/A narrativa deve[\s\S]*?(\n\n|$)/gi, '')
    .replace(/O texto abaixo[\s\S]*?(\n\n|$)/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function linhasTexto(texto) { return String(texto || '').split('\n').map(l => l.trim()).filter(Boolean); }
function estrofesTexto(texto) { return String(texto || '').split(/\n\s*\n/).map(b => linhasTexto(b)).filter(b => b.length); }

export function validarForma(miolo = '', forma = 'prosa', quantidade = null) {
  const texto = String(miolo || '').trim();
  if (!texto) return { ok: false, motivo: 'saida vazia' };
  if (/Material OHE|Base recebida|A imagem abre|A imagem representa|O texto trata/i.test(texto)) return { ok: false, motivo: 'modo relatorio detectado' };
  const linhas = linhasTexto(texto);
  const estrofes = estrofesTexto(texto);
  if (forma === 'haikai' || forma === 'senryu') {
    const okBlocos = estrofes.filter(b => b.length === 3);
    const qOk = quantidade ? okBlocos.length >= quantidade : okBlocos.length >= 1;
    return { ok: qOk && okBlocos.length === estrofes.length, motivo: qOk ? 'ok' : 'haikai/senryu precisa de blocos de 3 versos' };
  }
  if (forma === 'tanka') return { ok: estrofes.some(e => e.length === 5), motivo: estrofes.some(e => e.length === 5) ? 'ok' : 'tanka precisa de 5 versos' };
  if (forma === 'trova') return { ok: estrofes.some(e => e.length === 4), motivo: estrofes.some(e => e.length === 4) ? 'ok' : 'trova precisa de 4 versos' };
  if (forma === 'soneto' || forma === 'soneto_italiano' || forma === 'soneto_shakespeariano') return { ok: linhas.length >= 14, motivo: linhas.length >= 14 ? 'ok' : 'soneto precisa de 14 versos' };
  if (forma === 'sextilha_cordel') return { ok: estrofes.some(e => e.length === 6), motivo: estrofes.some(e => e.length === 6) ? 'ok' : 'cordel precisa de sextilhas' };
  if (forma === 'sextilha_classica') return { ok: linhas.length >= 6, motivo: linhas.length >= 6 ? 'ok' : 'sextilha classica precisa de seis linhas ou variacao solicitada' };
  if (forma === 'sestina_medieval' || forma === 'sextina') return { ok: estrofes.length >= 6, motivo: estrofes.length >= 6 ? 'ok' : 'sestina/sextina precisa de seis estrofes base' };
  if (forma === 'novo_estrofista') {
    const padrao = [1,2,3,4,3,2,1];
    const ok = estrofes.length >= 7 && padrao.every((n,i)=>estrofes[i] && estrofes[i].length === n);
    return { ok, motivo: ok ? 'ok' : 'Novo Movimento Estrofista precisa seguir 1-2-3-4-3-2-1' };
  }
  if (forma === 'vilanelle') return { ok: linhas.length >= 19, motivo: linhas.length >= 19 ? 'ok' : 'vilanelle precisa de 19 versos' };
  return { ok: true, motivo: 'ok' };
}
