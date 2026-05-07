export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY ausente no servidor' });

    const { titulo = '', texto = '', tipo = 'prosa', dados = '', imagem = '' } = req.body || {};
    const conteudo = String(texto || '').slice(0, 12000);
    const dadosEntrada = String(dados || '').slice(0, 12000);

    const prompt = `Voce e o escritor literario do OHE. Escreva a OBRA FINAL diretamente.

PROIBIDO:
- explicar o que o texto fara;
- escrever frases como "o primeiro texto acompanha", "o segundo texto assume", "este texto trata", "a narrativa deve";
- entregar analise, plano, resumo, sinopse, comentario ou promessa;
- usar JSON, markdown, listas tecnicas, ficha, biografia, capa ou sumario.

OBRIGATORIO:
- entregar somente literatura pronta;
- se o pedido solicitar 3 textos, escreva 3 textos completos com titulos proprios;
- se for prosa, escreva cenas, personagens, narracao e desenvolvimento emocional;
- se for poesia ou cordel, escreva em versos e estrofes;
- se for imagem de antologia/concurso/edital, trate como oportunidade editorial completa;
- se o tema for culinaria, comida, faca, fogo, familia, memoria ou afeto, transforme isso em obra literaria, nao em explicacao;
- comece diretamente pelo titulo do primeiro texto ou pelo corpo literario.

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
        temperature: 0.78,
        max_output_tokens: 7000
      })
    });

    const data = await resposta.json();
    if (!resposta.ok) return res.status(resposta.status).json({ error: data.error?.message || 'Erro OpenAI' });

    let miolo = data.output_text || '';
    const proibidos = [
      'o primeiro texto acompanha',
      'o segundo texto assume',
      'o terceiro texto observa',
      'este texto trata',
      'a narrativa deve',
      'base recebida'
    ];
    const baixo = miolo.toLowerCase();
    if (proibidos.some(p => baixo.includes(p))) {
      miolo = miolo
        .replace(/O primeiro texto acompanha/gi, '')
        .replace(/O segundo texto assume/gi, '')
        .replace(/O terceiro texto observa/gi, '')
        .replace(/Base recebida:[\s\S]*?(\n\n|$)/gi, '')
        .trim();
    }

    return res.status(200).json({ ok: true, analise: miolo, miolo });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
