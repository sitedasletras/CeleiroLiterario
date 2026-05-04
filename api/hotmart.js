import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const data = req.body;

  if (data.status === 'APPROVED') {
    const email = data.buyer?.email;
    const produto = data.product?.name || '';

    let tempo = 0;
    if (produto.includes('10')) tempo = 10;
    if (produto.includes('20')) tempo = 20;
    if (produto.includes('30')) tempo = 30;
    if (produto.includes('60')) tempo = 60;

    if (email && tempo > 0) {
      await kv.set(email, tempo);
    }
  }

  return res.status(200).json({ ok: true });
}