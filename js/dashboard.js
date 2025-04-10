document.addEventListener("DOMContentLoaded", () => {
  // Get dashboard container and data attributes
  const dashboard = document.querySelector(".student-dashboard")
  if (!dashboard) return

  const currentStudent = dashboard.dataset.student
  const currentClass = dashboard.dataset.class

  // Initialize the dashboard
  initializeDashboard(currentStudent, currentClass)

  // Tab switching functionality
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      const tabId = button.getAttribute("data-tab")
      document.getElementById(tabId).classList.add("active")
    })
  })

  // Student selector dropdown
  const selectorButton = document.querySelector(".student-selector-button")
  const dropdown = document.querySelector(".student-dropdown")

  if (selectorButton && dropdown) {
    selectorButton.addEventListener("click", () => {
      const isVisible = dropdown.style.display === "block"
      dropdown.style.display = isVisible ? "none" : "block"

      // If opening the dropdown, populate it
      if (!isVisible) {
        populateStudentDropdown(dropdown, currentClass, currentStudent)
      }
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!selectorButton.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = "none"
      }
    })
  }
})

function initializeDashboard(studentName, className) {
  // Fetch student data from the server
  fetchStudentData(studentName, className)
    .then((data) => {
      // Update competencies progress
      updateCompetenciesProgress(data.competencies)

      // Create dot plots
      createDotPlots(data.semesterScores)

      // Create subject cards
      createSubjectCards(data.semesterSubjects)
    })
    .catch((error) => {
      console.error("Error initializing dashboard:", error)
      // Show error message on the dashboard
      document.querySelector(".dashboard-content").innerHTML = `
                <div class="error-message">
                    <p>Er is een fout opgetreden bij het laden van de gegevens. Probeer het later opnieuw.</p>
                </div>
            `
    })
}

function fetchStudentData(studentName, className) {
  // In a real implementation, this would make an AJAX call to a Moodle web service
  // For this example, we'll simulate the data

  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Generate mock data for the student
      const data = generateMockStudentData(studentName, className)
      resolve(data)
    }, 500)
  })
}

function generateMockStudentData(studentName, className) {
  // Define the subjects
  const SUBJECTS = [
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
  ]

  // Generate competencies data
  const competencies = {
    achieved: 165,
    total: 210,
  }

  // Generate semester scores for class comparison
  const semesterScores = [1, 2, 3].map((semester) => {
    // Generate 20-30 students per class
    const studentCount = 20 + Math.floor(Math.random() * 10)
    const scores = []

    for (let i = 0; i < studentCount; i++) {
      const isCurrentStudent = i === 0 // First student is the current one
      const baseScore = isCurrentStudent ? 75 : 40 + Math.random() * 50
      const semesterBonus = (semester - 1) * 5
      const variation = Math.random() * 20 - 10

      let score = baseScore + semesterBonus + variation
      score = Math.max(0, Math.min(100, score))

      scores.push({
        name: isCurrentStudent ? studentName : `Student ${i}`,
        score: score,
        isCurrentStudent: isCurrentStudent,
      })
    }

    return {
      semester: semester,
      scores: scores,
    }
  })

  // Generate subject data for each semester
  const semesterSubjects = {}

  for (let semester = 1; semester <= 3; semester++) {
    semesterSubjects[semester] = []

    // Not all subjects are available in each semester
    const semesterSubjectCount = semester === 1 ? SUBJECTS.length : 7
    const subjectsForSemester = SUBJECTS.slice(0, semesterSubjectCount)

    subjectsForSemester.forEach((subject) => {
      // Generate a base score that's consistent for a student (with some variation)
      const baseScore = 75 + Math.random() * 15 // Student is generally good

      // Add some progression across semesters
      const semesterBonus = (semester - 1) * 5

      // Add subject-specific variation
      const subjectVariation = Math.random() * 20 - 10

      // Calculate final score
      let score = baseScore + semesterBonus + subjectVariation

      // Special cases
      if (subject === "Lichamelijke opvoeding" && semester === 1) {
        score = 50 // Struggles with PE in semester 1
      }
      if (subject === "Toegepaste informatica" && semester === 1) {
        score = 35 // Really struggles with computer science
      }

      // Clamp score between 0 and 100
      score = Math.max(0, Math.min(100, score))

      // Calculate competencies
      const totalCompetencies = 10 + Math.floor(Math.random() * 15)
      const achievedCompetencies = Math.floor((score / 100) * totalCompetencies)

      // Generate chart data (distribution of students by score)
      const chartData = Array(10)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))

      semesterSubjects[semester].push({
        subject: subject,
        percentage: score,
        competencies: `${achievedCompetencies}/${totalCompetencies}`,
        activities: 1 + Math.floor(Math.random() * 7),
        chartData: chartData,
        status: score < 50 ? "danger" : score < 70 ? "warning" : "success",
      })
    })
  }

  return {
    competencies: competencies,
    semesterScores: semesterScores,
    semesterSubjects: semesterSubjects,
  }
}

