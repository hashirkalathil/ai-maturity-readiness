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
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 11,
    color: '#0f172a',
    lineHeight: 1.5,
  },

  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
  },

  headerText: {
    fontSize: 9,
    color: '#64748b',
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#64748b',
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 11,
    marginBottom: 2,
    color: '#334155',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 10,
  },

  body: {
    fontSize: 11,
    color: '#334155',
    marginTop: 4,
  },

  smallLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 6,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
  },

  reportItem: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
})

function ReportPdfDocument({
  respondentName,
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

      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>AI Maturity Report</Text>
          <Text style={styles.headerText}>{generatedAt}</Text>
        </View>

        <Text style={[styles.title, { color: accentColor }]}>
          AI Maturity Assessment Report
        </Text>

        <Text style={styles.subtitle}>Industry: {industry}</Text>
        <Text style={styles.subtitle}>Organization Size: {orgSize}</Text>
        {respondentName ? (
          <Text style={styles.subtitle}>Prepared for: {respondentName}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          Maturity Level: {maturityLevel} – {maturityLabel}
        </Text>
        <Text style={styles.subtitle}>
          Overall Score: {Number(overallScore).toFixed(2)} / 5.0
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Executive Summary</Text>
          <Text style={styles.body}>{report.executiveSummary}</Text>
          <Text style={styles.body}>{report.maturityNarrative}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Score Breakdown</Text>
          {DIMENSION_ORDER.map((dimension) => (
            <View key={dimension} style={styles.tableRow}>
              <Text>{DIMENSION_LABELS[dimension]}</Text>
              <Text>
                {Number(dimensionScores?.[dimension] || 0).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>AI Maturity Report</Text>
          <Text style={styles.headerText}>{generatedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Key Strengths</Text>
          {strengths.map((item) => (
            <View key={item.headline} style={styles.reportItem}>
              <Text style={{ fontWeight: 700 }}>{item.headline}</Text>
              <Text style={styles.smallLabel}>
                {DIMENSION_LABELS[item.dimension] || item.dimension} | Score{' '}
                {Number(item.score || 0).toFixed(2)}
              </Text>
              <Text style={styles.body}>{item.insight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Key Gaps</Text>
          {gaps.map((item) => (
            <View key={item.headline} style={styles.reportItem}>
              <Text style={{ fontWeight: 700 }}>{item.headline}</Text>
              <Text style={styles.smallLabel}>
                {DIMENSION_LABELS[item.dimension] || item.dimension} | Score{' '}
                {Number(item.score || 0).toFixed(2)}
                {item.isBlocker ? ' | BLOCKER' : ''}
              </Text>
              <Text style={styles.body}>{item.risk}</Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* PAGE 3 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>AI Maturity Report</Text>
          <Text style={styles.headerText}>{generatedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Opportunities</Text>
          {opportunities.map((item) => (
            <View key={item.title} style={styles.reportItem}>
              <Text style={{ fontWeight: 700 }}>{item.title}</Text>
              <Text style={styles.smallLabel}>
                Timeframe: {item.timeframe}
              </Text>
              <Text style={styles.body}>{item.description}</Text>
              <Text style={styles.body}>
                Impact: {item.estimatedImpact}
              </Text>
              <Text style={styles.body}>
                Prerequisite: {item.prerequisite}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Risks</Text>
          {risks.map((item, index) => (
            <View key={`${item.risk}-${index}`} style={styles.reportItem}>
              <Text style={{ fontWeight: 700 }}>{item.risk}</Text>
              <Text style={styles.smallLabel}>
                Severity: {item.severity}
              </Text>
              <Text style={styles.body}>
                Mitigation: {item.mitigation}
              </Text>
              {item.triggersDimension && (
                <Text style={styles.smallLabel}>
                  Triggered by {item.triggersDimension}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Roadmap</Text>
          <Text style={styles.body}>{report.roadmapRecommendation}</Text>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}

export default function PDFDownloadButton({
  respondentName,
  orgSize,
  industry,
  maturityLevel,
  maturityLabel,
  overallScore,
  accentColor,
  report,
  dimensionScores,
}) {
  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PDFDownloadLink
      document={
        <ReportPdfDocument
          respondentName={respondentName}
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
      {({ loading }) =>
        loading ? 'Preparing PDF...' : 'Download PDF Report'
      }
    </PDFDownloadLink>
  )
}
