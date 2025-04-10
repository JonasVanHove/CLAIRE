// types.ts - Centrale plaats voor alle type definities

// Define the exact subject list
export const SUBJECTS = [
  "Wiskunde",
  "Nederlands",
  "Frans",
  "Engels",
  "Levensbeschouwelijke vakken",
  "Geschiedenis",
  "Lichamelijke opvoeding",
  "Mechanica",
  "Elektromagnetisme",
  "Natuurwetenschappen",
  "Artistieke vorming",
  "Toegepaste informatica",
  "Thermodynamica",
  "Project STEM",
] as const

export type Subject = (typeof SUBJECTS)[number]

// Activity interface
export interface Activity {
  id: string
  type: "toets" | "taak" | "examen"
  title: string
  score: number
  maxScore: number
  completed: boolean
  evaluated: boolean
  date: string
  notes?: string
  semester: 1 | 2 | 3
  classDistribution: {
    min: number
    max: number
    average: number
    studentCount: number
    lowPerformers: number
    mediumPerformers: number
    highPerformers: number
  }
  relativePerformance: "onder" | "boven" | "gemiddeld"
  competencyId: string
  subjectId: string
}

// Competency interface
export interface Competency {
  id: string
  title: string
  status: "not-achieved" | "partially-achieved" | "achieved"
  classDistribution: {
    notAchieved: number
    partiallyAchieved: number
    achieved: number
  }
  activities: Activity[]
  notes?: string
  globalId: string
  subjects: string[]
}

// Student interface
export interface Student {
  id: string
  name: string
  class: string
  profileImage?: string
  atRisk: boolean
  failedSubjects: string[]
  lowPerformanceSubjects: string[]
  competencies: {
    [competencyId: string]: {
      status: "not-achieved" | "partially-achieved" | "achieved"
      progress: number
    }
  }
  activities: {
    [subjectId: string]: {
      [activityId: string]: {
        completed: boolean
        evaluated: boolean
        score: number
        date: string
      }
    }
  }
}

// LTI Context interface
export interface LTIContext {
  userId: string
  courseId: string
  resourceId: string
  roles: string[]
  returnUrl: string
  toolConsumerInstanceGuid: string
}
