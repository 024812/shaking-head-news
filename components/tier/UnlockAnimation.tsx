/**
 * UnlockAnimation Component
 * 登录解锁动画组件
 */

'use client'

import { useEffect, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnlockAnimationProps {
  /** 是否显示动画 */
  show: boolean
  /** 动画结束回调 */
  onComplete?: () => void
  /** 显示的文本 */
  message?: string
  /** 自定义样式类 */
  className?: string
}

/**
 * 解锁动画组件
 * 登录成功后播放简短动画
 */
export function UnlockAnimation({
  show,
  onComplete,
  message = '解锁成功！',
  className,
}: UnlockAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setIsAnimating(true)

      // 动画持续时间
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(() => {
          setIsVisible(false)
          onComplete?.()
        }, 300) // 淡出时间
      }, 2000) // 显示时间

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isAnimating ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-4 transition-all duration-500',
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {/* 动画图标 */}
        <div className="relative">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full bg-primary transition-all duration-500',
              isAnimating && 'animate-bounce'
            )}
          >
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>

          {/* 闪光效果 */}
          <Sparkles
            className={cn(
              'absolute -right-2 -top-2 h-6 w-6 text-yellow-500 transition-all duration-300',
              isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            )}
          />
          <Sparkles
            className={cn(
              'absolute -bottom-1 -left-3 h-5 w-5 text-yellow-500 transition-all delay-100 duration-300',
              isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            )}
          />
          <Sparkles
            className={cn(
              'absolute -right-4 bottom-2 h-4 w-4 text-yellow-500 transition-all delay-200 duration-300',
              isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            )}
          />
        </div>

        {/* 文本 */}
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">{message}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            更多功能已为您解锁
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnlockAnimation
