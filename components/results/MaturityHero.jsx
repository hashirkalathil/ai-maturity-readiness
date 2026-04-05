import { MATURITY_LEVELS } from '@/constants/dimensions'

function getLevelMeta(level) {
  return MATURITY_LEVELS.find((item) => item.level === level) || MATURITY_LEVELS[0]
}

export default function MaturityHero({
  maturityLevel,
  maturityLabel,
  overallScore,
  rawOverallScore,
  blockerDimension,
  executiveSummary,
  maturityNarrative,
}) {
  const levelMeta = getLevelMeta(maturityLevel)
  const blockerApplied =
    blockerDimension && Number(rawOverallScore) !== Number(overallScore)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full text-4xl font-semibold text-white shadow-lg"
          style={{ backgroundColor: levelMeta.color }}
        >
          {maturityLevel}
        </div>
        <div className='flex flex-row items-center gap-2'>
          <p className="mt-6 text-xl font-semibold uppercase tracking-wider text-gray-800">
            Level = {maturityLabel}
          </p>
        </div>
        <p className="mt-4 text-xl font-bold text-gray-900 bg-gray-200 px-2 py-1 rounded-full">
          {`${Number(overallScore).toFixed(1)} / 5.0`}
        </p>
        {blockerApplied ? (
          <p className="mt-3 text-sm font-medium text-rose-700">
            {`Adjusted score ${Number(overallScore).toFixed(2)} from raw score ${Number(rawOverallScore).toFixed(2)} due to blocker rule`}
          </p>
        ) : (
          <p className="mt-3 text-sm font-medium text-slate-500">
            {`Raw score ${Number(rawOverallScore).toFixed(2)}`}
          </p>
        )}
        <p className="mt-6 text-left text-md text-slate-800">
          {executiveSummary}
        </p>
        {maturityNarrative ? (
          <p className="mt-4 text-left text-md text-slate-800">
            {maturityNarrative}
          </p>
        ) : null}
      </div>
    </section>
  )
}
