'use client'

import {
  Document,
  PDFDownloadLink,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import { DIMENSION_LABELS, DIMENSION_ORDER } from '@/constants/dimensions'

const styles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontSize: 11,
    color: '#0f172a',
    lineHeight: 1.5,
  },
  header: {
    position: 'absolute',
    top: 18,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 10,
    color: '#475569',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  smallLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 11,
    color: '#334155',
  },
})

function ReportPdfDocument({
  orgSize,
  industry,
  generatedAt,
  maturityLevel,
  maturityLabel,
  overallScore,
  accentColor,
  report,
  dimensionScores,
}) {
  const strengths = report.keyStrengths || []
  const gaps = report.keyGaps || []
  const opportunities = report.immediateOpportunities || []
  const risks = report.risksAndBlockers || []

  return (
    <Document title="AI Maturity Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>AI Maturity Report</Text>
          <Text style={styles.headerText}>{generatedAt}</Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.title, { color: accentColor }]}>
            AI Maturity Assessment Report
          </Text>
          <Text style={styles.subtitle}>
            {`${industry} | ${orgSize} | Level ${maturityLevel} - ${maturityLabel} | Score ${Number(overallScore).toFixed(2)}/5.0`}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.body}>{report.executiveSummary}</Text>
          <Text style={[styles.body, { marginTop: 10 }]}>
            {report.maturityNarrative}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          {DIMENSION_ORDER.map((dimension) => (
            <View key={dimension} style={styles.card}>
              <View style={styles.row}>
                <Text>{DIMENSION_LABELS[dimension]}</Text>
                <Text>{Number(dimensionScores?.[dimension] || 0).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>AI Maturity Report</Text>
          <Text style={styles.headerText}>{generatedAt}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Strengths</Text>
          {strengths.map((item) => (
            <View key={item.headline} style={styles.card}>
              <Text>{item.headline}</Text>
              <Text style={styles.smallLabel}>{`${DIMENSION_LABELS[item.dimension] || item.dimension} | Score ${Number(item.score || 0).toFixed(2)}`}</Text>
              <Text style={styles.body}>{item.insight}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Gaps</Text>
          {gaps.map((item) => (
            <View key={item.headline} style={styles.card}>
              <Text>{item.headline}</Text>
              <Text style={styles.smallLabel}>
                {`${DIMENSION_LABELS[item.dimension] || item.dimension} | Score ${Number(item.score || 0).toFixed(2)}${item.isBlocker ? ' | BLOCKER' : ''}`}
              </Text>
              <Text style={styles.body}>{item.risk}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opportunities</Text>
          {opportunities.map((item) => (
            <View key={item.title} style={styles.card}>
              <Text>{item.title}</Text>
              <Text style={styles.smallLabel}>{item.timeframe}</Text>
              <Text style={styles.body}>{item.description}</Text>
              <Text style={[styles.body, { marginTop: 6 }]}>
                {`Impact: ${item.estimatedImpact}`}
              </Text>
              <Text style={styles.body}>{`Prerequisite: ${item.prerequisite}`}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>AI Maturity Report</Text>
          <Text style={styles.headerText}>{generatedAt}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks</Text>
          {risks.map((item, index) => (
            <View key={`${item.risk}-${index}`} style={styles.card}>
              <Text>{item.risk}</Text>
              <Text style={styles.smallLabel}>{item.severity}</Text>
              <Text style={styles.body}>{item.mitigation}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roadmap</Text>
          <Text style={styles.body}>{report.roadmapRecommendation}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default function PDFDownloadButton({ orgSize, industry, maturityLevel, maturityLabel, overallScore, accentColor, report, dimensionScores }) {
  const generatedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <PDFDownloadLink
      document={
        <ReportPdfDocument
          orgSize={orgSize}
          industry={industry}
          generatedAt={generatedAt}
          maturityLevel={maturityLevel}
          maturityLabel={maturityLabel}
          overallScore={overallScore}
          accentColor={accentColor}
          report={report}
          dimensionScores={dimensionScores}
        />
      }
      fileName={`ai-maturity-report-${industry}-${maturityLevel}.pdf`}
      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
    >
      {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF Report')}
    </PDFDownloadLink>
  )
}