function updateCompetenciesProgress(competencies) {
  const valueElement = document.getElementById("competencies-value")
  const fillElement = document.getElementById("competencies-fill")

  if (valueElement && fillElement) {
    valueElement.textContent = `${competencies.achieved}/${competencies.total}`

    const percentage = (competencies.achieved / competencies.total) * 100
    fillElement.style.width = `${percentage}%`
  }
}

function createDotPlots(semesterScores) {
  // Check if d3 is available
  if (!window.d3) {
    console.error("D3.js is not loaded")
    return
  }

  const d3 = window.d3

  semesterScores.forEach((semesterData) => {
    const semester = semesterData.semester
    const dotPlotId = `dot-plot-${semester}`
    const container = d3.select(`#${dotPlotId}`)

    if (container.empty()) {
      console.warn(`Container #${dotPlotId} not found`)
      return
    }

    // Set dimensions and margins
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = container.node().getBoundingClientRect().width
    const height = 200
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create SVG
    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

    // Create axes
    const yAxis = d3.axisLeft(yScale).tickValues([20, 40, 60, 80, 100]).tickSize(-innerWidth)

    svg.append("g").attr("class", "axis y-axis").call(yAxis)

    // Remove x-axis line
    svg.select(".y-axis path").remove()

    // Sort data by score to ensure consistent positioning
    const sortedData = [...semesterData.scores].sort((a, b) => a.score - b.score)

    // Calculate x positions with a natural distribution
    const centerX = innerWidth / 2
    const xSpread = innerWidth * 0.8 // Use 80% of the plot width for the spread

    // Draw non-current student dots first
    sortedData.forEach((point, index) => {
      if (point.isCurrentStudent) return // Skip current student for now

      // Convert score to y position (100 at top, 0 at bottom)
      const yPos = yScale(point.score)

      // Create a bell curve-like distribution on x-axis
      const normalizedPos = (index / sortedData.length) * 2 - 1 // -1 to 1
      const xOffset = Math.sin(normalizedPos * Math.PI) * (xSpread / 2)
      const xPos = centerX + xOffset + (Math.random() * 4 - 2) // Add small random jitter

      // Draw the dot
      svg
        .append("circle")
        .attr("class", "dot")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("r", 3)
        .attr("opacity", 0.7 + Math.random() * 0.3)
    })

    // Now draw the current student dot on top
    const currentStudent = sortedData.find((point) => point.isCurrentStudent)
    if (currentStudent) {
      // Find the position of the current student in the sorted array
      const index = sortedData.findIndex((point) => point.isCurrentStudent)

      // Convert score to y position (100 at top, 0 at bottom)
      const yPos = yScale(currentStudent.score)

      // Create a bell curve-like distribution on x-axis
      const normalizedPos = (index / sortedData.length) * 2 - 1 // -1 to 1
      const xOffset = Math.sin(normalizedPos * Math.PI) * (xSpread / 2)
      const xPos = centerX + xOffset

      // Draw the current student dot
      svg
        .append("circle")
        .attr("class", "dot current-student")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("r", 5)
        .attr("fill", "#000")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
    }
  })
}

