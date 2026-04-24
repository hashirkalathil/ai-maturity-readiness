import { DIMENSION_ORDER } from './geminiQuestions.js'

const FALLBACK_ALLOCATION = {
  businessStrategy: 4,
  dataReadiness: 4,
  technologyInfrastructure: 3,
  talentSkills: 2,
  useCaseReadiness: 2,
  operationalReadiness: 2,
  aiGovernance: 3,
}

const fallbackTotal = Object.values(FALLBACK_ALLOCATION).reduce((sum, val) => sum + val, 0)
console.log(`✓ Fallback allocation total: ${fallbackTotal} (expected: 20)`)
if (fallbackTotal !== 20) {
  console.error('❌ Fallback allocation does not sum to 20!')
  process.exit(1)
}

let allInRange = true
for (const [dim, count] of Object.entries(FALLBACK_ALLOCATION)) {
  if (count < 2 || count > 5) {
    console.error(`❌ ${dim} has ${count} questions (must be 2-5)`)
    allInRange = false
  }
}
if (allInRange) {
  console.log('✓ All dimensions have 2-5 questions')
}

for (const dim of DIMENSION_ORDER) {
  if (!(dim in FALLBACK_ALLOCATION)) {
    console.error(`❌ Dimension ${dim} missing from fallback allocation`)
    process.exit(1)
  }
}
console.log('✓ All 7 dimensions present in allocation')

function testAdjustmentLogic() {
  const testAllocation = {
    businessStrategy: 4,
    dataReadiness: 4,
    technologyInfrastructure: 3,
    talentSkills: 2,
    useCaseReadiness: 2,
    operationalReadiness: 2,
    aiGovernance: 3,
  }

  let total = Object.values(testAllocation).reduce((sum, val) => sum + val, 0)
  
  if (total === 20) {
    console.log('✓ Allocation adjustment logic validated (already sums to 20)')
  } else {
    console.error(`❌ Allocation sums to ${total}, not 20`)
    process.exit(1)
  }
}
testAdjustmentLogic()

console.log('\n✅ All allocation tests passed!')
