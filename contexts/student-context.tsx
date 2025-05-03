"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface StudentData {
  studentInfo: {
    name: string
    class: string
    // Other student info
  }
  subjects: any[]
  attendance: any
  competencies: any
  individualGoal: number
  isAtRisk: boolean
  atRiskReason: string
  // Other student data
}

interface StudentContextType {
  selectedStudent: string
  selectedClass: string
  studentData: StudentData | null
  language: string
  setSelectedStudent: (student: string) => void
  setSelectedClass: (className: string) => void
  setStudentData: (data: StudentData | null) => void
  setLanguage: (lang: string) => void
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedClass, setSelectedClass] = useState("3STEM")
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [language, setLanguage] = useState("nl") // Default to Dutch

  return (
    <StudentContext.Provider
      value={{
        selectedStudent,
        selectedClass,
        studentData,
        language,
        setSelectedStudent,
        setSelectedClass,
        setStudentData,
        setLanguage,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
