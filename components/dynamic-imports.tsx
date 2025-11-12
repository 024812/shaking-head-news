/**
 * Dynamic imports for heavy components to enable code splitting
 * This reduces the initial bundle size and improves page load performance
 */

import dynamic from 'next/dynamic'

// Settings Panel - Heavy component with many UI controls
export const DynamicSettingsPanel = dynamic(
  () => import('@/components/settings/SettingsPanel').then((mod) => mod.SettingsPanel),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false, // Settings panel is client-only
  }
)

// Stats Chart - Heavy component with Recharts library
export const DynamicStatsChart = dynamic(
  () => import('@/components/stats/StatsChart').then((mod) => mod.StatsChart),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false, // Charts are client-only
  }
)

// RSS Source List - Heavy component with drag-and-drop
export const DynamicRSSSourceList = dynamic(
  () => import('@/components/rss/RSSSourceList').then((mod) => mod.RSSSourceList),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false,
  }
)

// Add RSS Source Dialog - Only loaded when needed
export const DynamicAddRSSSourceDialog = dynamic(
  () => import('@/components/rss/AddRSSSourceDialog').then((mod) => mod.AddRSSSourceDialog),
  {
    loading: () => null,
    ssr: false,
  }
)

// Health Reminder - Only loaded when notifications are enabled
export const DynamicHealthReminder = dynamic(
  () => import('@/components/stats/HealthReminder').then((mod) => mod.HealthReminder),
  {
    loading: () => null,
    ssr: false,
  }
)
