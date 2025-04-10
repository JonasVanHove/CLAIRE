"use client"

// use-data.ts - React hook voor het ophalen van data

import { useState, useEffect } from "react"
import { dataService } from "../data/data-adapter"
import type { Activity, Competency } from "../data/types"

// Hook voor het ophalen van student data
export function useStudentData(studentId: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await dataService.getStudentData(studentId)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [studentId])

  return { data, loading, error }
}

// Hook voor het ophalen van competenties
export function useCompetencies(studentId: string, subjectId: string) {
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCompetencies() {
      try {
        setLoading(true)
        const result = await dataService.getCompetencies(studentId, subjectId)
        setCompetencies(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchCompetencies()
  }, [studentId, subjectId])

  return { competencies, loading, error }
}

// Hook voor het ophalen van activiteiten
export function useActivities(studentId: string, subjectId: string, semester?: number) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const result = await dataService.getActivities(studentId, subjectId, semester)
        setActivities(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [studentId, subjectId, semester])

  return { activities, loading, error }
}

// Hook voor het ophalen van klasdistributie
export function useClassDistribution(classId: string, subjectId: string, semester: number) {
  const [distribution, setDistribution] = useState<number[]>([])
  const [studentBucket, setStudentBucket] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDistribution() {
      try {
        setLoading(true)
        const result = await dataService.getClassDistribution(classId, subjectId, semester)
        setDistribution(result.distribution)
        setStudentBucket(result.studentBucket)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchDistribution()
  }, [classId, subjectId, semester])

  return { distribution, studentBucket, loading, error }
}
