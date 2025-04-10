"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface StudentContextType {
  selectedStudent: string
  selectedClass: string
  setSelectedStudent: (student: string) => void
  setSelectedClass: (className: string) => void
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [selectedStudent, setSelectedStudent] = useState("Marc Vertongen")
  const [selectedClass, setSelectedClass] = useState("3STEM")

  return (
    <StudentContext.Provider value={{ selectedStudent, selectedClass, setSelectedStudent, setSelectedClass }}>
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