function createSubjectCards(semesterSubjects) {
  // Check if d3 is available
  if (!window.d3) {
    console.error("D3.js is not loaded")
    return
  }

  const d3 = window.d3

  // Create cards for each semester
  for (let semester = 1; semester <= 3; semester++) {
    const semesterId = `semester${semester}`
    const container = d3.select(`#${semesterId}-grid`)

    if (container.empty()) {
      console.warn(`Container #${semesterId}-grid not found`)
      continue
    }

    const subjects = semesterSubjects[semester] || []

    // Create a card for each subject
    const cards = container
      .selectAll(".subject-card")
      .data(subjects)
      .enter()
      .append("div")
      .attr("class", "subject-card")

    // Add header with subject name and percentage
    const headers = cards.append("div").attr("class", "subject-header")

    headers
      .append("div")
      .attr("class", "subject-title")
      .text((d) => d.subject)

    headers
      .append("div")
      .attr("class", "subject-percentage")
      .text((d) => `${d.percentage.toFixed(2)}%`)

    // Add competencies info
    cards
      .append("div")
      .attr("class", "subject-competencies")
      .text((d) => `${d.competencies} competenties`)

    // Add chart using D3
    const chartContainers = cards.append("div").attr("class", "subject-chart")

    // Create SVG for each chart
    const chartSvgs = chartContainers
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0 0 200 64")

    // Calculate bar width based on number of data points
    const barWidth = 200 / 12 // 10 bars + some padding

    // Add bars to charts - these represent student score distributions
    const bars = chartSvgs
      .selectAll(".chart-bar")
      .data((d) =>
        d.chartData.map((value, index) => ({
          value,
          max: Math.max(...d.chartData),
          scoreRange: `${index * 10}-${(index + 1) * 10}%`,
          studentCount: value,
        })),
      )
      .enter()
      .append("rect")
      .attr("class", "chart-bar")
      .attr("x", (d, i) => i * barWidth + 2)
      .attr("y", (d) => 64 - (d.value / d.max) * 64)
      .attr("width", barWidth - 4)
      .attr("height", (d) => (d.value / d.max) * 64)
      .attr("rx", 2)
      .attr("ry", 2)

    // Add tooltips to bars
    bars.append("title").text((d) => `${d.scoreRange}: ${d.studentCount} leerlingen`)

    // Add progress bar
    const progressContainers = cards.append("div").attr("class", "subject-progress")

    const progressSvgs = progressContainers
      .append("svg")
      .attr("width", "100%")
      .attr("height", "6")
      .attr("viewBox", "0 0 200 6")

    // Add background rect
    progressSvgs
      .append("rect")
      .attr("class", "progress-bg")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 200)
      .attr("height", 6)

    // Add foreground rect (progress)
    progressSvgs
      .append("rect")
      .attr("class", "progress-fg")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", (d) => d.percentage * 2) // Scale to fit 200px width
      .attr("height", 6)

    // Add status indicator
    cards
      .append("div")
      .attr("class", (d) => `subject-status ${d.status}`)
      .style("height", "6px")

    // Add activities count
    cards
      .append("div")
      .attr("class", "subject-activities")
      .text((d) => `${d.activities} activiteiten`)
  }
}

