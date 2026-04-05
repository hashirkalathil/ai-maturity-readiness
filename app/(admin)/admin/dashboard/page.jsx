import StatsRow from '@/components/admin/StatsRow'
import DimensionAvgRadar from '@/components/admin/DimensionAvgRadar'
import DimensionHeatmap from '@/components/admin/DimensionHeatmap'
import IndustryBreakdownChart from '@/components/admin/IndustryBreakdownChart'
import MaturityDistributionChart from '@/components/admin/MaturityDistributionChart'
import ScoreTrendChart from '@/components/admin/ScoreTrendChart'
import { DIMENSION_ORDER, MATURITY_LEVELS } from '@/constants/dimensions'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function formatIndustryLabel(industry) {
  return String(industry || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function getDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10)
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: responses = [] } = await supabase
    .from('responses')
    .select('session_id, industry, overall_score, maturity_level, dimension_scores, completed_at')
    .order('completed_at', { ascending: false })

  const totalResponses = responses.length
  const averageScore =
    totalResponses === 0
      ? 0
      : responses.reduce((sum, item) => sum + Number(item.overall_score || 0), 0) /
        totalResponses

  const levelCounts = MATURITY_LEVELS.map((level) => ({
    level: level.level,
    label: level.label,
    shortLabel: `L${level.level}`,
    count: responses.filter((item) => Number(item.maturity_level) === level.level).length,
  }))
  const mostCommonLevel = [...levelCounts].sort((left, right) => right.count - left.count)[0]

  const industryMap = new Map()
  const dimensionAverages = Object.fromEntries(DIMENSION_ORDER.map((dimension) => [dimension, 0]))
  const heatmapMap = new Map()

  responses.forEach((response) => {
    const industry = response.industry
    const label = formatIndustryLabel(industry)
    const current = industryMap.get(industry) || {
      industry,
      label,
      totalScore: 0,
      count: 0,
    }
    current.totalScore += Number(response.overall_score || 0)
    current.count += 1
    industryMap.set(industry, current)

    const heatmapEntry = heatmapMap.get(industry) || {
      industry,
      label,
      count: 0,
      sums: Object.fromEntries(DIMENSION_ORDER.map((dimension) => [dimension, 0])),
    }
    heatmapEntry.count += 1

    DIMENSION_ORDER.forEach((dimension) => {
      const score = Number(response.dimension_scores?.[dimension] || 0)
      dimensionAverages[dimension] += score
      heatmapEntry.sums[dimension] += score
    })

    heatmapMap.set(industry, heatmapEntry)
  })

  const industryData = [...industryMap.values()]
    .map((item) => ({
      ...item,
      avgScore: item.count ? item.totalScore / item.count : 0,
    }))
    .sort((left, right) => right.avgScore - left.avgScore)

  const topIndustry = industryData[0]

  const today = new Date()
  const trendDays = Array.from({ length: 30 }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (29 - index))
    const key = date.toISOString().slice(0, 10)
    return {
      key,
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      count: 0,
      totalScore: 0,
      avgScore: 0,
    }
  })
  const trendMap = new Map(trendDays.map((item) => [item.key, item]))

  responses.forEach((response) => {
    const key = getDateKey(response.completed_at)
    const trend = trendMap.get(key)

    if (trend) {
      trend.count += 1
      trend.totalScore += Number(response.overall_score || 0)
      trend.avgScore = trend.count ? trend.totalScore / trend.count : 0
    }
  })

  const now = new Date()
  const last7Start = new Date(now)
  last7Start.setDate(now.getDate() - 7)
  const prior7Start = new Date(now)
  prior7Start.setDate(now.getDate() - 14)

  const last7 = responses.filter(
    (response) => new Date(response.completed_at) >= last7Start
  ).length
  const prior7 = responses.filter((response) => {
    const completedAt = new Date(response.completed_at)
    return completedAt >= prior7Start && completedAt < last7Start
  }).length
  const growthPercent =
    prior7 === 0 ? (last7 > 0 ? 100 : 0) : ((last7 - prior7) / prior7) * 100

  const avgDimensionData = Object.fromEntries(
    DIMENSION_ORDER.map((dimension) => [
      dimension,
      totalResponses ? dimensionAverages[dimension] / totalResponses : 0,
    ])
  )

  const heatmapData = [...heatmapMap.values()].map((item) => ({
    industry: item.industry,
    label: item.label,
    ...Object.fromEntries(
      DIMENSION_ORDER.map((dimension) => [
        dimension,
        item.count ? item.sums[dimension] / item.count : 0,
      ])
    ),
  }))

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xl font-bold uppercase tracking-wider text-gray-900">
          Admin Dashboard
        </p>
      </div>

      <StatsRow
        totalResponses={totalResponses}
        growthPercent={growthPercent}
        averageScore={averageScore}
        mostCommonLevel={mostCommonLevel}
        topIndustry={topIndustry}
      />

      <div className="grid gap-6 grid-cols-2">
        <MaturityDistributionChart data={levelCounts} />
        <IndustryBreakdownChart data={industryData} />
      </div>


      <div className="grid grid-cols-1">
        <DimensionHeatmap data={heatmapData} />
      </div>
    </div>
  )
}
