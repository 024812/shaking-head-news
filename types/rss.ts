import { z } from 'zod'

export const RSSSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  language: z.enum(['zh', 'en']),
  enabled: z.boolean(),
  tags: z.array(z.string()),
  order: z.number(),
  lastFetchedAt: z.string().datetime().optional(),
  failureCount: z.number().default(0),
})

export type RSSSource = z.infer<typeof RSSSourceSchema>
