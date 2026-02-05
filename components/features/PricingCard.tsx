/**
 * PricingCard Component
 * 定价卡片组件
 */

'use client'

import { Check, X, Eye, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { UserTier } from '@/lib/config/features'

export type FeatureStatus = 'included' | 'not-included' | 'preview' | 'custom'

export interface PricingFeature {
  name: string
  guest: FeatureStatus | string
  member: FeatureStatus | string
  pro: FeatureStatus | string
}

interface PricingCardProps {
  tier: UserTier
  isCurrentTier?: boolean
  onAction?: () => void
  className?: string
}

/**
 * 定价卡片组件
 */
export function PricingCard({ tier, isCurrentTier, onAction, className }: PricingCardProps) {
  const t = useTranslations('features')

  const config = {
    guest: {
      title: t('guestTitle'),
      price: t('guestPrice'),
      description: t('guestDescription'),
      buttonText: isCurrentTier ? t('currentPlan') : t('guestTitle'),
      buttonVariant: 'outline' as const,
      highlight: false,
      icon: null,
    },
    member: {
      title: t('memberTitle'),
      price: t('memberPrice'),
      description: t('memberDescription'),
      buttonText: isCurrentTier ? t('currentPlan') : t('loginFree'),
      buttonVariant: 'default' as const,
      highlight: true,
      icon: null,
    },
    pro: {
      title: t('proTitle'),
      price: t('proPrice'),
      description: t('proDescription'),
      buttonText: t('comingSoon'),
      buttonVariant: 'outline' as const,
      highlight: false,
      icon: <Sparkles className="h-4 w-4" />,
    },
  }

  const cardConfig = config[tier]

  const handleClick = () => {
    if (onAction) {
      onAction()
    } else if (tier === 'member' && !isCurrentTier) {
      signIn()
    }
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        cardConfig.highlight && 'border-primary shadow-lg',
        className
      )}
    >
      {cardConfig.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium">
            推荐
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {cardConfig.icon}
          {cardConfig.title}
        </CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{cardConfig.price}</span>
        </div>
        <CardDescription>{cardConfig.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">{/* 功能列表由父组件通过 children 传入 */}</CardContent>

      <CardFooter>
        <Button
          variant={cardConfig.buttonVariant}
          className="w-full"
          onClick={handleClick}
          disabled={isCurrentTier || tier === 'pro'}
        >
          {cardConfig.buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * 功能状态图标
 */
export function FeatureStatusIcon({ status }: { status: FeatureStatus | string }) {
  if (status === 'included') {
    return <Check className="h-4 w-4 text-green-500" />
  }
  if (status === 'not-included') {
    return <X className="text-muted-foreground h-4 w-4" />
  }
  if (status === 'preview') {
    return <Eye className="h-4 w-4 text-yellow-500" />
  }
  // 自定义文本
  return <span className="text-muted-foreground text-xs">{status}</span>
}

export default PricingCard
