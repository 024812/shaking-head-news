'use client'

import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'

interface ChartData {
  date: string
  count: number
  duration: number
}

interface StatsChartProps {
  data: ChartData[]
  type: 'week' | 'month'
}

/**
 * 统计图表组件
 * 需求: 8.5 - 使用 Recharts 提供可视化图表展示运动趋势
 */
export function StatsChart({ data, type }: StatsChartProps) {
  const t = useTranslations('stats')
  const { theme } = useTheme()

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 准备图表数据
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    [t('rotationCount')]: item.count,
    [t('duration')]: Math.round(item.duration / 60), // 转换为分钟
  }))

  // 主题颜色
  const colors = {
    primary: theme === 'dark' ? '#60a5fa' : '#3b82f6',
    secondary: theme === 'dark' ? '#34d399' : '#10b981',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
  }

  // 自定义 Tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === t('duration') && ` ${t('minutes')}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (type === 'week') {
    // 本周使用柱状图
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="date" stroke={colors.text} fontSize={12} tickLine={false} />
          <YAxis stroke={colors.text} fontSize={12} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={t('rotationCount')} fill={colors.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // 本月使用折线图
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="date" stroke={colors.text} fontSize={12} tickLine={false} />
        <YAxis stroke={colors.text} fontSize={12} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={t('rotationCount')}
          stroke={colors.primary}
          strokeWidth={2}
          dot={{ fill: colors.primary, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey={t('duration')}
          stroke={colors.secondary}
          strokeWidth={2}
          dot={{ fill: colors.secondary, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
