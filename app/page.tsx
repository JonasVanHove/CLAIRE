"use client";

import { SubjectCard } from "@/components/subject-card";
import { ProgressHeader } from "@/components/progress-header";
import { StudentSelector } from "@/components/student-selector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Voeg imports toe voor de ChevronDown en ChevronUp iconen
import {
  ChevronDown,
  User,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronUp,
} from "lucide-react";
// Voeg deze imports toe bovenaan het bestand, bij de andere imports
import { ArrowDown, ArrowUp, Clock, Activity, BarChart3 } from "lucide-react";
import { SemesterScatterPlot } from "@/components/semester-scatter-plot";
import { useStudent } from "@/contexts/student-context";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  getStudentData,
  getStudentCompetencyIssues,
  getStudentProfileImage,
  getClassDistributionForSubject,
  getStudentAttendance,
  getStudentIndividualGoal,
  getTotalCompetencies,
  getStudentSemesterData,
} from "@/data/student-data";
import { UIProvider, useUI } from "@/contexts/ui-context";
import { SettingsMenu } from "@/components/settings-menu";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { InfoPopup } from "@/components/info-popup";
// Add the import for the API service at the top of the file
import { api } from "@/services/api";
// Voeg deze import toe bij de andere imports bovenaan het bestand
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Voeg deze type definitie toe na de bestaande imports
// Definieer een type voor de sorteeroptie
type SortOption = {
  field: "score" | "activities" | "hours";
  direction: "asc" | "desc";
};

// Definieer een type voor de vakgegevens met uren per week
interface SubjectData {
  subject: string;
  percentage: number;
  competencies: string;
  activities: number;
  distribution: number[];
  studentBucket: number;
  status: string;
  hoursPerWeek: number; // Toegevoegd veld voor uren per week
}

export default function Dashboard() {
  return (
    <UIProvider>
      <DashboardContent />
    </UIProvider>
  );
}

