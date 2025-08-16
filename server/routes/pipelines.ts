import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(['llm','tool','eval','data','router']),
  label: z.string(),
  config: z.record(z.string(), z.any()).default({})
});

const edgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  condition: z.string().optional(),
});

const pipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema)
});

type Pipeline = z.infer<typeof pipelineSchema>;

const store = new Map<string, Pipeline>();

router.get('/pipelines', (req, res) => {
  res.json(Array.from(store.values()))
});

router.post('/pipelines', (req, res) => {
  const parsed = pipelineSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  store.set(parsed.data.id, parsed.data)
  res.status(201).json(parsed.data)
});

router.get('/pipelines/:id', (req, res) => {
  const p = store.get(req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
});

router.put('/pipelines/:id', (req, res) => {
  const parsed = pipelineSchema.safeParse({ ...req.body, id: req.params.id })
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })
  store.set(parsed.data.id, parsed.data)
  res.json(parsed.data)
});

router.delete('/pipelines/:id', (req, res) => {
  store.delete(req.params.id)
  res.status(204).send()
});

export default router;
