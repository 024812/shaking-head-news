/**
 * FeatureRow Component
 * 功能对比行组件
 */

'use client'

import { Check, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FeatureValue = 'included' | 'not-included' | 'preview' | string

interface FeatureRowProps {
  /** 功能名称 */
  name: string
  /** Guest 层级的值 */
  guest: FeatureValue
  /** Member 层级的值 */
  member: FeatureValue
  /** Pro 层级的值 */
  pro: FeatureValue
  /** 是否为最后一行 */
  isLast?: boolean
}

/**
 * 功能对比行
 */
export function FeatureRow({ name, guest, member, pro, isLast }: FeatureRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-4 gap-4 py-3 text-sm',
        !isLast && 'border-b border-border/50'
      )}
    >
      <div className="font-medium">{name}</div>
      <div className="text-center">
        <FeatureValue value={guest} />
      </div>
      <div className="text-center">
        <FeatureValue value={member} />
      </div>
      <div className="text-center">
        <FeatureValue value={pro} />
      </div>
    </div>
  )
}

/**
 * 功能值显示
 */
function FeatureValue({ value }: { value: FeatureValue }) {
  if (value === 'included') {
    return (
      <span className="inline-flex items-center justify-center">
        <Check className="h-4 w-4 text-green-500" />
      </span>
    )
  }

  if (value === 'not-included') {
    return (
      <span className="inline-flex items-center justify-center">
        <X className="h-4 w-4 text-muted-foreground/50" />
      </span>
    )
  }

  if (value === 'preview') {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-500">
        <Eye className="h-3 w-3" />
        <span className="text-xs">预览</span>
      </span>
    )
  }

  // 自定义文本值
  return <span className="text-xs text-muted-foreground">{value}</span>
}

/**
 * 功能对比表头
 */
export function FeatureTableHeader() {
  return (
    <div className="grid grid-cols-4 gap-4 border-b border-border py-3 text-sm font-semibold">
      <div>功能</div>
      <div className="text-center">访客</div>
      <div className="text-center">会员</div>
      <div className="text-center">Pro</div>
    </div>
  )
}

export default FeatureRow
