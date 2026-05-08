export function detectarForma({ tipo = 'prosa', dados = '', forma = '' }) {
  const t = `${forma} ${tipo} ${dados}`.toLowerCase();
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
  if (t.includes('cordel') || t.includes('sextilha')) return 'sextilha';
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
  for (const [k, v] of Object.entries(mapa)) if (d.includes(`${k} haic`) || d.includes(`${k} haik`) || d.includes(`${k} poema`) || d.includes(`${k} texto`)) return v;
  return null;
}

export function leitorVisual({ dados = '', temImagem = false }) {
  const d = String(dados).toLowerCase();
  const sinais = [];
  if (temImagem) sinais.push('imagem enviada como fonte visual');
  if (d.includes('fogo')) sinais.push('fogo, calor, transformacao');
  if (d.includes('faca')) sinais.push('faca, corte, preparo');
  if (d.includes('comida') || d.includes('culin') || d.includes('receita')) sinais.push('comida, mesa, partilha');
  if (d.includes('outono') || d.includes('folha')) sinais.push('folhas, outono, passagem do tempo');
  if (d.includes('pai')) sinais.push('figura paterna e ausencia');
  if (d.includes('filha')) sinais.push('filha e vinculo vivo');
  if (d.includes('cheiro')) sinais.push('cheiro, memoria involuntaria, retorno sensorial');
  if (d.includes('som')) sinais.push('som ambiente, eco, presenca indireta');
  return sinais.length ? sinais.join('; ') : 'concretude visual da entrada';
}

export function leitorSimbolico({ dados = '' }) {
  const d = String(dados).toLowerCase();
  const s = [];
  if (d.includes('fogo')) s.push('memoria acesa e transformacao');
  if (d.includes('faca')) s.push('corte, separacao e preparo');
  if (d.includes('comida') || d.includes('receita')) s.push('heranca afetiva e familia');
  if (d.includes('outono') || d.includes('folha')) s.push('fim de ciclo e transicao');
  if (d.includes('saudade')) s.push('presenca ausente');
  if (d.includes('morte') || d.includes('exumar')) s.push('luto e despedida repetida');
  if (d.includes('objeto')) s.push('objeto como reliquia emocional');
  return s.length ? s.join('; ') : 'simbolo extraido da entrada';
}

export function leitorEmocional({ dados = '' }) {
  const d = String(dados).toLowerCase();
  const e = [];
  if (d.includes('saudade')) e.push('saudade');
  if (d.includes('pai') || d.includes('morte') || d.includes('exumar')) e.push('luto');
  if (d.includes('filha')) e.push('ausencia viva');
  if (d.includes('outono')) e.push('melancolia serena');
  if (d.includes('comida') || d.includes('receita')) e.push('memoria sensorial');
  if (d.includes('cheiro')) e.push('memoria pelo olfato');
  if (d.includes('anivers') || d.includes('data')) e.push('calendario afetivo');
  if (d.includes('frio') || d.includes('calor')) e.push('sensacao corporal');
  return e.length ? e.join('; ') : 'emocao dominante antes da forma';
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
    pantum: 'eco e repeticao encadeada com retorno transformado',
    ghazal: 'disticos autonomos, recorrencia emocional, distanciamento elegante',
    vilanelle: 'repeticao obsessiva, refrao, circularidade',
    rondo: 'retorno de refrao breve como memoria',
    elegia: 'lentidao, perda, pausa, meditacao',
    ode: 'ascensao, louvor e contemplacao',
    trova: 'brevidade popular e fechamento musical',
    sextilha: 'oralidade, ritmo popular, clareza narrativa',
    poesia_concreta: 'espaco visual, economia lexical, impacto grafico',
    prosa_poetica: 'prosa lirica, imagem continua, sem quebra artificial',
    poema_narrativo: 'versos com cena, acontecimento e progressao',
    novo_estrofista: 'simetria 1-2-3-4-3-2-1, expansao, apice e recolhimento',
    prosa: 'cena concreta, progressao emocional, subtexto e fechamento'
  };
  return cad[forma] || cad.prosa;
}

export function motorAntiIA(forma) {
  const base = 'Evitar moralizacao, resumo explicativo, frases vagas, excesso de abstracao, dramaticidade artificial e metaforas recicladas. Preferir detalhe concreto, gesto, objeto, som, cheiro, silencio e subtexto.';
  if (forma === 'haikai' || forma === 'senryu') return `${base} Proibir explicacao emocional. Deixar o corte falar.`;
  if (forma === 'conto' || forma === 'cronica' || forma === 'prosa') return `${base} Mostrar por cena e gesto; nao explicar sentimento que pode aparecer em acao.`;
  if (forma === 'elegia') return `${base} Conter o luto; nao gritar a dor.`;
  if (forma === 'sextilha') return `${base} Manter oralidade natural, sem tom didatico.`;
  return base;
}