// Add translations object inside the DashboardContent component
function DashboardContent() {
  const { selectedStudent, selectedClass, setStudentData } = useStudent();
  // Verander deze regels:
  // const [showNotes, setShowProfile] = useState(false)
  // const [showProfile, setShowNotes] = useState(false)

  // Naar:
  const [showProfile, setShowProfile] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const { compactView, darkMode, language } = useUI();
  const [activeSemester, setActiveSemester] = useState<string>("semester1");
  const profileRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Add a state for the threshold value - default to 85%
  const [attendanceThreshold, setAttendanceThreshold] = useState(85);
  // Add a state for the individual goal - default to the value from the data
  const [individualGoal, setIndividualGoal] = useState(() => getStudentIndividualGoal(selectedStudent))
  // const [individualGoal, setIndividualGoal] = useState(60);
  // const individualGoalData = useMemo(() => {
  //   const data = getStudentIndividualGoal(selectedStudent) as number | undefined;
  //   return data ?? 60; // Default to 60 if no value is found
  // }, [selectedStudent]);
    // console.log(`-individualGoalData ${selectedStudent}:`, individualGoalData);
  const [isLoadingThresholds, setIsLoadingThresholds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const thresholdInputRef = useRef<HTMLInputElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);

  // State for tracking if student is above their average
  const [isAboveAverage, setIsAboveAverage] = useState(false);

  // Voeg deze state toe in de DashboardContent functie, bij de andere useState declaraties
  const [sortOption, setSortOption] = useState<SortOption>({
    // field: "hours",
    field: "activities",
    direction: "desc",
  });

  // Functie om het semesternummer te extraheren uit de activeSemester string
  const getSelectedSemesterNumber = (): 1 | 2 | 3 => {
    const match = activeSemester.match(/semester(\d)/);
    if (match && ["1", "2", "3"].includes(match[1])) {
      return Number.parseInt(match[1]) as 1 | 2 | 3;
    }
    return 1; // Default naar semester 1 als er geen match is
  };

  // Get the competency percentage
  const { achieved, total } = getTotalCompetencies(selectedStudent);
  const percentage = (achieved / total) * 100;

  // Add translations
  const translations = {
    en: {
      noStudentSelected: "No student selected",
      selectStudent:
        "Select a student using the search field above to view semester data.",
      positioning: "Positioning relative to fellow students",
      positioningFrom: "Positioning relative to fellow students from",
      eachDot: "Each dot represents a student.",
      coloredDot: "The colored dot is",
      semester: "Semester",
      clickTab: "Click on the tab above to view this semester",
      profile: "Profile of",
      notes: "Notes for",
      noNotes: "No notes found for this student.",
      withinTarget: "Within target",
      attendance: "Attendance",
      meetsThreshold: "meets the threshold",
      goodAttendance:
        "The student has good attendance and meets the minimum requirements.",
      authorized: "Authorized",
      unauthorized: "Unauthorized",
      attentionPoints: "Attention points",
      attendanceBelow: "Attendance is below the threshold",
      studentMustAttend:
        "The student needs better attendance to meet the minimum requirements.",
      criticalAttendance:
        "The student has critically low attendance that requires urgent attention.",
      competencyIssues: "Competency issues:",
      needsGuidance: "This student needs extra guidance.",
      status: "Status",
      passed: "Passed",
      evaluationNeeded: "Evaluation needed",
      statusCalculation: "Status calculation:",
      competencies: "Competencies",
      goal: "goal",
      personalAverage: "Personal average",
      passedStatus:
        'The "Passed" status is awarded when the student meets all criteria: competency goal, attendance threshold, and personal average.',
      individualGoalExplanation:
        'The individual goal is tailored to the student\'s capabilities and progress. Students are considered "at risk" when they perform below their personal goal.',
      mainSubjects: "Main subjects",
      enrolledSince: "Enrolled since",
      schoolYears: "School years",
      grade: "Grade",
      year: "year",
      attendanceThreshold: "Attendance",
      save: "Save",
      saving: "Saving...",
      enterValidValue: "Enter a valid value between 50 and 100",
      thresholdSaved: "Attendance threshold saved!",
      errorSaving: "An error occurred while saving",
      minimumAttendance: "Minimum attendance percentage for students",
      individualGoal: "Individual goal",
      personalGoal: "Personal goal for this student",
      schoolYear: "School year",
      showMore: "Show more",
      showLess: "Show less",
      good: "Good",
      needsAttention: "Needs attention",
      critical: "Critical",
      // In het 'en' object binnen translations
      sortBy: "Sort by",
      score: "Score",
      activities: "Activities",
      hoursPerWeek: "Hours per week",
      ascending: "Ascending",
      descending: "Enrollment History",
      enrollmentHistory: "Years enrolled at this school",
      years: "years",
      numberOfYears: "Number of years",
      riskRules: "Risk Rules",
      atRiskRule: "At risk: competency achievement below individual goal",
      attendanceRiskRule: "Attendance risk: attendance below threshold",
    },
    nl: {
      noStudentSelected: "Geen leerling geselecteerd",
      selectStudent:
        "Selecteer een leerling via het zoekveld bovenaan om de semestergegevens te bekijken.",
      positioning: "Positionering ten opzichte van medestudenten",
      positioningFrom: "Positionering ten opzichte van medestudenten uit",
      eachDot: "Elke stip vertegenwoordigt een student.",
      coloredDot: "De gekleurde stip is",
      semester: "Semester",
      clickTab: "Klik op de tab hierboven om dit semester te bekijken",
      profile: "Profiel van",
      notes: "Notities voor",
      noNotes: "Geen notities gevonden voor deze leerling.",
      withinTarget: "Binnen doelstelling",
      attendance: "Aanwezigheid",
      meetsThreshold: "voldoet aan de grenswaarde",
      goodAttendance:
        "De leerling heeft een goede aanwezigheidsgraad en voldoet aan de minimumvereisten.",
      authorized: "Gewettigd",
      unauthorized: "Ongewettigd",
      attentionPoints: "Aandachtspunten",
      attendanceBelow: "Aanwezigheid is onder de grenswaarde",
      studentMustAttend:
        "De leerling moet beter aanwezig zijn om aan de minimumvereisten te voldoen.",
      criticalAttendance:
        "De leerling heeft een kritisch lage aanwezigheid die dringend aandacht vereist.",
      competencyIssues: "Competentie-issues:",
      needsGuidance: "Deze leerling heeft extra begeleiding nodig.",
      status: "Status",
      passed: "Geslaagd",
      evaluationNeeded: "Evaluatie nodig",
      statusCalculation: "Status berekening:",
      competencies: "Competenties",
      goal: "doel",
      personalAverage: "Persoonlijk gemiddelde",
      passedStatus:
        'De status "Geslaagd" wordt toegekend wanneer de leerling voldoet aan alle criteria: competentiedoelstelling, aanwezigheidsgrenswaarde en persoonlijk gemiddelde.',
      individualGoalExplanation:
        'De individuele doelstelling is afgestemd op de capaciteiten en vooruitgang van de leerling. Leerlingen worden als "at risk" beschouwd wanneer ze onder hun persoonlijke doelstelling presteren.',
      mainSubjects: "Hoofdvakken",
      enrolledSince: "Ingeschreven sinds",
      schoolYears: "Schooljaren",
      grade: "Graad",
      year: "jaar",
      attendanceThreshold: "Aanwezigheid",
      save: "Opslaan",
      saving: "Opslaan...",
      enterValidValue: "Voer een geldige waarde in tussen 50 en 100",
      thresholdSaved: "Aanwezigheid grenswaarde opgeslagen!",
      errorSaving: "Er is een fout opgetreden bij het opslaan",
      minimumAttendance: "Minimale percentage aanwezigheid voor de leerlingen",
      individualGoal: "Individuele doelstelling",
      personalGoal: "Persoonlijke doelstelling voor deze leerling",
      schoolYear: "Schooljaar",
      showMore: "Toon meer",
      showLess: "Toon minder",
      good: "Goed",
      needsAttention: "Aandacht nodig",
      critical: "Kritisch",
      // In het 'nl' object binnen translations
      sortBy: "Sorteer op",
      score: "Score",
      activities: "Activiteiten",
      hoursPerWeek: "Uren per week",
      ascending: "Oplopend",
      descending: "Aflopend",
      enrollmentHistory: "Jaren ingeschreven op deze school",
      years: "jaren",
      numberOfYears: "Aantal jaren",
      riskRules: "Risicoregels",
      atRiskRule: "Risico: competentiebehaald onder individuele doelstelling",
      attendanceRiskRule: "Aanwezigheidsrisico: aanwezigheid onder grenswaarde",
    },
  };

  // Get translations based on current language
  const t = translations[language];

  // Near the beginning of the DashboardContent component, add this check
  useEffect(() => {
    // If no student is selected, show a message or prompt to select a student
    if (!selectedStudent) {
      // You could set a default view or show a message
      // For now, we'll just let the UI handle the empty state
    }
  }, [selectedStudent]);

  // Calculate if student is above their average
  useEffect(() => {
    // Bereken het gemiddelde van de vorige semesters
    const semester1Data = getStudentSemesterData(selectedStudent, 1);
    const semester2Data = getStudentSemesterData(selectedStudent, 2);
    const semester3Data = getStudentSemesterData(selectedStudent, 3);

    // Bereken gemiddelde scores per semester
    const getAverageScore = (data: any[]) => {
      if (data.length === 0) return 0;
      const sum = data.reduce((acc, item) => acc + item.result.score.raw, 0);
      return sum / data.length;
    };

    const avg1 = getAverageScore(semester1Data);
    const avg2 = getAverageScore(semester2Data);
    const avg3 = getAverageScore(semester3Data);

    // Bereken het gemiddelde van alle semesters
    const overallAvg = (avg1 + avg2 + avg3) / 3;

    // Bepaal of de huidige score rond of boven het gemiddelde ligt
    // We beschouwen 'rond het gemiddelde' als binnen 5% van het gemiddelde
    const scoreDeviation = Math.abs(percentage - overallAvg);
    const isWithinAverage = scoreDeviation <= 5 || percentage >= overallAvg;
    setIsAboveAverage(isWithinAverage);
  }, [selectedStudent, percentage]);

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
      if (
        notesRef.current &&
        !notesRef.current.contains(event.target as Node)
      ) {
        setShowNotes(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update individual goal when selected student changes
  useEffect(() => {
    setIndividualGoal(60); // Default to 60% instead of using getStudentIndividualGoal
  }, [selectedStudent]);
  
  // useEffect(() => {
  // const goal = getStudentIndividualGoal(selectedStudent);
  //   setIndividualGoal(typeof goal === "number" && !isNaN(goal) ? goal : 60);
  // }, [selectedStudent]);
  // useEffect(() => {
  //   setIndividualGoal(individualGoalData);
  // }, [selectedStudent]);
  // useEffect(() => {
  //   loadThresholdsFromDB();
  // }, [selectedClass, selectedStudent]);

  // Replace the semesterScores useMemo with API calls
  const [semester1Data, setSemester1Data] = useState<
    { name: string; score: number; isCurrentStudent: boolean }[]
  >([]);
  const [semester2Data, setSemester2Data] = useState<
    { name: string; score: number; isCurrentStudent: boolean }[]
  >([]);
  const [semester3Data, setSemester3Data] = useState<
    { name: string; score: number; isCurrentStudent: boolean }[]
  >([]);

  useEffect(() => {
    if (selectedStudent && selectedClass) {
      // Fetch data for all three semesters
      const fetchSemesterData = async () => {
        try {
          const [sem1, sem2, sem3] = await Promise.all([
            api.getSemesterScores(selectedClass, 1, selectedStudent),
            api.getSemesterScores(selectedClass, 2, selectedStudent),
            api.getSemesterScores(selectedClass, 3, selectedStudent),
          ]);

          setSemester1Data(sem1.scores);
          setSemester2Data(sem2.scores);
          setSemester3Data(sem3.scores);
        } catch (error) {
          console.error("Error fetching semester scores:", error);
        }
      };

      fetchSemesterData();
    }
  }, [selectedStudent, selectedClass]);

  const semesterScores = useMemo(() => {
    return [semester1Data, semester2Data, semester3Data];
  }, [semester1Data, semester2Data, semester3Data]);

  // Get student's subject data
  const studentData = useMemo(() => {
    return getStudentData(selectedStudent);
  }, [selectedStudent]);

  // Get consistent attendance data
  // Define a type for attendance data to include all expected fields
  type AttendanceData = {
    present: number;
    late: number;
    unauthorized: number;
    authorized: number;
    [key: string]: number;
  };

  const attendanceData = useMemo<AttendanceData>(() => {
    // Ensure attendanceData always has present, late, unauthorized, and authorized fields
    const data = getStudentAttendance(selectedStudent) as
      | Partial<AttendanceData>
      | undefined;
    return {
      present: data?.present ?? 0,
      late: data?.late ?? 0,
      unauthorized: data?.unauthorized ?? 0,
      authorized: data?.authorized ?? 0,
      // Add any other fields you expect to use
    };
  }, [selectedStudent]);

  // Voeg deze functie toe in de DashboardContent functie, voor de renderSemester functie
  // Functie om uren per week te bepalen op basis van het vak
  // In een echte implementatie zou dit uit de database komen
  const getHoursPerWeek = (subject: string): number => {
    // Vaste waarden voor de demo
    const hoursMap: Record<string, number> = {
      Wiskunde: 5,
      Nederlands: 4,
      Frans: 4,
      Engels: 3,
      "Levensbeschouwelijke vakken": 2,
      Geschiedenis: 2,
      "Lichamelijke opvoeding": 2,
      Mechanica: 4,
      Elektromagnetisme: 3,
      Natuurwetenschappen: 3,
      "Artistieke vorming": 2,
      "Toegepaste informatica": 3,
      Thermodynamica: 3,
      "Project STEM": 4,
    };

    return hoursMap[subject] || Math.floor(Math.random() * 4) + 1; // Fallback naar random 1-4 uren
  };

  // Wijzig de handleSortChange functie om alleen het veld te wijzigen, niet de richting
  // Voeg deze functie toe in de DashboardContent functie, voor de renderSemester functie
  // Functie om de sorteervolgorde te wijzigen
  const handleSortChange = (field: "score" | "activities" | "hours") => {
    setSortOption((prev) => {
      // Als een nieuw veld wordt geselecteerd, behoud de huidige richting
      if (prev.field !== field) {
        return { field, direction: prev.direction };
      }
      // Als hetzelfde veld wordt geselecteerd, behoud alles
      return prev;
    });
  };

  // Wijzig de semesterSubjects useMemo functie om hoursPerWeek toe te voegen
  // Vervang de bestaande semesterSubjects useMemo functie met deze:
  const semesterSubjects = useMemo(() => {
    const result = {
      1: [] as SubjectData[],
      2: [] as SubjectData[],
      3: [] as SubjectData[],
    };

    studentData.forEach((statement) => {
      const semester = statement.object.definition.semester;
      const subject = statement.object.definition.name.nl;
      const studentScore = statement.result.score.raw;

      if (semester >= 1 && semester <= 3) {
        // Get the class distribution for this subject
        const { distribution, studentBucket } = getClassDistributionForSubject(
          selectedClass,
          subject,
          semester,
          studentScore
        );

        // Genereer een consistente waarde voor uren per week op basis van het vak
        // In een echte implementatie zou dit uit de database komen
        const hoursPerWeek = getHoursPerWeek(subject);

        result[semester].push({
          subject: subject,
          percentage: studentScore,
          competencies: `${statement.result.competencies?.achieved || 0}/${
            statement.result.competencies?.total || 0
          }`,
          activities: statement.result.activities || 0,
          distribution: distribution,
          studentBucket: studentBucket,
          status:
            studentScore < 50
              ? "danger"
              : studentScore < 70
              ? "warning"
              : "success",
          hoursPerWeek: hoursPerWeek,
        });
      }
    });

    return result;
  }, [studentData, selectedClass]);

  // Get main subjects for the student
  const mainSubjects = useMemo(() => {
    const subjects = ["Wiskunde", "Nederlands", "Frans", "Engels"];
    const result: {
      subject: string;
      score: number;
      status: string;
      competencies: string;
    }[] = [];

    // Haal het huidige geselecteerde semesternummer op
    const selectedSemester = getSelectedSemesterNumber();

    subjects.forEach((subjectName) => {
      const subjectData = studentData.find(
        (s) =>
          s.object.definition.name.nl === subjectName &&
          s.object.definition.semester === selectedSemester
      );

      if (subjectData) {
        // Haal de competentie-informatie op
        const achieved = subjectData.result.competencies?.achieved || 0;
        const total = subjectData.result.competencies?.total || 1;
        // Bereken het percentage op basis van behaalde competenties
        const competencyScore = Math.round((achieved / total) * 100);
        const competencies = `${achieved}/${total}`;

        result.push({
          subject: subjectName,
          score: competencyScore,
          competencies,
          status:
            competencyScore < 50
              ? "danger"
              : competencyScore < 70
              ? "warning"
              : "success",
        });
      }
    });

    return result;
  }, [studentData, activeSemester]); // Voeg activeSemester toe als dependency

  // Voeg deze functie toe voor het bepalen van de ingeschreven jaren
  const getEnrollmentYears = (studentName: string) => {
    // In een echte applicatie zou dit uit de database komen
    // Voor nu simuleren we dit met wat logica

    // Bepaal het huidige schooljaar (bijv. 2023-2024)
    const currentYear = 2023;

    // Bepaal in welk jaar de student zit (3STEM = 3e jaar)
    const currentGrade = Number.parseInt(selectedClass.charAt(0)) || 3;

    // Bereken wanneer de student begonnen is
    const startYear = currentYear - (currentGrade - 1);

    // Genereer de jaren waarin de student ingeschreven was
    const years = [];
    for (let i = 0; i < currentGrade; i++) {
      const year = startYear + i;
      years.push(`${year}-${year + 1}`);
    }

    // Bepaal de graad
    let grade;
    if (currentGrade <= 2) {
      grade = 1;
    } else if (currentGrade <= 4) {
      grade = 2;
    } else {
      grade = 3;
    }

    return {
      years,
      grade,
      currentGrade,
    };
  };

  // Functie om te controleren of afwezigheidsdata beschikbaar is
  const hasAttendanceDetailData = () => {
    // Expliciet aangeven dat we geen gedetailleerde afwezigheidsdata hebben
    return false;
  };

  // Voeg deze regel toe aan het profiel gedeelte, na de Calendar regel
  const enrollmentInfo = getEnrollmentYears(selectedStudent);

  // Haal de profielafbeelding op
  const profileImage = getStudentProfileImage(selectedStudent);

  // Haal de competentie-issues op
  const competencyIssues = getStudentCompetencyIssues(selectedStudent);

  // Vervang de renderSemester functie met deze nieuwe versie
  // Render een semester with its subjects
  const renderSemester = (semesterNum: number, isActive: boolean) => {
    // Each subject shown here belongs to this specific semester
    // This relationship is defined in the database and cannot be changed
    const subjects = semesterSubjects[semesterNum as 1 | 2 | 3];

    // Sorteer de vakken op basis van de huidige sorteeroptie
    const sortedSubjects = [...subjects].sort((a, b) => {
      let comparison = 0;

      // Bepaal welk veld we vergelijken
      switch (sortOption.field) {
        case "score":
          comparison = a.percentage - b.percentage;
          break;
        case "activities":
          comparison = a.activities - b.activities;
          break;
        case "hours":
          comparison = a.hoursPerWeek - b.hoursPerWeek;
          break;
      }

      // Pas de sorteervolgorde toe
      return sortOption.direction === "asc" ? comparison : -comparison;
    });

    return (
      <div
        className={`border rounded-md flex-1 dark:bg-gray-800 dark:border-gray-700 relative p-3 ${
          !isActive ? "opacity-60 pointer-events-none select-none" : ""
        }`}
        data-semester={semesterNum}
        style={{
          height: "calc(100vh - 300px)", // Responsive height based on viewport
          maxHeight: "600px", // Maximum height
          overflow: "hidden", // Hide overflow for the container
        }}
      >
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/30 dark:bg-gray-900/30">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-md text-center">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {t.clickTab}
              </p>
            </div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar`}
          style={{
            height: "calc(100% - 10px)", // Verminder de hoogte om ruimte te maken voor de sorteercontrols
            overflowY: "auto", // Enable vertical scrolling
            paddingRight: "8px", // Add some padding for the scrollbar
          }}
        >
          {sortedSubjects.map((subject, index) => (
            <SubjectCard
              key={index}
              subject={subject.subject}
              percentage={subject.percentage}
              competencies={subject.competencies}
              activities={subject.activities}
              distribution={subject.distribution}
              studentBucket={subject.studentBucket}
              status={
                subject.status as "danger" | "warning" | "success" | undefined
              }
              isActive={isActive}
              compact={false}
              className="h-48" // Make cards taller
              semester={semesterNum} // Pass the semester number
              hoursPerWeek={subject.hoursPerWeek} // Geef uren per week door
            />
          ))}
        </div>
      </div>
    );
  };

  // Replace the handleSaveAttendanceThreshold function with API call
  const handleSaveAttendanceThreshold = async () => {
    if (!thresholdInputRef.current || !selectedStudent) return;

    const newThreshold = Number.parseInt(thresholdInputRef.current.value);
    if (isNaN(newThreshold) || newThreshold < 50 || newThreshold > 100) {
      alert(t.enterValidValue);
      return;
    }

    setIsSaving(true);

    try {
      // Use the API service to update the attendance threshold
      const result = await api.updateAttendanceThreshold(
        selectedStudent,
        newThreshold
      );

      if (result.success) {
        // Update local state after successful save
        setAttendanceThreshold(newThreshold);

        // Save to student profile in localStorage instead of class thresholds
        try {
          // Get existing student profiles or initialize empty object
          const studentProfilesJSON = localStorage.getItem("studentProfiles");
          const studentProfiles = studentProfilesJSON
            ? JSON.parse(studentProfilesJSON)
            : {};

          // Update or create this student's profile
          studentProfiles[selectedStudent] = {
            ...(studentProfiles[selectedStudent] || {}),
            attendanceThreshold: newThreshold,
          };

          // Save back to localStorage
          localStorage.setItem(
            "studentProfiles",
            JSON.stringify(studentProfiles)
          );

          console.log(
            `Saved attendance threshold ${newThreshold}% for student: ${selectedStudent}`
          );
        } catch (error) {
          console.error(
            "Error updating student profile in localStorage:",
            error
          );
        }

        // Show success message
        alert(t.thresholdSaved);
      } else {
        throw new Error("Failed to save threshold");
      }
    } catch (error) {
      console.error("Error saving threshold:", error);
      alert(t.errorSaving);
    } finally {
      setIsSaving(false);
    }
  };

  // Find the handleSaveIndividualGoal function and replace it with this updated version
  // that saves to student profile instead of class thresholds
  const handleSaveIndividualGoal = async () => {
    if (!goalInputRef.current || !selectedStudent) return;

    const newGoal = Number.parseInt(goalInputRef.current.value);
    if (isNaN(newGoal) || newGoal < 50 || newGoal > 100) {
      alert(t.enterValidValue);
      return;
    }

    setIsSavingGoal(true);

    try {
      // Use the API service to update the individual goal
      const result = await api.updateIndividualGoal(
        selectedStudent, 
        newGoal
      );

      if (result.success) {
        // Update local state after successful save
        setIndividualGoal(newGoal);

        // Save to `localStorage` under `studentProfiles`
        try {
          const studentProfilesJSON = localStorage.getItem("studentProfiles");
          const studentProfiles = studentProfilesJSON
            ? JSON.parse(studentProfilesJSON)
            : {};

          // Update or create this student's profile
          studentProfiles[selectedStudent] = {
            ...(studentProfiles[selectedStudent] || {}),
            individualGoal: newGoal,
          };

          // Save back to `localStorage`
          localStorage.setItem(
            "studentProfiles",
            JSON.stringify(studentProfiles)
          );

          console.log(
            `Saved individual goal ${newGoal}% for student: ${selectedStudent}`
          );
        } catch (error) {
          console.error(
            "Error updating student profile in localStorage:",
            error
          );
        }

        // Show success message
        alert(t.personalGoal + "!");
      } else {
        throw new Error("Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert(t.errorSaving);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Voeg state toe voor het bijhouden van uitgeklapte secties (na de andere useState declaraties)
  const [expandedAttendance, setExpandedAttendance] = useState(false);
  const [expandedAttentionPoints, setExpandedAttentionPoints] = useState(false);
  const [expandedStatus, setExpandedStatus] = useState(false);

  // Helper functie om status indicator te tonen
  const getStatusIndicator = (status: string, score: number) => {
    switch (status) {
      case "danger":
        return (
          <span className="font-medium text-red-600 dark:text-red-400">
            {score}%
          </span>
        );
      case "warning":
        return (
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {score}%
          </span>
        );
      default:
        return (
          <span className="font-medium text-green-600 dark:text-green-400">
            {score}%
          </span>
        );
    }
  };

  // Add event listener to handle threshold updates and refresh student data
  const [isLoadingStudentData, setIsLoadingStudentData] = useState(false);
  // const { setStudentData } = useStudent() // Remove fetchStudentData as it doesn't exist

  useEffect(() => {
    // Function to handle the refresh event
    const handleRefreshStudentData = async (event: Event) => {
      if (!selectedStudent) return;

      // Cast to CustomEvent to access .detail
      const customEvent = event as CustomEvent;

      // Show loading state
      setIsLoadingStudentData(true);

      try {
        // Fetch updated student data with new thresholds
        const studentData = await api.getStudentDetails(
          selectedStudent,
          selectedClass
        );

        // Update the student context with the fetched data
        setStudentData({
          ...studentData,
          atRiskReason: studentData.atRiskReason ?? "",
        });

        // Update local threshold values if they were changed
        if (customEvent.detail?.thresholdsUpdated) {
          if (customEvent.detail.attendanceThreshold) {
            setAttendanceThreshold(customEvent.detail.attendanceThreshold);
          }
          if (customEvent.detail.individualGoal) {
            setIndividualGoal(customEvent.detail.individualGoal);
          }
        }

        // Reload thresholds from database
        loadThresholdsFromDB();
      } catch (error) {
        console.error("Error refreshing student data:", error);
      } finally {
        setIsLoadingStudentData(false);
      }
    };

    // Add event listener for the custom event
    window.addEventListener("refreshStudentData", handleRefreshStudentData);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener(
        "refreshStudentData",
        handleRefreshStudentData
      );
    };
  }, [selectedStudent, selectedClass, setStudentData]);

  // Add state for global thresholds
  const [globalAttendanceThreshold, setGlobalAttendanceThreshold] =
    useState(85);
  const [globalIndividualGoal, setGlobalIndividualGoal] = useState(60);

  // Update the loadThresholdsFromDB function to load from student profile
  const loadThresholdsFromDB = async () => {
    if (!selectedClass) return;

    setIsLoadingThresholds(true);
    try {
      // Load global and class thresholds first
      const classThresholdsJSON = localStorage.getItem("classThresholds");
      const globalAttendanceThresholdValue = localStorage.getItem(
        "globalAttendanceThreshold"
      );

      let classThreshold = 80; // Default value

      if (classThresholdsJSON) {
        const classThresholds = JSON.parse(classThresholdsJSON);

        // Find the thresholds for the current class
        const classThresholdObj = classThresholds.find(
          (cls: any) => cls.className === selectedClass
        );

        if (classThresholdObj) {
          // Use the class-specific attendance threshold
          classThreshold = classThresholdObj.attendanceThreshold;
          console.log(
            `Loaded attendance threshold for ${selectedClass} from database:`,
            classThresholdObj.attendanceThreshold
          );
        }

        // Also load global thresholds for display purposes
        const globalSettings = classThresholds.find(
          (cls: any) => cls.className === "global"
        );
        if (globalSettings) {
          setGlobalAttendanceThreshold(
            globalSettings.attendanceThreshold || 85
          );
          setGlobalIndividualGoal(globalSettings.individualGoal || 70);
        }
      }

      // Now check if the selected student has a custom threshold
      if (selectedStudent) {
        const studentProfilesJSON = localStorage.getItem("studentProfiles");
        type StudentProfile = {
          attendanceThreshold?: number;
          individualGoal?: number;
          [key: string]: any;
        };
        type StudentProfiles = {
          [studentName: string]: StudentProfile;
        };
        let studentProfiles: StudentProfiles = {};
        if (studentProfilesJSON) {
          studentProfiles = JSON.parse(studentProfilesJSON);

          if (
            studentProfiles[selectedStudent] &&
            studentProfiles[selectedStudent].attendanceThreshold
          ) {
            // Use student-specific threshold if available
            setAttendanceThreshold(
              studentProfiles[selectedStudent].attendanceThreshold
            );
            console.log(
              `Loaded student-specific attendance threshold for ${selectedStudent}:`,
              studentProfiles[selectedStudent].attendanceThreshold
            );
          } else {
            // If no student-specific threshold, use class threshold
            setAttendanceThreshold(classThreshold);
            console.log(
              `No student-specific threshold found for ${selectedStudent}, using class threshold: ${classThreshold}`
            );
          }

          // Load individual goal from student profile if available
          if (
            studentProfiles[selectedStudent] &&
            studentProfiles[selectedStudent].individualGoal
          ) {
            setIndividualGoal(studentProfiles[selectedStudent].individualGoal);
            console.log(
              `Loaded individual goal for ${selectedStudent} from profile:`,
              studentProfiles[selectedStudent].individualGoal
            );
          } else {
            // If no individual goal in profile, fall back to the default from data
            setIndividualGoal(getStudentIndividualGoal(selectedStudent));
          }
        } else {
          // If no profiles exist, use class threshold and default individual goal
          setAttendanceThreshold(classThreshold);
          setIndividualGoal(getStudentIndividualGoal(selectedStudent));
        }
      } else {
        // If no student selected, use class threshold
        setAttendanceThreshold(classThreshold);
      }

      // Load global parameters for attendance threshold
      try {
        // First try to get from global parameters
        const globalParamsJSON = localStorage.getItem("globalParameters");
        if (globalParamsJSON) {
          const globalParams = JSON.parse(globalParamsJSON);
          if (globalParams.attendanceThreshold) {
            setGlobalAttendanceThreshold(
              Number(globalParams.attendanceThreshold)
            );
            console.log(
              "Loaded global attendance threshold from Global Parameters:",
              globalParams.attendanceThreshold
            );
          }
        } else if (globalAttendanceThresholdValue) {
          // Fall back to legacy storage if global parameters not found
          setGlobalAttendanceThreshold(Number(globalAttendanceThresholdValue));
        }
      } catch (error) {
        console.error("Error loading global parameters:", error);
      }
    } catch (error) {
      console.error("Error loading thresholds from database:", error);
      // Fall back to default values if there's an error
      if (selectedStudent) {
        setIndividualGoal(getStudentIndividualGoal(selectedStudent));
      }
      setAttendanceThreshold(85); // Default attendance threshold
    } finally {
      setIsLoadingThresholds(false);
    }
  };

  // Add this useEffect to reset thresholds when the selected student changes
  useEffect(() => {
    if (selectedStudent) {
      // Reset loading state
      setIsLoadingThresholds(true);

      // Load student-specific thresholds
      const studentProfilesJSON = localStorage.getItem("studentProfiles");
      let studentProfiles: { [key: string]: any } = {};
      if (studentProfilesJSON) {
        studentProfiles = JSON.parse(studentProfilesJSON);
      }

      if (studentProfiles[selectedStudent]) {
        // Load student-specific attendance threshold if available
        if (studentProfiles[selectedStudent].attendanceThreshold) {
          setAttendanceThreshold(
            studentProfiles[selectedStudent].attendanceThreshold
          );
          console.log(
            `Loaded student-specific attendance threshold for ${selectedStudent}:`,
            studentProfiles[selectedStudent].attendanceThreshold
          );
        } else {
          // Otherwise load from class or global settings
          loadThresholdsFromDB();
        }

        // Load student-specific individual goal if available
        if (studentProfiles[selectedStudent].individualGoal) {
          setIndividualGoal(studentProfiles[selectedStudent].individualGoal);
        } else {
          setIndividualGoal(getStudentIndividualGoal(selectedStudent));
        }
      } else {
        // If no profile exists for this student, load from class or global settings
        loadThresholdsFromDB();
      }
      setIsLoadingThresholds(false);
    }
  }, [selectedStudent]);

  // Update the useEffect that loads thresholds to use the new function
  useEffect(() => {
    loadThresholdsFromDB();
  }, [selectedClass, selectedStudent]);

  // Now update the attendance threshold section to show the correct global value
  // Replace with:

  // Now update the attendance threshold section to show the correct global value
  // Replace with:

  // Now update the individual goal section to show the correct global value
  // Replace with:

  // Now update the individual goal section to show the correct global value
  // Replace with:

  // Function to check if attendance is below threshold - used by both profile and student filter
  const isAttendanceBelowThreshold = (
    attendance: number,
    threshold: number
  ) => {
    return attendance < threshold;
  };

  // Verbeter de event emitter voor attendance data
  // Vervang de bestaande useEffect voor het verzenden van attendance data:

  // Emit a custom event to update the student filter with attendance data
  useEffect(() => {
    if (selectedStudent && attendanceData) {
      // Check if attendance is below threshold
      const isBelow = attendanceData.present < attendanceThreshold;

      // Create and dispatch a custom event with the attendance data
      const event = new CustomEvent("updateStudentAttendance", {
        detail: {
          student: selectedStudent,
          attendancePercentage: attendanceData.present,
          isBelowThreshold: isBelow,
          threshold: attendanceThreshold,
        },
      });
      window.dispatchEvent(event);
    }
  }, [selectedStudent, attendanceData, attendanceThreshold]);

  // Emit a custom event to update the student filter with performance data
  useEffect(() => {
    if (selectedStudent) {
      // Create and dispatch a custom event with the performance data
      const event = new CustomEvent("updateStudentStatus", {
        detail: {
          student: selectedStudent,
          isAtRisk: percentage < individualGoal,
          atRiskReason:
            percentage < individualGoal
              ? "Onder individuele doelstelling"
              : null,
          performance: percentage, // Add the actual performance percentage
          attendancePercentage: attendanceData?.present || 0,
          isBelowAttendanceThreshold:
            attendanceData?.present < attendanceThreshold,
        },
      });
      window.dispatchEvent(event);

      // Also update the student profile with the current performance
      try {
        const studentProfilesJSON = localStorage.getItem("studentProfiles");
        let studentProfiles: { [key: string]: any } = {};
        if (studentProfilesJSON) {
          studentProfiles = JSON.parse(studentProfilesJSON);
        }

        // Update or create this student's profile with performance data
        studentProfiles[selectedStudent] = {
          ...(studentProfiles[selectedStudent] || {}),
          performance: percentage,
        };

        // Save back to localStorage
        localStorage.setItem(
          "studentProfiles",
          JSON.stringify(studentProfiles)
        );

        console.log(
          `Updated performance data (${percentage.toFixed(
            1
          )}%) for student: ${selectedStudent}`
        );
      } catch (error) {
        console.error("Error updating student performance in profile:", error);
      }
    }
  }, [
    selectedStudent,
    percentage,
    individualGoal,
    attendanceData,
    attendanceThreshold,
  ]);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <StudentSelector />

          <div className="relative" ref={profileRef}>
            <button
              className={`p-2 rounded-md ${
                selectedStudent
                  ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
                  : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              onClick={() => selectedStudent && setShowProfile(!showProfile)}
              aria-label="Toon profiel"
              disabled={!selectedStudent}
            >
              <User className="h-5 w-5" />
            </button>

            {showProfile && selectedStudent && (
              <div className="absolute left-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {t.profile} {selectedStudent}
                    </h2>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowProfile(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Profile header with image and basic info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                      <div className="flex items-start">
                        {/* Profile image with status indicator */}
                        <div className="relative mr-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                            <Image
                              src={profileImage || "/images/default.png"}
                              alt={selectedStudent}
                              width={80}
                              height={80}
                              className="object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                // @ts-ignore
                                (img as any)._errorCount =
                                  ((img as any)._errorCount || 0) + 1;
                                if (
                                  (img as any)._errorCount <= 3 &&
                                  img.src !==
                                    window.location.origin +
                                      "/images/default.png"
                                ) {
                                  img.src = "/images/default.png";
                                }
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 flex space-x-1">
                            {percentage < individualGoal && (
                              <div className="bg-amber-100 dark:bg-amber-900/60 p-1 rounded-full border-2 border-white dark:border-gray-800 group">
                                <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-black/90 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                                  {language === "en"
                                    ? `Competency achievement (${percentage.toFixed(
                                        1
                                      )}%) is below individual goal (${individualGoal}%)`
                                    : `Competentiebehaald (${percentage.toFixed(
                                        1
                                      )}%) is onder individuele doelstelling (${individualGoal}%)`}
                                </div>
                              </div>
                            )}
                            {/* Attendance risk icon - also shown in student filter when attendance is below threshold */}
                            {attendanceData &&
                              attendanceData.present < attendanceThreshold && (
                                <div className="bg-blue-100 dark:bg-blue-900/60 p-1 rounded-full border-2 border-white dark:border-gray-800 group">
                                  <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-black/90 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                                    {language === "en"
                                      ? `Attendance (${attendanceData.present}%) is below threshold (${attendanceThreshold}%)`
                                      : `Aanwezigheid (${attendanceData.present}%) is onder de grenswaarde (${attendanceThreshold}%)`}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Student information */}
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {selectedStudent}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                                {selectedClass}
                              </span>
                            </div>

                            {/* School year and grade info */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Calendar className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                                <span>{t.schoolYear} 2023-2024</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span>
                                  {t.grade} {enrollmentInfo.grade} |{" "}
                                  {enrollmentInfo.currentGrade}e {t.year}
                                </span>
                              </div>
                            </div>

                            {/* Enrollment info */}
                            <div className="mt-2 flex items-center gap-4 text-xs">
                              <div className="flex items-center">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t.enrolledSince}
                                </span>
                                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                                  {enrollmentInfo.years[0]}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {t.numberOfYears}
                                </span>
                                <span
                                  className="ml-1 font-medium text-gray-700 dark:text-gray-300 group relative cursor-help"
                                  title={t.enrollmentHistory}
                                >
                                  {enrollmentInfo.years.length}{" "}
                                  {enrollmentInfo.years.length === 1
                                    ? t.year
                                    : t.years}
                                  <span className="invisible group-hover:visible absolute left-0 top-full mt-1 bg-black/90 text-white text-xs p-2 rounded-md z-50 whitespace-nowrap shadow-lg">
                                    {enrollmentInfo.years.join(", ")}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Settings sections */}
                    {/* Settings sections - Simplified */}
                    <div className="space-y-4">
                      {/* Attendance threshold setting */}
                      <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <div>
                              <label
                                htmlFor="attendance-threshold"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                {t.attendanceThreshold.replace(":", "")}
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <input
                                id="attendance-threshold"
                                type="number"
                                min="50"
                                max="100"
                                ref={thresholdInputRef}
                                defaultValue={attendanceThreshold}
                                className="w-16 h-7 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 focus:border-transparent"
                              />
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                            <button
                              className={`px-2 py-1 text-xs ${
                                isSaving
                                  ? "bg-gray-400"
                                  : "bg-blue-500 hover:bg-blue-600 text-white"
                              } rounded-md flex items-center gap-1 shadow-sm transition-all duration-200`}
                              disabled={isSaving}
                              onClick={handleSaveAttendanceThreshold}
                            >
                              {isSaving ? (
                                <>
                                  <svg
                                    className="animate-spin h-3 w-3 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  {t.saving}
                                </>
                              ) : (
                                t.save
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Info row */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {language === "en" ? "Current:" : "Huidig:"}
                            </span>
                            <span
                              className={`font-medium ${
                                attendanceData &&
                                attendanceData.present < attendanceThreshold
                                  ? "text-red-500 dark:text-red-400"
                                  : "text-green-500 dark:text-green-400"
                              }`}
                            >
                              {attendanceData &&
                              typeof attendanceData.present === "number"
                                ? attendanceData.present
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {language === "en"
                                ? "Individual:"
                                : "Individueel:"}
                            </span>
                            <User className="h-3 w-3 text-blue-500 dark:text-blue-400 mr-0.5" />
                            <span className="font-medium text-blue-500 dark:text-blue-400">
                              {attendanceThreshold}%
                            </span>
                            {/* <span className="font-medium text-blue-500 dark:text-blue-400">{globalAttendanceThreshold}%</span> */}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {language === "en" ? "Class goal:" : "Klasdoel:"}
                            </span>
                            <span className="font-medium text-blue-500 dark:text-blue-400">
                              {globalAttendanceThreshold}%
                              {/* {attendanceThreshold}% */}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar with gradient */}
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                          {/* Current attendance with gradient */}
                          <div
                            className={`h-full ${
                              attendanceData &&
                              attendanceData.present < attendanceThreshold
                                ? "bg-gradient-to-r from-red-400 to-red-500 dark:from-red-600 dark:to-red-500"
                                : "bg-gradient-to-r from-green-400 to-green-500 dark:from-green-600 dark:to-green-500"
                            }`}
                            style={{
                              width: `${
                                attendanceData &&
                                typeof attendanceData.present === "number"
                                  ? attendanceData.present
                                  : 0
                              }%`,
                            }}
                          ></div>

                          {/* Threshold markers */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400 z-10"
                            style={{ left: `${attendanceThreshold}%` }}
                          >
                            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                          </div>
                          {globalAttendanceThreshold !==
                            attendanceThreshold && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-blue-300 dark:bg-blue-600 z-10 dashed-line"
                              style={{ left: `${globalAttendanceThreshold}%` }}
                            >
                              <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Individual goal setting */}
                      <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            <div>
                              <label
                                htmlFor="individual-goal"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                {t.individualGoal.replace(":", "")}
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <input
                                id="individual-goal"
                                type="number"
                                min="50"
                                max="100"
                                ref={goalInputRef}
                                defaultValue={individualGoal}
                                className="w-16 h-7 px-2 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600 focus:border-transparent"
                              />
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                            <div className="relative group">
                              <button
                                className={`px-2 py-1 text-xs ${
                                  isSavingGoal
                                    ? "bg-gray-400"
                                    : "bg-amber-500 hover:bg-amber-600 text-white"
                                } rounded-md flex items-center gap-1 shadow-sm transition-all duration-200`}
                                disabled={isSavingGoal}
                                onClick={handleSaveIndividualGoal}
                              >
                                {isSavingGoal ? (
                                  <>
                                    <svg
                                      className="animate-spin h-3 w-3 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    {t.saving}
                                  </>
                                ) : (
                                  t.save
                                )}
                              </button>
                              <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-black/90 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 pointer-events-none">
                                {language === "en"
                                  ? "This goal will only be saved for this student"
                                  : "Dit doel wordt alleen opgeslagen voor deze leerling"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info row */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {language === "en" ? "Current:" : "Huidig:"}
                            </span>
                            <span
                              className={`font-medium ${
                                percentage < individualGoal
                                  ? "text-red-500 dark:text-red-400"
                                  : "text-green-500 dark:text-green-400"
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {language === "en"
                                ? "Individual:"
                                : "Individueel:"}
                            </span>
                            <User className="h-3 w-3 text-amber-500 dark:text-amber-400 mr-0.5" />
                            <span className="font-medium text-amber-500 dark:text-amber-400">
                              {individualGoal}%
                            </span>
                            {/* <span className="font-medium text-amber-500 dark:text-amber-400">{globalIndividualGoal}%</span> */}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {language === "en" ? "Class goal:" : "Klasdoel:"}
                            </span>
                            <span className="font-medium text-amber-500 dark:text-amber-400">
                              {globalIndividualGoal}%{/* {individualGoal}% */}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar with gradient */}
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                          {/* Current competency with gradient */}
                          <div
                            className={`h-full ${
                              percentage < individualGoal
                                ? "bg-gradient-to-r from-red-400 to-red-500 dark:from-red-600 dark:to-red-500"
                                : "bg-gradient-to-r from-green-400 to-green-500 dark:from-green-600 dark:to-green-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>

                          {/* Goal markers */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-600 dark:bg-amber-400 z-10"
                            style={{ left: `${individualGoal}%` }}
                          >
                            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400"></div>
                          </div>
                          {globalIndividualGoal !== individualGoal && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-amber-300 dark:bg-amber-600 z-10 dashed-line"
                              style={{ left: `${globalIndividualGoal}%` }}
                            >
                              <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-amber-300 dark:bg-amber-600"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Data visualization sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Attendance section */}
                      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">
                          {t.attendance}
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="dark:text-gray-300">
                                {t.attendance}
                              </span>
                              <span className="dark:text-gray-300">
                                {attendanceData &&
                                typeof attendanceData.present === "number"
                                  ? `${attendanceData.present}%`
                                  : "Geen data"}
                              </span>
                            </div>
                            <Progress
                              value={
                                attendanceData &&
                                typeof attendanceData.present === "number"
                                  ? attendanceData.present
                                  : 0
                              }
                              className="h-2 bg-gray-200 dark:bg-gray-600"
                            />
                            {/* Add threshold marker */}
                            <div className="relative h-0">
                              <div
                                className="absolute top-[-8px] h-3 w-0.5 bg-red-500"
                                style={{ left: `${attendanceThreshold}%` }}
                              />
                            </div>
                          </div>
                          {/* Aanwezigheidspercentages */}
                          <div className="mt-2 space-y-2">
                            {/* Gewettigde afwezigheid */}
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs">
                                  <CheckCircle2
                                    className={`h-3 w-3 ${
                                      hasAttendanceDetailData()
                                        ? "text-green-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  <span className="dark:text-gray-300 font-medium">
                                    {t.authorized}:
                                  </span>
                                </div>
                                {hasAttendanceDetailData() && (
                                  <div className="text-xs dark:text-gray-300">
                                    <span className="font-medium">
                                      {attendanceData.authorized}%
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                      (~
                                      {Math.round(
                                        attendanceData.authorized * 0.36
                                      )}{" "}
                                      {attendanceData.authorized * 0.36 > 1
                                        ? "dagen"
                                        : "dag"}
                                      )
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                  className="bg-gray-400 dark:bg-gray-600 h-1.5 rounded-full"
                                  style={{ width: "0%" }}
                                ></div>
                              </div>
                              {!hasAttendanceDetailData() && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Geen data beschikbaar
                                </p>
                              )}
                            </div>

                            {/* Ongewettigde afwezigheid */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs">
                                  <XCircle
                                    className={`h-3 w-3 ${
                                      hasAttendanceDetailData()
                                        ? "text-red-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  <span className="dark:text-gray-300 font-medium">
                                    {t.unauthorized}:
                                  </span>
                                </div>
                                {hasAttendanceDetailData() && (
                                  <div className="text-xs dark:text-gray-300">
                                    <span className="font-medium">
                                      {typeof attendanceData.unauthorized ===
                                      "number"
                                        ? attendanceData.unauthorized
                                        : 0}
                                      %
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                      (~
                                      {Math.round(
                                        attendanceData.unauthorized * 0.36
                                      )}{" "}
                                      {attendanceData.unauthorized * 0.36 > 1
                                        ? "dagen"
                                        : "dag"}
                                      )
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div
                                  className="bg-gray-400 dark:bg-gray-600 h-1.5 rounded-full"
                                  style={{ width: "0%" }}
                                ></div>
                              </div>
                              {!hasAttendanceDetailData() && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Geen data beschikbaar
                                </p>
                              )}
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {attendanceData &&
                              typeof attendanceData.unauthorized ===
                                "number" ? (
                                attendanceData.unauthorized > 10 ? (
                                  "Te veel ongewettigde afwezigheden"
                                ) : attendanceData.unauthorized > 5 ? (
                                  "Let op: ongewettigde afwezigheden nemen toe"
                                ) : (
                                  "Ongewettigde afwezigheden binnen aanvaardbare grenzen"
                                )
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">
                                  Geen gegevens over ongewettigde afwezigheden
                                  beschikbaar
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main subjects section */}
                      <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">
                          {t.mainSubjects}
                        </h3>
                        <div className="space-y-4">
                          {mainSubjects.map((subject) => (
                            <div key={subject.subject} className="space-y-1">
                              <div className="flex justify-between items-center text-xs mb-1">
                                <span className="dark:text-gray-300">
                                  {subject.subject}
                                </span>
                                <div className="flex items-center gap-1">
                                  {getStatusIndicator(
                                    subject.status,
                                    subject.score
                                  )}
                                  <span className="text-gray-500 dark:text-gray-400">
                                    ({subject.competencies})
                                  </span>
                                </div>
                              </div>
                              <Progress value={subject.score} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notesRef}>
            <button
              className={`p-2 rounded-md ${
                selectedStudent
                  ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#49454F] dark:text-gray-300"
                  : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              onClick={() => selectedStudent && setShowNotes(!showNotes)}
              aria-label="Toon notities"
              disabled={!selectedStudent}
            >
              <FileText className="h-5 w-5" />
            </button>

            {/* Vervang de notitie-popup sectie met deze verbeterde versie */}
            {showNotes && selectedStudent && (
              <div className="absolute left-0 mt-2 w-[400px] bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {t.notes} {selectedStudent}
                    </h2>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      onClick={() => setShowNotes(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {t.noNotes}
                      </p>
                    </div>

                    {/* Positive section - show when attendance is above threshold */}
                    {attendanceData.present >= attendanceThreshold && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-medium text-green-600 dark:text-green-500 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {t.withinTarget}
                          </h3>
                          <button
                            onClick={() =>
                              setExpandedAttendance(!expandedAttendance)
                            }
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                          >
                            {expandedAttendance ? t.showLess : t.showMore}
                            {expandedAttendance ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </button>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-800 dark:text-green-400 font-medium">
                            {t.attendance} ({attendanceData.present}%){" "}
                            {t.meetsThreshold} ({attendanceThreshold}%)
                          </p>

                          {/* Expandable content */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              expandedAttendance
                                ? "max-h-40 overflow-y-auto mt-2"
                                : "max-h-0"
                            }`}
                          >
                            <p className="text-xs text-green-700 dark:text-green-400">
                              {t.goodAttendance}.
                            </p>
                            {/* Vervang ook de vergelijkbare sectie in de notitie-popup (rond regel 1000) door: */}
                            <div className="flex flex-col gap-2 mt-2">
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                                    <CheckCircle2
                                      className={`h-3 w-3 ${
                                        hasAttendanceDetailData()
                                          ? ""
                                          : "text-gray-400 dark:text-gray-500"
                                      }`}
                                    />
                                    <span className="font-medium">
                                      {t.authorized}:
                                    </span>
                                  </div>
                                  {hasAttendanceDetailData() && (
                                    <div className="text-xs text-green-700 dark:text-green-400">
                                      <span className="font-medium">
                                        {attendanceData.authorized}%
                                      </span>
                                      <span className="opacity-75 ml-1">
                                        (~
                                        {Math.round(
                                          attendanceData.authorized * 0.36
                                        )}{" "}
                                        {attendanceData.authorized * 0.36 > 1
                                          ? "dagen"
                                          : "dag"}
                                        )
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full bg-green-200 dark:bg-green-900/30 rounded-full h-1.5">
                                  <div
                                    className="bg-gray-400 dark:bg-gray-600 h-1.5 rounded-full"
                                    style={{
                                      width: "0%",
                                    }}
                                  ></div>
                                </div>
                                {!hasAttendanceDetailData() && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Geen data beschikbaar
                                  </p>
                                )}
                              </div>

                              <div className="mt-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                                    <XCircle
                                      className={`h-3 w-3 ${
                                        hasAttendanceDetailData()
                                          ? ""
                                          : "text-gray-400 dark:text-gray-500"
                                      }`}
                                    />
                                    <span className="font-medium">
                                      {t.unauthorized}:
                                    </span>
                                  </div>
                                  {hasAttendanceDetailData() && (
                                    <div className="text-xs text-green-700 dark:text-green-400">
                                      <span className="font-medium">
                                        {attendanceData.unauthorized}%
                                      </span>
                                      <span className="opacity-75 ml-1">
                                        (~
                                        {Math.round(
                                          attendanceData.unauthorized * 0.36
                                        )}{" "}
                                        {attendanceData.unauthorized * 0.36 > 1
                                          ? "dagen"
                                          : "dag"}
                                        )
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full bg-green-200 dark:bg-green-900/30 rounded-full h-1.5">
                                  <div
                                    className="bg-gray-400 dark:bg-gray-600 h-1.5 rounded-full"
                                    style={{
                                      width: "0%",
                                    }}
                                  ></div>
                                </div>
                                {!hasAttendanceDetailData() && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Geen data beschikbaar
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* At Risk section - show when student is at risk OR attendance is below threshold */}
                    {(percentage < individualGoal ||
                      attendanceData.present < attendanceThreshold) && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-medium text-amber-600 dark:text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {t.attentionPoints}
                          </h3>
                          <button
                            onClick={() =>
                              setExpandedAttentionPoints(
                                !expandedAttentionPoints
                              )
                            }
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                          >
                            {expandedAttentionPoints ? t.showLess : t.showMore}
                            {expandedAttentionPoints ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </button>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                          {/* Always show the most important information */}
                          {percentage < individualGoal && (
                            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                              {language === "en"
                                ? `Competency achievement (${percentage.toFixed(
                                    1
                                  )}%) is below individual goal (${individualGoal}%)`
                                : `Competentiebehaald (${percentage.toFixed(
                                    1
                                  )}%) is onder individuele doelstelling (${individualGoal}%)`}
                            </p>
                          )}

                          {/* Attendance warning - always show if below threshold */}
                          {attendanceData.present < attendanceThreshold && (
                            <div
                              className={`${
                                percentage < individualGoal ? "mt-3" : ""
                              } bg-amber-50/50 dark:bg-amber-900/10 rounded-md p-2 border border-amber-200 dark:border-amber-800/30`}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-amber-800 dark:text-amber-400 font-medium flex flex-wrap items-center gap-1">
                                    <span>{t.attendance}</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                      {attendanceData.present}%
                                    </span>
                                    <span>{t.attendanceBelow}</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-amber-300">
                                      {attendanceThreshold}%
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Expandable content */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              expandedAttentionPoints
                                ? "max-h-60 overflow-y-auto mt-3"
                                : "max-h-0"
                            }`}
                          >
                            {attendanceData.present < attendanceThreshold && (
                              <>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                                  {attendanceData.present >=
                                  attendanceThreshold - 10
                                    ? t.studentMustAttend
                                    : t.criticalAttendance}
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                                  {t.unauthorized}:{" "}
                                  {attendanceData.unauthorized}%
                                </p>
                              </>
                            )}

                            {competencyIssues.length > 0 &&
                              percentage < individualGoal && (
                                <div className="mt-2">
                                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                                    {t.competencyIssues}:
                                  </p>
                                  <ul className="list-disc pl-5 text-xs text-amber-600 dark:text-amber-500 space-y-1">
                                    {competencyIssues.map((issue, index) => (
                                      <li key={index}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            <div className="mt-3 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md">
                              <p className="text-xs font-medium mb-1">
                                {language === "en"
                                  ? "Risk Rules:"
                                  : "Risicoregels:"}
                              </p>
                              <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>
                                  {language === "en"
                                    ? "At risk: competency achievement below individual goal"
                                    : "Risico: competentiebehaald onder individuele doelstelling"}
                                </li>
                                <li>
                                  {language === "en"
                                    ? "Attendance risk: attendance below threshold"
                                    : "Aanwezigheidsrisico: aanwezigheid onder grenswaarde"}
                                </li>
                              </ul>
                            </div>

                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                              {t.needsGuidance}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status section - always show */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-blue-600 dark:text-blue-500 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {t.status}
                        </h3>
                        <button
                          onClick={() => setExpandedStatus(!expandedStatus)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                        >
                          {expandedStatus ? t.showLess : t.showMore}
                          {expandedStatus ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          )}
                        </button>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
                          {percentage >= individualGoal &&
                          attendanceData.present >= attendanceThreshold
                            ? t.passed
                            : t.evaluationNeeded}
                        </p>

                        {/* Expandable content */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedStatus
                              ? "max-h-60 overflow-y-auto mt-2"
                              : "max-h-0"
                          }`}
                        >
                          <h4 className="text-xs font-medium mb-1 text-blue-700 dark:text-blue-400">
                            {t.statusCalculation}:
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-blue-700 dark:text-blue-400">
                            <li>
                              {t.competencies}: {percentage.toFixed(2)}%{" "}
                              {percentage >= individualGoal ? "✓" : "✗"} (
                              {t.goal}: {individualGoal}%)
                            </li>
                            <li>
                              {t.attendance}: {attendanceData.present}%{" "}
                              {attendanceData.present >= attendanceThreshold
                                ? "✓"
                                : "✗"}{" "}
                              ({t.goal}: {attendanceThreshold}
                              %)
                            </li>
                          </ul>
                          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                            {t.passedStatus}
                          </p>
                          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                            {t.individualGoalExplanation}
                          </p>
                          <div className="mt-3 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-md">
                            <p className="text-xs font-medium mb-1">
                              {language === "en"
                                ? "Risk Rules:"
                                : "Risicoregels:"}
                            </p>
                            <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>
                                {language === "en"
                                  ? "At risk: competency achievement below individual goal"
                                  : "Risico: competentiebehaald onder individuele doelstelling"}
                              </li>
                              <li>
                                {language === "en"
                                  ? "Attendance risk: attendance below threshold"
                                  : "Aanwezigheidsrisico: aanwezigheid onder grenswaarde"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <InfoPopup />
          <SettingsMenu />
        </div>
      </header>

      <main
        className={`w-full px-4 py-2 flex-1 overflow-auto ${
          compactView ? "max-w-screen-2xl mx-auto" : ""
        }`}
      >
        {selectedStudent ? (
          <h1 className="text-xl font-medium text-center mb-4 dark:text-white">
            {t.positioningFrom} {selectedClass}
          </h1>
        ) : (
          <h1 className="text-xl font-medium text-center mb-4 dark:text-white">
            {t.positioning}
          </h1>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-1">
            <ProgressHeader
              attendanceThreshold={attendanceThreshold}
              individualGoal={individualGoal}
            />
          </div>
          <div className="md:col-span-3">
            <div
              className={`grid grid-cols-1 ${
                compactView ? "md:grid-cols-1 lg:grid-cols-3" : "md:grid-cols-3"
              } gap-4`}
              style={{ height: "300px", minHeight: "300px" }}
            >
              <SemesterScatterPlot
                title="Semester 1"
                data={semesterScores[0]}
              />
              <SemesterScatterPlot
                title="Semester 2"
                data={semesterScores[1]}
              />
              <SemesterScatterPlot
                title="Semester 3"
                data={semesterScores[2]}
              />
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.eachDot}{" "}
              {selectedStudent && `${t.coloredDot} ${selectedStudent}.`}
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <Tabs
            defaultValue="semester1"
            className="w-full"
            onValueChange={setActiveSemester}
          >
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-2">
                {/* Selector voor sorteerveld */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <span>
                        {t.sortBy}:{" "}
                        {sortOption.field === "score"
                          ? t.score
                          : sortOption.field === "activities"
                          ? t.activities
                          : t.hoursPerWeek}
                      </span>
                      <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <DropdownMenuLabel>{t.sortBy}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex justify-between items-center"
                      onClick={() => handleSortChange("score")}
                    >
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{t.score}</span>
                      </div>
                      {sortOption.field === "score" && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex justify-between items-center"
                      onClick={() => handleSortChange("activities")}
                    >
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        <span>{t.activities}</span>
                      </div>
                      {sortOption.field === "activities" && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex justify-between items-center"
                      onClick={() => handleSortChange("hours")}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{t.hoursPerWeek}</span>
                      </div>
                      {sortOption.field === "hours" && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Selector voor sorteervolgorde */}
                <button
                  onClick={() => {
                    setSortOption((prev) => ({
                      ...prev,
                      direction: prev.direction === "asc" ? "desc" : "asc",
                    }));
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  title={
                    sortOption.direction === "asc" ? t.ascending : t.descending
                  }
                >
                  {sortOption.direction === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <TabsList className="grid grid-cols-3 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border-0 p-1">
              <TabsTrigger
                value="semester1"
                className="text-base text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 1;
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                {t.semester} 1
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="semester2"
                className="text-base text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 2;
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                {t.semester} 2
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="semester3"
                className="text-base text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                onClick={() => {
                  // Extract semester number from the tab value and store it
                  const semesterNum = 3;
                  // You can use this semesterNum value to pass to components that need it
                }}
              >
                {t.semester} 3
                <ChevronDown className="ml-1 h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            {compactView ? (
              // In compact view, only show the active semester
              <div>
                {activeSemester === "semester1" && renderSemester(1, true)}
                {activeSemester === "semester2" && renderSemester(2, true)}
                {activeSemester === "semester3" && renderSemester(3, true)}
              </div>
            ) : (
              // In regular view, show all semesters side by side
              <div className="grid grid-cols-3 gap-4">
                {selectedStudent ? (
                  <>
                    {renderSemester(1, activeSemester === "semester1")}
                    {renderSemester(2, activeSemester === "semester2")}
                    {renderSemester(3, activeSemester === "semester3")}
                  </>
                ) : (
                  <div className="col-span-3 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {t.noStudentSelected}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                        {t.selectStudent}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
