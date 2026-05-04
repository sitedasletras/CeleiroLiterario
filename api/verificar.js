import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ erro: 'Email obrigatório' });

  const tempo = await kv.get(email);

  if (!tempo) {
    return res.status(200).json({ pago: false, tempo: 0 });
  }

  return res.status(200).json({ pago: true, tempo });
}