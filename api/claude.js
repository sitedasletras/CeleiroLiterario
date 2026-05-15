export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — permite chamada do GitHub Pages do Celeiro
  res.setHeader('Access-Control-Allow-Origin', 'https://sitedasletras.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) {
    return res.status(500).json({ error: 'Chave não configurada no servidor.' });
  }

  try {
    const resposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': chave,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const dados = await resposta.json();
    return res.status(resposta.status).json(dados);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
