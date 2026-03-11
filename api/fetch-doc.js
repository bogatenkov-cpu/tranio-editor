export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Google Docs
    const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      const docId = docsMatch[1];
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const resp = await fetch(exportUrl);
      if (!resp.ok) throw new Error('Не удалось открыть документ. Проверьте, что доступ по ссылке включён.');
      const text = await resp.text();
      return res.status(200).json({ type: 'text', content: text });
    }

    // Google Slides — export as PDF, send as base64
    const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slidesMatch) {
      const slideId = slidesMatch[1];
      const exportUrl = `https://docs.google.com/presentation/d/${slideId}/export/pdf`;
      const resp = await fetch(exportUrl);
      if (!resp.ok) throw new Error('Не удалось открыть презентацию. Проверьте, что доступ по ссылке включён.');
      const buffer = await resp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return res.status(200).json({ type: 'pdf', content: base64 });
    }

    return res.status(400).json({ error: 'Поддерживаются только ссылки на Google Docs и Google Slides' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
