export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const { titulo = '', texto = '', tipo = 'prosa', dados = '', imagem = '' } = req.body || {};
    const conteudo = String(texto).slice(0, 12000);
    const dadosEntrada = String(dados || '').slice(0, 12000);

    const prompt = `Voce e o nucleo escritor do OHE. Quando a entrada vier de imagem de chamada, antologia, concurso ou edital, trate como OPORTUNIDADE EDITORIAL COMPLETA, nao como tema solto.

Gere material A4 pronto para submissao literaria.

Regras:
- entregar apenas o texto final, sem JSON e sem explicacoes;
- nao incluir capa, ficha, sumario ou biografia;
- se a imagem/edital pedir tema, transforme em obra completa;
- se pedir 3 textos, gere 3 textos completos, com titulos individuais;
- se for antologia culinaria, explorar memoria, comida, familia, afeto e impacto emocional;
- escolher a forma mais adequada ao pedido, mesmo que o eixo manual esteja diferente;
- preservar poesia em versos quando for poesia; usar paragrafos quando for prosa;
- evitar texto demonstrativo, placeholder ou promessa de escrever depois.

Titulo informado: ${titulo}
Tipo informado: ${tipo}
Dados/direcao: ${dadosEntrada}
Texto base: ${conteudo}`;

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
        temperature: 0.72,
        max_output_tokens: 7000
      })
    });

    const data = await resposta.json();
    if (!resposta.ok) return res.status(resposta.status).json({ error: data.error?.message || 'Erro OpenAI' });

    return res.status(200).json({ ok: true, analise: data.output_text || '', miolo: data.output_text || '' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
