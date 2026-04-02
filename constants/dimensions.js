export const DIMENSION_WEIGHTS = {
  businessStrategy: 0.2,
  dataReadiness: 0.2,
  technologyInfrastructure: 0.15,
  talentSkills: 0.15,
  useCaseReadiness: 0.1,
  operationalReadiness: 0.1,
  aiGovernance: 0.1,
}

export const DIMENSION_LABELS = {
  businessStrategy: 'Business Strategy',
  dataReadiness: 'Data Readiness',
  technologyInfrastructure: 'Technology Infrastructure',
  talentSkills: 'Talent & Skills',
  useCaseReadiness: 'Use Case Readiness',
  operationalReadiness: 'Operational Readiness',
  aiGovernance: 'AI Governance',
}

export const DIMENSION_ORDER = [
  'businessStrategy',
  'dataReadiness',
  'technologyInfrastructure',
  'talentSkills',
  'useCaseReadiness',
  'operationalReadiness',
  'aiGovernance',
]

export const MATURITY_LEVELS = [
  { level: 1, label: 'AI Unaware', min: 1.0, max: 1.5, color: '#EF4444' },
  { level: 2, label: 'AI Curious', min: 1.51, max: 2.5, color: '#F97316' },
  { level: 3, label: 'AI Experimenting', min: 2.51, max: 3.5, color: '#EAB308' },
  { level: 4, label: 'AI Operational', min: 3.51, max: 4.5, color: '#22C55E' },
  { level: 5, label: 'AI Transformational', min: 4.51, max: 5.0, color: '#3B82F6' },
]
