import { Router } from 'express';
import { transform } from 'esbuild';

const router = Router();

router.post('/code/compile', async (req, res) => {
  try {
    const { code, language = 'ts', target = 'es2020' } = req.body || {};
    if (typeof code !== 'string' || code.length === 0) {
      return res.status(400).json({ error: 'Missing code' });
    }
    const loader = language === 'ts' ? 'ts' : language === 'tsx' ? 'tsx' : 'js';
    const result = await transform(code, { loader: loader as any, target: target as any, format: 'esm' });
    res.json({ ok: true, warnings: result.warnings?.length || 0, code: result.code, map: result.map });
  } catch (err: any) {
    res.status(200).json({ ok: false, error: err?.message || String(err) });
  }
});

export default router;
