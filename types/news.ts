import { z } from 'zod'

// 实际 API 返回的格式
export const RawNewsResponseSchema = z.object({
  date: z.string(),
  content: z.array(z.string()),
})

export type RawNewsResponse = z.infer<typeof RawNewsResponseSchema>

// 转换后的新闻项格式
export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  source: z.string(),
  publishedAt: z.string(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
})

export type NewsItem = z.infer<typeof NewsItemSchema>

export const NewsResponseSchema = z.object({
  items: z.array(NewsItemSchema),
  total: z.number(),
  updatedAt: z.string(),
})

export type NewsResponse = z.infer<typeof NewsResponseSchema>
