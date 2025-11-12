import { z } from 'zod'

export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  source: z.string(),
  publishedAt: z.string().datetime(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

export type NewsItem = z.infer<typeof NewsItemSchema>

export const NewsResponseSchema = z.object({
  items: z.array(NewsItemSchema),
  total: z.number(),
  updatedAt: z.string().datetime(),
})

export type NewsResponse = z.infer<typeof NewsResponseSchema>
