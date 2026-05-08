import { montarPromptOHE, limparMetatexto, detectarForma, extrairQuantidade, validarForma } from './ohe-motores.js';

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
  if (/cordel|sextilha|septilha|oitava|décima|decima|martelo|galope/.test(t)) return 'linha de cordel';
  if (/haikai|haicai|tanka|senryu|soneto|ode|elegia|poesia|poema|verso/.test(t)) return 'linha poetica';
  if (/conto|romance|novela|crônica|cronica|prosa|narrativa/.test(t)) return 'linha de prosa';
  if (/hibrido|híbrido|prosa poetica|prosa poética/.test(t)) return 'linha hibrida';
  return 'linha nova a ser catalogada';
}

function promptHumanizacao(miolo, forma) {
  return `Refine o texto abaixo sem mudar a forma ${forma}. Remova explicacoes, frases genericas e metatexto. Preserve a estrutura formal. Entregue somente o texto final.\n\n${miolo}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const { titulo = '', texto = '', tipo = 'prosa', forma: formaEntrada = '', quantidade = '', memoria = '', heteronimo = '', dados = '', imagem = '' } = req.body || {};
    const temImagem = Boolean(imagem && typeof imagem === 'string' && imagem.startsWith('data:image/'));
    const dadosEntrada = String(dados || '').slice(0, 12000);
    const conteudo = String(texto || '').slice(0, 12000);
    const forma = detectarForma({ tipo, forma: formaEntrada, dados: `${dadosEntrada}\n${titulo}\n${conteudo}` });
    const qtdDetectada = Number(quantidade) || extrairQuantidade(`${dadosEntrada}\n${memoria}`) || null;
    const linha = escolherLinha({ tipo, forma, dados: dadosEntrada, memoria, indicado: heteronimo });

    const prompt = montarPromptOHE({ titulo, tipo, forma, dados: `${dadosEntrada}\nLinha autoral: ${linha}`, texto: conteudo, memoria, temImagem });
    const content = [{ type: 'input_text', text: prompt }];
    if (temImagem) content.push({ type: 'input_image', image_url: imagem });

    let miolo = limparMetatexto(await chamarOpenAI({ apiKey, content }));
    let validacao = validarForma(miolo, forma, qtdDetectada);
    let tentativas = 1;

    while (!validacao.ok && tentativas < 3) {
      const reparo = `${prompt}\n\nA saida anterior falhou: ${validacao.motivo}. Reescreva obedecendo a forma ${forma}${qtdDetectada ? ` e quantidade ${qtdDetectada}` : ''}. Somente obra final.`;
      const repairContent = [{ type: 'input_text', text: reparo }];
      if (temImagem) repairContent.push({ type: 'input_image', image_url: imagem });
      miolo = limparMetatexto(await chamarOpenAI({ apiKey, content: repairContent, temperature: 0.55 }));
      validacao = validarForma(miolo, forma, qtdDetectada);
      tentativas += 1;
    }

    if (validacao.ok) {
      const humanContent = [{ type: 'input_text', text: promptHumanizacao(miolo, forma) }];
      miolo = limparMetatexto(await chamarOpenAI({ apiKey, content: humanContent, temperature: 0.45 }));
      validacao = validarForma(miolo, forma, qtdDetectada);
    }

    return res.status(200).json({ ok: true, forma, quantidade: qtdDetectada, linha, validacao, tentativas, analise: miolo, miolo });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