function populateStudentDropdown(dropdown, currentClass, currentStudent) {
  // In a real implementation, this would fetch students from the server
  // For this example, we'll generate mock data

  const classes = ["3STEM", "3TW", "3LAT"]
  const studentsByClass = {
    "3STEM": [
      { name: "Marc Vertongen", atRisk: false },
      { name: "Emma Peeters", atRisk: false },
      { name: "Thomas Janssens", atRisk: true },
      { name: "Sophie Maes", atRisk: false },
      { name: "Lukas Wouters", atRisk: true },
      { name: "Nina Vermeulen", atRisk: false },
      { name: "Daan De Vos", atRisk: false },
      { name: "Lotte Jacobs", atRisk: false },
    ],
    "3TW": [
      { name: "Lucas Dubois", atRisk: false },
      { name: "Nora Van den Berg", atRisk: true },
      { name: "Elias Coppens", atRisk: false },
      { name: "Julie De Smet", atRisk: false },
      { name: "Mathis Peeters", atRisk: true },
      { name: "Olivia Janssens", atRisk: false },
    ],
    "3LAT": [
      { name: "Finn Jacobs", atRisk: false },
      { name: "Mila Martens", atRisk: true },
      { name: "Arthur Claes", atRisk: false },
      { name: "Noor Willems", atRisk: false },
      { name: "Victor Smets", atRisk: false },
      { name: "Fleur Dubois", atRisk: true },
    ],
  }

  // Clear existing content
  dropdown.innerHTML = ""

  // Create dropdown sections for each class
  classes.forEach((className) => {
    const section = document.createElement("div")
    section.className = "dropdown-section"

    const label = document.createElement("div")
    label.className = "dropdown-label"
    label.textContent = className
    section.appendChild(label)

    const students = studentsByClass[className] || []
    students.forEach((student) => {
      const item = document.createElement("div")
      item.className = "dropdown-item"
      if (student.name === currentStudent) {
        item.classList.add("active")
      }

      const itemText = document.createElement("div")
      itemText.className = "dropdown-item-text"

      // Add user icon
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      icon.setAttribute("width", "16")
      icon.setAttribute("height", "16")
      icon.setAttribute("viewBox", "0 0 24 24")
      icon.setAttribute("fill", "none")
      icon.setAttribute("stroke", "currentColor")
      icon.setAttribute("stroke-width", "2")
      icon.setAttribute("stroke-linecap", "round")
      icon.setAttribute("stroke-linejoin", "round")

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", "12")
      circle.setAttribute("cy", "7")
      circle.setAttribute("r", "4")
      icon.appendChild(circle)

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2")
      icon.appendChild(path)

      itemText.appendChild(icon)

      const name = document.createElement("span")
      name.textContent = student.name
      itemText.appendChild(name)

      // Add warning triangle for at-risk students
      const warningIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      warningIcon.setAttribute("class", "warning-icon")
      warningIcon.setAttribute("width", "16")
      warningIcon.setAttribute("height", "16")
      warningIcon.setAttribute("viewBox", "0 0 24 24")
      warningIcon.setAttribute("fill", "none")
      warningIcon.setAttribute("stroke", "#49454F")
      warningIcon.setAttribute("stroke-width", "2")
      warningIcon.setAttribute("stroke-linecap", "round")
      warningIcon.setAttribute("stroke-linejoin", "round")

      const triangle = document.createElementNS("http://www.w3.org/2000/svg", "path")
      triangle.setAttribute(
        "d",
        "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
      )
      warningIcon.appendChild(triangle)

      const exclamation = document.createElementNS("http://www.w3.org/2000/svg", "line")
      exclamation.setAttribute("x1", "12")
      exclamation.setAttribute("y1", "9")
      exclamation.setAttribute("x2", "12")
      exclamation.setAttribute("y2", "13")
      warningIcon.appendChild(exclamation)

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "line")
      dot.setAttribute("x1", "12")
      dot.setAttribute("y1", "17")
      dot.setAttribute("x2", "12.01")
      dot.setAttribute("y2", "17")
      warningIcon.appendChild(dot)

      itemText.appendChild(warningIcon)
      // Add check icon for current student
      if (student.name === currentStudent) {
        const check = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        check.setAttribute("width", "16")
        check.setAttribute("height", "16")
        check.setAttribute("viewBox", "0 0 24 24")
        check.setAttribute("fill", "none")
        check.setAttribute("stroke", "currentColor")
        check.setAttribute("stroke-width", "2")
        check.setAttribute("stroke-linecap", "round")
        check.setAttribute("stroke-linejoin", "round")

        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
        polyline.setAttribute("points", "20 6 9 17 4 12")
        check.appendChild(polyline)

        item.appendChild(check)
      }

      item.appendChild(itemText)

      // Add click event to switch student

      item.addEventListener("click", () => {
        // In a real implementation, this would reload the dashboard with the new student
        // For this example, we'll just reload the page
        window.location.reload()
      })

      section.appendChild(item)
    })

    dropdown.appendChild(section)
  })
}
