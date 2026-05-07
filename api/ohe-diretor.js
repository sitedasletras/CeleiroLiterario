export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const { titulo = '', texto = '', tipo = 'prosa', dados = '', imagem = '' } = req.body || {};
    const conteudo = String(texto).slice(0, 12000);

    const prompt = `Escreva o miolo A4 em portugues, sem JSON e sem explicacoes. Use o titulo, o tipo, os dados e o texto base abaixo. Nao inclua capa, sumario, ficha ou biografia.\n\nTitulo: ${titulo}\nTipo: ${tipo}\nDados: ${dados}\nTexto base:\n${conteudo}`;

    const content = [{ type: 'input_text', text: prompt }];
    if (imagem && typeof imagem === 'string' && imagem.startsWith('data:image/')) {
      content.push({ type: 'input_image', image_url: imagem });
    }

    const resposta = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [{ role: 'user', content }],
        temperature: 0.7,
        max_output_tokens: 6000
      })
    });

    const data = await resposta.json();
    if (!resposta.ok) return res.status(resposta.status).json({ error: data.error?.message || 'Erro OpenAI' });

    return res.status(200).json({ ok: true, analise: data.output_text || '', miolo: data.output_text || '' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
