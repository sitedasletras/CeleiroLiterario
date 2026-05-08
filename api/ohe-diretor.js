import { montarPromptOHE, limparMetatexto, detectarForma, extrairQuantidade, validarForma, limparCamposVaziosOHE } from './ohe-motores.js';

async function chamarOpenAI({ apiKey, content, temperature = 0.72 }) {
  const resposta = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4.1-mini', input: [{ role: 'user', content }], temperature, max_output_tokens: 7000 })
  });
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.error?.message || 'Erro OpenAI');
  return data.output_text || '';
}

function escolherLinha({ tipo = '', forma = '', dados = '', memoria = '', indicado = '' }) {
  if (indicado && String(indicado).trim()) return String(indicado).trim();
  const t = [tipo, forma, dados, memoria].join('\n').toLowerCase();
  if (/cordel|sextilha de cordel|sextilha popular|septilha|oitava|décima|decima|martelo|galope/.test(t)) return 'linha de cordel';
  if (/sestina medieval|sextilha clássica|sextilha classica|haikai|haicai|tanka|senryu|soneto|ode|elegia|poesia|poema|verso/.test(t)) return 'linha poetica';
  if (/conto|romance|novela|crônica|cronica|prosa|narrativa/.test(t)) return 'linha de prosa';
  if (/hibrido|híbrido|prosa poetica|prosa poética/.test(t)) return 'linha hibrida';
  return 'linha nova a ser catalogada';
}

function promptHumanizacao(miolo, forma, temImagem = false) {
  const regraImagem = temImagem
    ? '- se houver referência visual, ela deve contaminar a atmosfera sem virar relatório;'
    : '- não mencionar imagem, foto, figura ou cena visual carregada;';

  return `Refine o texto abaixo sem mudar a forma ${forma}.

CAMADAS OBRIGATORIAS DE REFINAMENTO:
- preservar a estrutura formal validada;
- manter obra final, sem análise, sem relatório e sem cabeçalhos técnicos;
${regraImagem}
- melhorar atmosfera: luz, ar, temperatura, espaço e peso emocional;
- manter subtexto e silêncio; não explicar o que a cena já mostra;
- preservar sinais de permanência, legado e continuidade sem discursar sobre isso;
- remover metatexto, moralização, frases genéricas e conclusão artificial;
- proibir: "Material OHE", "Base recebida", "A imagem abre", "o texto trata", "simboliza", "transmite";
- manter respiração humana, com variação natural de frase e pausa;
- se for poesia, não transformar em prosa explicativa;
- se for prosa, não quebrar artificialmente em versos.

Entregue somente o texto final.

${miolo}`;
}

function checarEstabilidadeA4(miolo = '') {
  const texto = String(miolo || '').trim();
  const paragrafos = texto.split(/\n\s*\n/).filter(Boolean).length;
  const linhas = texto.split('\n').filter(l => l.trim()).length;
  const caracteres = texto.length;
  const possuiRelatorio = /Material OHE|Base recebida|A imagem abre|A imagem representa|O texto trata|simboliza|transmite/i.test(texto);
  return { paragrafos, linhas, caracteres, prontoA4: caracteres > 20 && linhas > 0 && !possuiRelatorio, possuiRelatorio };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const corpo = req.body || {};
    const titulo = limparCamposVaziosOHE(corpo.titulo || '');
    const texto = limparCamposVaziosOHE(corpo.texto || '');
    const tipo = limparCamposVaziosOHE(corpo.tipo || 'prosa') || 'prosa';
    const formaEntrada = limparCamposVaziosOHE(corpo.forma || '');
    const memoria = limparCamposVaziosOHE(corpo.memoria || '');
    const heteronimo = limparCamposVaziosOHE(corpo.heteronimo || '');
    const dados = limparCamposVaziosOHE(corpo.dados || '');
    const quantidadeEntrada = corpo.quantidade || '';
    const imagem = typeof corpo.imagem === 'string' ? corpo.imagem : '';
    const temImagem = Boolean(imagem && imagem.startsWith('data:image/'));

    const entradaAtual = limparCamposVaziosOHE(`${dados}\n${titulo}\n${texto}\n${memoria}`);
    const forma = detectarForma({ tipo, forma: formaEntrada, dados: entradaAtual });
    const qtdDetectada = Number(quantidadeEntrada) || extrairQuantidade(entradaAtual) || null;
    const linha = escolherLinha({ tipo, forma, dados, memoria, indicado: heteronimo });

    const prompt = montarPromptOHE({
      titulo,
      tipo,
      forma,
      dados: limparCamposVaziosOHE(`${dados}\nLinha autoral: ${linha}\nNucleo de permanencia: preservar continuidade humana, atmosfera, legado discreto e estabilidade A4.`),
      texto,
      memoria,
      temImagem
    });

    const content = [{ type: 'input_text', text: prompt }];
    if (temImagem) content.push({ type: 'input_image', image_url: imagem });

    let miolo = limparMetatexto(await chamarOpenAI({ apiKey, content, temperature: 0.68 }));
    let validacao = validarForma(miolo, forma, qtdDetectada);
    let tentativas = 1;

    while (!validacao.ok && tentativas < 3) {
      const reparo = `${prompt}\n\nA saida anterior falhou: ${validacao.motivo}. Reescreva obedecendo a forma ${forma}${qtdDetectada ? ` e quantidade ${qtdDetectada}` : ''}. Preserve atmosfera, silencio, subtexto e estabilidade A4. Entregue somente a obra final, sem relatório.`;
      const repairContent = [{ type: 'input_text', text: reparo }];
      if (temImagem) repairContent.push({ type: 'input_image', image_url: imagem });
      miolo = limparMetatexto(await chamarOpenAI({ apiKey, content: repairContent, temperature: 0.5 }));
      validacao = validarForma(miolo, forma, qtdDetectada);
      tentativas += 1;
    }

    if (validacao.ok) {
      const humanContent = [{ type: 'input_text', text: promptHumanizacao(miolo, forma, temImagem) }];
      const refinado = limparMetatexto(await chamarOpenAI({ apiKey, content: humanContent, temperature: 0.36 }));
      const validacaoRefinada = validarForma(refinado, forma, qtdDetectada);
      if (validacaoRefinada.ok) {
        miolo = refinado;
        validacao = validacaoRefinada;
      }
    }

    const estabilidadeA4 = checarEstabilidadeA4(miolo);
    return res.status(200).json({
      ok: true,
      forma,
      quantidade: qtdDetectada,
      linha,
      temImagem,
      validacao,
      estabilidadeA4,
      tentativas,
      miolo
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
