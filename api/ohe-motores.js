export function detectarForma({ tipo = 'prosa', dados = '' }) {
  const t = `${tipo} ${dados}`.toLowerCase();
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
  return e.length ? e.join('; ') : 'emocao dominante antes da forma';
}

export function regraDaForma(forma) {
  const regras = {
    haikai: 'HAIKAI: exatamente 3 versos curtos por poema. Se pedir 5 haikais, entregar 5 blocos com 3 versos cada. Sem estrofe longa.',
    tanka: 'TANKA: cinco versos, lirismo concentrado e expansao do instante.',
    senryu: 'SENRYU: tres versos curtos sobre gesto humano ou ironia social.',
    soneto: 'SONETO: 14 versos, preferencialmente 2 quartetos e 2 tercetos.',
    sextina: 'SEXTINA: seis estrofes de seis versos com repeticao estrutural.',
    pantum: 'PANTUM: repeticoes encadeadas com retorno emocional.',
    ghazal: 'GHAZAL: disticos autonomos com recorrencia tematica.',
    ode: 'ODE: exaltação lirica e contemplacao.',
    elegia: 'ELEGIA: luto, memoria e meditacao.',
    sextilha: 'CORDEL/SEXTILHA: cada estrofe deve ter exatamente 6 versos.',
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
  if (d.includes('vilania') || d.includes('vilão') || d.includes('vilao')) return 'jornada de vilania: desejo, ruptura moral, escalada, ataques falhos, queda ou dominio';
  if (d.includes('heroi') || d.includes('herói') || d.includes('aventura') || forma === 'romance') return 'jornada do heroi: chamado, recusa, mentor, travessia, provacoes, abismo, retorno';
  if (d.includes('luto') || d.includes('saudade') || d.includes('pai')) return 'jornada emocional: ferida, lembranca concreta, confronto com ausencia, gesto de permanencia';
  return 'jornada minima: imagem, tensao, descoberta, transformacao e fechamento';
}

export function montarPromptOHE({ titulo = '', tipo = 'prosa', dados = '', texto = '', temImagem = false }) {
  const forma = detectarForma({ tipo, dados });
  const visual = leitorVisual({ dados, temImagem });
  const simbolico = leitorSimbolico({ dados });
  const emocional = leitorEmocional({ dados });
  const regra = regraDaForma(forma);
  const jornada = motorJornada({ forma, dados });
  return `Use internamente a leitura abaixo, mas nao mostre ao usuario.\nVISUAL: ${visual}\nSIMBOLICO: ${simbolico}\nEMOCIONAL: ${emocional}\nFORMA: ${forma}\nREGRA: ${regra}\nJORNADA: ${jornada}\n\nEscreva somente a obra final. Nao explique. Nao use JSON. Nao faca plano. Nao diga que vai escrever. Respeite a forma. Se houver quantidade, cumpra exatamente.\n\nTitulo: ${titulo}\nTipo: ${tipo}\nDados: ${String(dados).slice(0, 12000)}\nTexto base: ${String(texto).slice(0, 12000)}`;
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
