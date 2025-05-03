export interface Competency {
  id: string
  title: string
  status: "not-achieved" | "partially-achieved" | "achieved"
  classDistribution: {
    notAchieved: number
    partiallyAchieved: number
    achieved: number
  }
  activities: any[]
  notes?: string
  globalId: string
  subjects: string[]
}
