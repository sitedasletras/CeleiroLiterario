export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const { titulo = '', texto = '', tipo = 'ideia', dados = '', imagem = '' } = req.body || {};
    const conteudo = String(texto).slice(0, 12000);

    const prompt = `Voce e a camada interna do OHE. Analise o material sem reescrever a obra. Responda em JSON puro com chaves: forma_detectada, possivel_subforma, diretor_narrativo, sencal, sai, fatos_extraidos_da_imagem, relacao_imagem_texto, diagramador_sugerido, alertas. Considere poesia, prosa, cordel, pantum, ghazal, haicai, ode, sextina, dialogos, estruturas hibridas e material de concurso/edital. Preserve formas fixas e nao trate repeticao estrutural como erro. Se houver imagem, descreva apenas fatos visiveis e possiveis usos literarios, sem inventar.\n\nTitulo: ${titulo}\nTipo declarado: ${tipo}\nDados: ${dados}\nTexto:\n${conteudo}`;

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
        temperature: 0.2
      })
    });

    const data = await resposta.json();
    if (!resposta.ok) return res.status(resposta.status).json({ error: data.error?.message || 'Erro OpenAI' });

    return res.status(200).json({ ok: true, analise: data.output_text || '' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
