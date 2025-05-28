// POC SubjectCard component for a subject in a semester
import React from "react"

type Subject = {
  subject: string
  percentage: number
  competencies: string
  activities: number
  chartData: number[]
  status: string
}

export const PocSubjectCard: React.FC<{ subject: Subject }> = ({ subject }) => {
  const max = Math.max(...subject.chartData)
  return (
    <div className="subject-card bg-white rounded-lg shadow">
      <div className="subject-header flex justify-between items-start p-4 pb-1">
        <div className="subject-title font-medium text-black">{subject.subject}</div>
        <div className="subject-percentage font-medium text-black">{subject.percentage}%</div>
      </div>
      <div className="subject-competencies px-4 pb-3 text-xs text-gray-400">{subject.competencies} competenties</div>
      <div className="subject-chart h-16 px-4 pb-2 relative">
        <svg width="100%" height="100%" viewBox="0 0 200 64">
          {subject.chartData.map((value, i) => (
            <rect
              key={i}
              x={i * (200 / 12) + 2}
              y={64 - (value / max) * 64}
              width={200 / 12 - 4}
              height={(value / max) * 64}
              rx={2}
              ry={2}
              fill="#bdbdbd"
            >
              <title>{`${i * 10}-${(i + 1) * 10}%: ${value} leerlingen`}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="subject-progress px-4 pb-2">
        <svg width="100%" height="6" viewBox="0 0 200 6">
          <rect className="progress-bg" x={0} y={0} width={200} height={6} fill="#ece6f0" rx={3} />
          <rect className="progress-fg" x={0} y={0} width={subject.percentage * 2} height={6} fill="#75b265" rx={3} />
        </svg>
      </div>
      <div className={`subject-status h-1 ${subject.status === "success" ? "bg-green-500" : subject.status === "warning" ? "bg-yellow-400" : "bg-red-400"}`}></div>
      <div className="subject-activities px-4 py-2 text-xs text-gray-400 border-t border-gray-100">{subject.activities} activiteiten</div>
    </div>
  )
}
