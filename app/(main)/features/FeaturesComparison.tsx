/**
 * FeaturesComparison Component
 * 功能对比客户端组件
 */

'use client'

import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { Check, X, Eye, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UserTier } from '@/lib/config/features'
import { cn } from '@/lib/utils'

interface FeaturesComparisonProps {
  currentTier: UserTier
}

type FeatureValue = 'included' | 'not-included' | 'preview' | string

interface Feature {
  key: string
  guest: FeatureValue
  member: FeatureValue
  pro: FeatureValue
}

/**
 * 功能对比组件
 */
export function FeaturesComparison({ currentTier }: FeaturesComparisonProps) {
  const t = useTranslations('features')

  // 功能列表
  const features: Feature[] = [
    { key: 'instantUse', guest: 'included', member: 'not-included', pro: 'not-included' },
    { key: 'newsSources', guest: t('featureValues.defaultOnly'), member: t('featureValues.customRss'), pro: t('featureValues.customRssOpml') },
    { key: 'rotationMode', guest: t('featureValues.continuousFixed'), member: t('featureValues.selectable'), pro: t('featureValues.selectable') },
    { key: 'rotationInterval', guest: t('featureValues.fixed30s'), member: t('featureValues.adjustable5to60'), pro: t('featureValues.adjustable5to60') },
    { key: 'rotationAngle', guest: t('featureValues.fixed15deg'), member: t('featureValues.adjustable8to25'), pro: t('featureValues.adjustable8to25') },
    { key: 'pauseRotation', guest: 'included', member: 'included', pro: 'included' },
    { key: 'fontSize', guest: t('featureValues.mediumFixed'), member: t('featureValues.adjustable4levels'), pro: t('featureValues.adjustable4levels') },
    { key: 'layoutMode', guest: t('featureValues.defaultLayout'), member: t('featureValues.compactNormal'), pro: t('featureValues.compactNormal') },
    { key: 'darkMode', guest: t('featureValues.manualSwitch'), member: 'included', pro: 'included' },
    { key: 'multiLanguage', guest: 'included', member: 'included', pro: 'included' },
    { key: 'ads', guest: t('featureValues.forceShow'), member: t('featureValues.forceShow'), pro: t('featureValues.canDisable') },
    { key: 'cloudSync', guest: 'not-included', member: 'included', pro: 'included' },
    { key: 'statistics', guest: 'not-included', member: 'preview', pro: 'included' },
    { key: 'healthReminders', guest: 'not-included', member: 'not-included', pro: 'included' },
    { key: 'exerciseGoals', guest: 'not-included', member: 'not-included', pro: 'included' },
    { key: 'keyboardShortcuts', guest: 'not-included', member: 'not-included', pro: 'included' },
    { key: 'progressSave', guest: t('featureValues.sessionOnly'), member: t('featureValues.permanent'), pro: t('featureValues.permanent') },
    { key: 'userBadge', guest: t('featureValues.none'), member: t('featureValues.memberBadge'), pro: t('featureValues.proBadge') },
  ]

  return (
    <div className="space-y-8">
      {/* 定价卡片 - 移动端 */}
      <div className="grid gap-6 md:hidden">
        <TierCard
          tier="guest"
          title={t('guestTitle')}
          price={t('guestPrice')}
          description={t('guestDescription')}
          isCurrent={currentTier === 'guest'}
          features={features}
          t={t}
        />
        <TierCard
          tier="member"
          title={t('memberTitle')}
          price={t('memberPrice')}
          description={t('memberDescription')}
          isCurrent={currentTier === 'member'}
          isHighlighted
          features={features}
          t={t}
        />
        <TierCard
          tier="pro"
          title={t('proTitle')}
          price={t('proPrice')}
          description={t('proDescription')}
          isCurrent={currentTier === 'pro'}
          isComingSoon
          features={features}
          t={t}
        />
      </div>

      {/* 功能对比表格 - 桌面端 */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            {/* 表头 */}
            <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 p-4">
              <div className="font-semibold">功能</div>
              <div className="text-center">
                <div className="font-semibold">{t('guestTitle')}</div>
                <div className="text-sm text-muted-foreground">{t('guestPrice')}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">{t('memberTitle')}</div>
                <div className="text-sm text-muted-foreground">{t('memberPrice')}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  {t('proTitle')}
                </div>
                <div className="text-sm text-muted-foreground">{t('proPrice')}</div>
              </div>
            </div>

            {/* 功能行 */}
            {features.map((feature, index) => (
              <div
                key={feature.key}
                className={cn(
                  'grid grid-cols-4 gap-4 p-4',
                  index !== features.length - 1 && 'border-b'
                )}
              >
                <div className="font-medium">{t(`featureList.${feature.key}`)}</div>
                <div className="flex justify-center">
                  <FeatureValueDisplay value={feature.guest} />
                </div>
                <div className="flex justify-center">
                  <FeatureValueDisplay value={feature.member} />
                </div>
                <div className="flex justify-center">
                  <FeatureValueDisplay value={feature.pro} />
                </div>
              </div>
            ))}

            {/* 操作按钮行 */}
            <div className="grid grid-cols-4 gap-4 border-t bg-muted/30 p-4">
              <div />
              <div className="flex justify-center">
                {currentTier === 'guest' ? (
                  <Button variant="outline" disabled>
                    {t('currentPlan')}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    {t('guestTitle')}
                  </Button>
                )}
              </div>
              <div className="flex justify-center">
                {currentTier === 'member' ? (
                  <Button disabled>{t('currentPlan')}</Button>
                ) : currentTier === 'guest' ? (
                  <Button onClick={() => signIn()}>{t('loginFree')}</Button>
                ) : (
                  <Button variant="outline" disabled>
                    {t('memberTitle')}
                  </Button>
                )}
              </div>
              <div className="flex justify-center">
                <Button variant="outline" disabled>
                  {t('comingSoon')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * 功能值显示组件
 */
function FeatureValueDisplay({ value }: { value: FeatureValue }) {
  if (value === 'included') {
    return <Check className="h-5 w-5 text-green-500" />
  }
  if (value === 'not-included') {
    return <X className="h-5 w-5 text-muted-foreground/40" />
  }
  if (value === 'preview') {
    return (
      <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
        <Eye className="h-4 w-4" />
        <span className="text-xs">预览</span>
      </span>
    )
  }
  return <span className="text-sm text-muted-foreground">{value}</span>
}

/**
 * 层级卡片组件（移动端）
 */
function TierCard({
  tier,
  title,
  price,
  description,
  isCurrent,
  isHighlighted,
  isComingSoon,
  features,
  t,
}: {
  tier: UserTier
  title: string
  price: string
  description: string
  isCurrent: boolean
  isHighlighted?: boolean
  isComingSoon?: boolean
  features: Feature[]
  t: ReturnType<typeof useTranslations<'features'>>
}) {
  // 获取该层级的功能
  const tierFeatures = features.map((f) => ({
    name: t(`featureList.${f.key}`),
    value: f[tier],
  }))

  return (
    <Card className={cn(isHighlighted && 'border-primary shadow-lg')}>
      {isHighlighted && (
        <div className="bg-primary text-primary-foreground py-1 text-center text-sm font-medium">
          推荐
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {tier === 'pro' && <Sparkles className="h-4 w-4" />}
          {title}
        </CardTitle>
        <div className="text-2xl font-bold">{price}</div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tierFeatures.slice(0, 8).map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <FeatureValueDisplay value={feature.value} />
              <span className={feature.value === 'not-included' ? 'text-muted-foreground' : ''}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            {t('currentPlan')}
          </Button>
        ) : isComingSoon ? (
          <Button variant="outline" className="w-full" disabled>
            {t('comingSoon')}
          </Button>
        ) : tier === 'member' ? (
          <Button className="w-full" onClick={() => signIn()}>
            {t('loginFree')}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            {title}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