export function motorIdentidadeProfunda({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  const partes = [];
  if (t.includes('pai')) partes.push('visao de mundo marcada por origem, legado, ausencia paterna e dignidade silenciosa');
  if (t.includes('filha')) partes.push('relacao com futuro, cuidado, distancia viva e continuidade afetiva');
  if (t.includes('saudade')) partes.push('tempo entendido como permanencia do que nao volta');
  if (t.includes('morte') || t.includes('exumar')) partes.push('consciencia de finitude, materia, rito e despedida repetida');
  if (t.includes('interior') || t.includes('são roque') || t.includes('sao roque')) partes.push('olhar de interior, concreto, familiar, sem grandiloquencia urbana');
  return partes.length ? partes.join('; ') : 'visao de mundo discreta, humana, concreta e nao explicativa';
}

export function motorTransformacaoInterna({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  if (t.includes('luto') || t.includes('morte') || t.includes('saudade')) return 'transformacao interna: da dor nomeada para gesto pequeno de permanencia; evitar cura facil';
  if (t.includes('aventura') || t.includes('heroi') || t.includes('herói')) return 'transformacao interna: chamado, medo, travessia, perda e retorno transformado';
  if (t.includes('vilania') || t.includes('vilao') || t.includes('vilão')) return 'transformacao interna: ferida, desejo, endurecimento, ruptura moral e consequencia';
  return 'transformacao interna: uma percepcao se altera sem precisar ser explicada';
}

export function motorEcoHumano({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  const ecos = [];
  if (t.includes('cheiro')) ecos.push('cheiro retornando como memoria involuntaria');
  if (t.includes('objeto')) ecos.push('objeto simples reaparecendo como testemunha');
  if (t.includes('mesa') || t.includes('comida') || t.includes('receita')) ecos.push('mesa, alimento ou utensilio como heranca afetiva');
  if (t.includes('outono') || t.includes('folha')) ecos.push('folha, vento e estacao como passagem do tempo');
  if (t.includes('data') || t.includes('anivers')) ecos.push('calendario como ferida discreta');
  return ecos.length ? ecos.join('; ') : 'usar um pequeno detalhe recorrente sem transformar em repeticao mecanica';
}

export function motorRespiracaoReal(forma) {
  if (forma === 'haikai' || forma === 'senryu') return 'respiracao minima: tres linhas, pausa, corte, silencio final';
  if (forma === 'elegia') return 'respiracao lenta: frases contidas, pausas, sem explosao melodramatica';
  if (forma === 'conto' || forma === 'cronica' || forma === 'prosa') return 'respiracao narrativa: alternar frase curta e media; permitir um vazio entre gesto e sentido';
  if (forma === 'sextilha') return 'respiracao oral: cadencia cantavel, clara e popular';
  if (forma === 'novo_estrofista') return 'respiracao simetrica: crescer ate quatro versos e recolher ate um verso final';
  return 'respiracao organica: pausas naturais e cortes discretos';
}

export function motorMemoriaGeracional({ dados = '', memoria = '' }) {
  const t = `${dados}\n${memoria}`.toLowerCase();
  const g = [];
  if (t.includes('filho') || t.includes('filha') || t.includes('neto') || t.includes('neta')) g.push('escrever como algo que pode atravessar geracoes sem explicar essa intencao');
  if (t.includes('pai') || t.includes('mae') || t.includes('mãe')) g.push('preservar linhagem afetiva por gesto, objeto ou frase lembrada');
  if (t.includes('legado') || t.includes('familia') || t.includes('família')) g.push('dar ao texto sensacao de continuidade e heranca viva');
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
    sextilha: `CORDEL/SEXTILHA: cada estrofe deve ter exatamente 6 versos.${q}`,
    conto: 'CONTO: prosa com cena, personagem, conflito e fechamento.',
    cronica: 'CRONICA: prosa breve, observacional e literaria.',
    romance: 'ROMANCE: narrativa longa, jornada, arco e desenvolvimento.',
    novela: 'NOVELA: narrativa intermediaria com eixo central forte.',
    prosa: 'PROSA: paragrafos naturais, cena concreta e progressao.'
  };
  return regras[forma] || regras.prosa;
}

export function motorJornada({ forma = 'conto', dados = '' }) {
  const d = String(dados).toLowerCase();
  if (d.includes('vilania') || d.includes('vilão') || d.includes('vilao')) return 'jornada de vilania: desejo, ruptura moral, escalada, queda ou dominio';
  if (d.includes('heroi') || d.includes('herói') || d.includes('aventura') || forma === 'romance') return 'jornada do heroi: chamado, recusa, mentor, travessia, provacoes, abismo, retorno';
  if (d.includes('luto') || d.includes('saudade') || d.includes('pai')) return 'jornada emocional: ferida, lembranca concreta, confronto com ausencia, gesto de permanencia';
  return 'jornada minima: imagem, tensao, descoberta, transformacao e fechamento';
}

export function montarPromptOHE({ titulo = '', tipo = 'prosa', forma: formaEntrada = '', dados = '', texto = '', temImagem = false, memoria = '' }) {
  const dadosCompletos = `${dados}\nMEMORIA EMOCIONAL: ${memoria}`;
  const forma = detectarForma({ tipo, forma: formaEntrada, dados: dadosCompletos });
  const quantidade = extrairQuantidade(dadosCompletos);
  const visual = leitorVisual({ dados: dadosCompletos, temImagem });
  const simbolico = leitorSimbolico({ dados: dadosCompletos });
  const emocional = leitorEmocional({ dados: dadosCompletos });
  const regra = regraDaForma(forma, quantidade);
  const jornada = motorJornada({ forma, dados: dadosCompletos });
  const cadencia = motorCadencia(forma);
  const antiIA = motorAntiIA(forma);
  const identidade = motorIdentidadeProfunda({ dados: dadosCompletos, memoria });
  const transformacao = motorTransformacaoInterna({ dados: dadosCompletos, memoria });
  const eco = motorEcoHumano({ dados: dadosCompletos, memoria });
  const respiracao = motorRespiracaoReal(forma);
  const geracional = motorMemoriaGeracional({ dados: dadosCompletos, memoria });
  return `Use internamente a leitura abaixo, mas nao mostre ao usuario.\nVISUAL: ${visual}\nSIMBOLICO: ${simbolico}\nEMOCIONAL: ${emocional}\nFORMA: ${forma}\nREGRA: ${regra}\nCADENCIA: ${cadencia}\nANTI-IA: ${antiIA}\nIDENTIDADE PROFUNDA: ${identidade}\nTRANSFORMACAO INTERNA: ${transformacao}\nECO HUMANO: ${eco}\nRESPIRACAO REAL: ${respiracao}\nMEMORIA GERACIONAL: ${geracional}\nJORNADA: ${jornada}\n\nEscreva somente a obra final. Nao explique. Nao use JSON. Nao faca plano. Respeite rigorosamente a forma, a cadencia e a respiracao. Se houver quantidade, cumpra exatamente. Evite frases genericas, moralizacao, conclusao artificial e metatexto. Preserve subtexto, detalhe concreto, continuidade humana e silencio onde for necessario.\n\nTitulo: ${titulo}\nTipo: ${tipo}\nForma exata: ${forma}\nDados: ${String(dadosCompletos).slice(0, 12000)}\nTexto base: ${String(texto).slice(0, 12000)}`;
}

export function limparMetatexto(miolo = '') {
  return String(miolo || '')
    .replace(/O primeiro texto acompanha/gi, '')
    .replace(/O segundo texto assume/gi, '')
    .replace(/O terceiro texto observa/gi, '')
    .replace(/Este texto trata[\s\S]*?(\n\n|$)/gi, '')
    .replace(/A narrativa deve[\s\S]*?(\n\n|$)/gi, '')
    .replace(/Base recebida:[\s\S]*?(\n\n|$)/gi, '')
    .replace(/A imagem abre uma cena[\s\S]*?(\n\n|$)/gi, '')
    .replace(/O texto abaixo[\s\S]*?(\n\n|$)/gi, '')
    .trim();
}

function linhasTexto(texto) { return String(texto || '').split('\n').map(l => l.trim()).filter(Boolean); }
function estrofesTexto(texto) { return String(texto || '').split(/\n\s*\n/).map(b => linhasTexto(b)).filter(b => b.length); }

export function validarForma(miolo = '', forma = 'prosa', quantidade = null) {
  const texto = String(miolo || '').trim();
  if (!texto) return { ok: false, motivo: 'saida vazia' };
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
  if (forma === 'sextilha') return { ok: estrofes.some(e => e.length === 6), motivo: estrofes.some(e => e.length === 6) ? 'ok' : 'cordel precisa de sextilhas' };
  if (forma === 'novo_estrofista') {
    const padrao = [1,2,3,4,3,2,1];
    const ok = estrofes.length >= 7 && padrao.every((n,i)=>estrofes[i] && estrofes[i].length === n);
    return { ok, motivo: ok ? 'ok' : 'Novo Movimento Estrofista precisa seguir 1-2-3-4-3-2-1' };
  }
  if (forma === 'vilanelle') return { ok: linhas.length >= 19, motivo: linhas.length >= 19 ? 'ok' : 'vilanelle precisa de 19 versos' };
  return { ok: true, motivo: 'ok' };
}
