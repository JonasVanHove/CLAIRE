// POC Dashboard page for masterthesis project
import React from "react"
import styles from "../styles/poc-dashboard.module.css"
import { semesterData } from "../data/poc-semester-data"
import { PocDotPlot } from "../components/poc-dot-plot"
import { PocSubjectCard } from "../components/poc-subject-card"

export default function PocDashboard() {
  return (
    <div className={styles.dashboard + " min-h-screen bg-gray-50"}>
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src="/public/images/marc_vertongen.png" alt="Marc Vertongen" className="w-12 h-12 rounded-full border border-gray-200" />
          <h1 className="text-2xl font-semibold">Marc Vertongen</h1>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {/* Icon buttons, replace with real icons if needed */}
          <button className="icon-button">🔍</button>
          <button className="icon-button">👤</button>
          <button className="icon-button">📊</button>
        </div>
      </header>
      <main>
        <h2 className="text-xl font-medium mb-4 text-center">Positionering ten opzichte van medestudenten uit 3STEM</h2>
        <div className="progress-header mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-medium">Competenties behaald</div>
            <div className="text-lg font-medium">165/210</div>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-green-500 rounded-full" style={{ width: "78.5%" }}></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
            <div className="font-medium">Status:</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-green-600"><span>✔️</span> Binnen doelstelling</div>
              <div className="flex items-center gap-2 text-green-600"><span>✔️</span> Aanwezigheid boven grenswaarde</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="dot-plot-card bg-white rounded-lg shadow p-4">
            <div className="dot-plot-title text-center font-medium mb-2">Semester 1</div>
            <PocDotPlot />
          </div>
          <div className="dot-plot-card bg-white rounded-lg shadow p-4">
            <div className="dot-plot-title text-center font-medium mb-2">Semester 2</div>
            <PocDotPlot />
          </div>
          <div className="dot-plot-card bg-white rounded-lg shadow p-4">
            <div className="dot-plot-title text-center font-medium mb-2">Semester 3</div>
            <PocDotPlot />
          </div>
        </div>
        <div className="tabs">
          <div className="tabs-list flex gap-2 mb-4">
            <button className="tab-button active">Semester 1</button>
            <button className="tab-button">Semester 2</button>
            <button className="tab-button">Semester 3</button>
          </div>
          <div className="tab-content active">
            <div className={styles["subject-grid"] + " subject-grid"}>
              {semesterData[0].subjects.map((subject, i) => (
                <PocSubjectCard key={i} subject={subject} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
