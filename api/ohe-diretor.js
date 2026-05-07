import { montarPromptOHE, limparMetatexto, detectarForma } from './ohe-motores.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const { titulo = '', texto = '', tipo = 'prosa', dados = '', imagem = '' } = req.body || {};
    const temImagem = Boolean(imagem && typeof imagem === 'string' && imagem.startsWith('data:image/'));
    const dadosEntrada = String(dados || '').slice(0, 12000);
    const conteudo = String(texto || '').slice(0, 12000);
    const forma = detectarForma({ tipo, dados: `${dadosEntrada}\n${titulo}\n${conteudo}` });

    const prompt = montarPromptOHE({
      titulo,
      tipo: forma,
      dados: dadosEntrada,
      texto: conteudo,
      temImagem
    });

    const content = [{ type: 'input_text', text: prompt }];
    if (temImagem) content.push({ type: 'input_image', image_url: imagem });

    const resposta = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [{ role: 'user', content }],
        temperature: 0.72,
        max_output_tokens: 7000
      })
    });

    const data = await resposta.json();
    if (!resposta.ok) return res.status(resposta.status).json({ error: data.error?.message || 'Erro OpenAI' });

    const miolo = limparMetatexto(data.output_text || '');
    return res.status(200).json({ ok: true, forma, analise: miolo, miolo });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
