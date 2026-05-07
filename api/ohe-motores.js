export function detectarForma({ tipo = 'prosa', dados = '', forma = '' }) {
  const t = `${forma} ${tipo} ${dados}`.toLowerCase();
  if (t.includes('haikai') || t.includes('haicai')) return 'haikai';
  if (t.includes('tanka')) return 'tanka';
  if (t.includes('senryu')) return 'senryu';
  if (t.includes('soneto')) return 'soneto';
  if (t.includes('sextina')) return 'sextina';
  if (t.includes('pantum')) return 'pantum';
  if (t.includes('ghazal') || t.includes('gazal')) return 'ghazal';
  if (t.includes('ode')) return 'ode';
  if (t.includes('elegia')) return 'elegia';
  if (t.includes('cordel') || t.includes('sextilha')) return 'sextilha';
  if (t.includes('conto')) return 'conto';
  if (t.includes('crônica') || t.includes('cronica')) return 'cronica';
  if (t.includes('romance')) return 'romance';
  if (t.includes('novela')) return 'novela';
  return String(tipo).toLowerCase() || 'prosa';
}

export function extrairQuantidade(dados = '') {
  const d = String(dados).toLowerCase();
  const m = d.match(/\b(\d{1,2})\s+(haikais|haicais|poemas|textos|contos|crônicas|cronicas|cordeis|cordéis)/);
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
  return e.length ? e.join('; ') : 'emocao dominante antes da forma';
}

export function regraDaForma(forma, quantidade = null) {
  const q = quantidade ? ` Quantidade obrigatoria: ${quantidade}.` : '';
  const regras = {
    haikai: `HAIKAI: exatamente 3 versos curtos por poema.${q} Cada bloco deve ter so 3 versos.`,
    tanka: `TANKA: cinco versos por poema.${q}`,
    senryu: `SENRYU: tres versos curtos por poema.${q}`,
    soneto: 'SONETO: 14 versos, preferencialmente 2 quartetos e 2 tercetos.',
    sextina: 'SEXTINA: seis estrofes de seis versos com repeticao estrutural.',
    pantum: 'PANTUM: repeticoes encadeadas com retorno emocional.',
    ghazal: 'GHAZAL: disticos autonomos com recorrencia tematica.',
    ode: 'ODE: exaltacao lirica e contemplacao.',
    elegia: 'ELEGIA: luto, memoria e meditacao.',
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
  return `Use internamente a leitura abaixo, mas nao mostre ao usuario.\nVISUAL: ${visual}\nSIMBOLICO: ${simbolico}\nEMOCIONAL: ${emocional}\nFORMA: ${forma}\nREGRA: ${regra}\nJORNADA: ${jornada}\n\nEscreva somente a obra final. Nao explique. Nao use JSON. Nao faca plano. Respeite rigorosamente a forma. Se houver quantidade, cumpra exatamente.\n\nTitulo: ${titulo}\nTipo: ${tipo}\nForma exata: ${forma}\nDados: ${String(dadosCompletos).slice(0, 12000)}\nTexto base: ${String(texto).slice(0, 12000)}`;
}

export function limparMetatexto(miolo = '') {
  return String(miolo || '')
    .replace(/O primeiro texto acompanha/gi, '')
    .replace(/O segundo texto assume/gi, '')
    .replace(/O terceiro texto observa/gi, '')
    .replace(/Este texto trata[\s\S]*?(\n\n|$)/gi, '')
    .replace(/A narrativa deve[\s\S]*?(\n\n|$)/gi, '')
    .replace(/Base recebida:[\s\S]*?(\n\n|$)/gi, '')
    .trim();
}

export function validarForma(miolo = '', forma = 'prosa', quantidade = null) {
  const texto = String(miolo || '').trim();
  if (!texto) return { ok: false, motivo: 'saida vazia' };
  if (forma === 'haikai' || forma === 'senryu') {
    const blocos = texto.split(/\n\s*\n/).map(b => b.split('\n').map(l => l.trim()).filter(Boolean)).filter(b => b.length);
    const okBlocos = blocos.filter(b => b.length === 3 || (b.length === 4 && b[0].length < 60));
    const qOk = quantidade ? okBlocos.length >= quantidade : okBlocos.length >= 1;
    return { ok: qOk, motivo: qOk ? 'ok' : 'haikai/senryu fora da estrutura' };
  }
  if (forma === 'soneto') {
    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    return { ok: linhas.length >= 14, motivo: linhas.length >= 14 ? 'ok' : 'soneto precisa de 14 versos' };
  }
  if (forma === 'sextilha') {
    const estrofes = texto.split(/\n\s*\n/).map(b => b.split('\n').map(l => l.trim()).filter(Boolean)).filter(Boolean);
    return { ok: estrofes.some(e => e.length === 6), motivo: estrofes.some(e => e.length === 6) ? 'ok' : 'cordel precisa de sextilhas' };
  }
  return { ok: true, motivo: 'ok' };
}
