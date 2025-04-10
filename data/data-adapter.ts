// data-adapter.ts - Een adapter patroon om verschillende databronnen te ondersteunen

import type { Activity, Competency } from "./types"

// Interface voor databronnen
export interface DataSource {
  getStudentData(studentId: string): Promise<any>
  getCompetencies(studentId: string, subjectId: string): Promise<any>
  getActivities(studentId: string, subjectId: string, semester?: number): Promise<any>
  getClassDistribution(classId: string, subjectId: string, semester: number): Promise<any>
  // Voeg andere methoden toe die je nodig hebt
}

// Mock data source implementatie
export class MockDataSource implements DataSource {
  async getStudentData(studentId: string) {
    // Simuleer een API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Retourneer mock data
    return mockStudentData[studentId] || { error: "Student niet gevonden" }
  }

  async getCompetencies(studentId: string, subjectId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return generateMockCompetencies(subjectId)
  }

  async getActivities(studentId: string, subjectId: string, semester?: number) {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Genereer 6-7 activiteiten voor dit vak
    const activities = generateMockActivities(subjectId, semester)

    // Limiteer tot 7 activiteiten
    return activities.slice(0, 7)
  }

  async getClassDistribution(classId: string, subjectId: string, semester: number) {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Genereer een distributie van 20 buckets (0-5%, 5-10%, etc.)
    const distribution = Array(20)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))

    // Bepaal een willekeurige bucket voor de student
    const studentBucket = Math.floor(Math.random() * 20)

    return { distribution, studentBucket }
  }
}

// LTI API data source implementatie
export class LTIDataSource implements DataSource {
  private baseUrl: string
  private authToken: string

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl
    this.authToken = authToken
  }

  private async fetchWithAuth(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getStudentData(studentId: string) {
    try {
      return await this.fetchWithAuth(`/students/${studentId}`)
    } catch (error) {
      console.error("Error fetching student data:", error)
      // Fallback naar mock data bij fouten
      return mockStudentData[studentId] || { error: "Student niet gevonden" }
    }
  }

  async getCompetencies(studentId: string, subjectId: string) {
    try {
      return await this.fetchWithAuth(`/students/${studentId}/subjects/${subjectId}/competencies`)
    } catch (error) {
      console.error("Error fetching competencies:", error)
      // Fallback naar mock data
      return generateMockCompetencies(subjectId)
    }
  }

  async getActivities(studentId: string, subjectId: string, semester?: number) {
    try {
      const endpoint = semester
        ? `/students/${studentId}/subjects/${subjectId}/activities?semester=${semester}`
        : `/students/${studentId}/subjects/${subjectId}/activities`

      const activities = await this.fetchWithAuth(endpoint)

      // Limiteer tot 7 activiteiten
      return activities.slice(0, 7)
    } catch (error) {
      console.error("Error fetching activities:", error)
      // Fallback naar mock data
      return generateMockActivities(subjectId, semester).slice(0, 7)
    }
  }

  async getClassDistribution(classId: string, subjectId: string, semester: number) {
    try {
      return await this.fetchWithAuth(`/classes/${classId}/subjects/${subjectId}/distribution?semester=${semester}`)
    } catch (error) {
      console.error("Error fetching class distribution:", error)
      // Fallback naar mock data
      const distribution = Array(20)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
      const studentBucket = Math.floor(Math.random() * 20)
      return { distribution, studentBucket }
    }
  }
}

// Data service die de juiste data source gebruikt
export class DataService {
  private dataSource: DataSource

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource
  }

  // Methode om data source te wijzigen (bijv. van mock naar LTI)
  setDataSource(dataSource: DataSource) {
    this.dataSource = dataSource
  }

  // Wrapper methoden die de data source gebruiken
  async getStudentData(studentId: string) {
    return this.dataSource.getStudentData(studentId)
  }

  async getCompetencies(studentId: string, subjectId: string) {
    return this.dataSource.getCompetencies(studentId, subjectId)
  }

  async getActivities(studentId: string, subjectId: string, semester?: number) {
    return this.dataSource.getActivities(studentId, subjectId, semester)
  }

  async getClassDistribution(classId: string, subjectId: string, semester: number) {
    return this.dataSource.getClassDistribution(classId, subjectId, semester)
  }
}

// Helper functies voor het genereren van mock data
function generateMockCompetencies(subjectId: string): Competency[] {
  // Implementatie vergelijkbaar met je huidige generateMockCompetencies functie
  // maar met een limiet van 7 activiteiten per competentie
  // ...
  return []
}

function generateMockActivities(subjectId: string, semester?: number): Activity[] {
  // Genereer 6-7 activiteiten voor dit vak
  const activityCount = 6 + Math.floor(Math.random() * 2) // 6 of 7
  const activities: Activity[] = []

  for (let i = 0; i < activityCount; i++) {
    // Genereer een activiteit met willekeurige eigenschappen
    // ...
  }

  return activities
}

// Mock student data
const mockStudentData: Record<string, any> = {
  // Voeg hier je mock student data toe
}

// Exporteer een instantie van de data service met mock data als standaard
export const dataService = new DataService(new MockDataSource())
