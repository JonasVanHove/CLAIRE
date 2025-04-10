document.addEventListener("DOMContentLoaded", () => {
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

  // Sample data for all visualizations
  // Each chartData array now represents the number of students in each score range
  // For example [3, 5, 7, 4, 6, 8, 5, 4, 3, 6] means:
  // 3 students scored 0-10%, 5 students scored 10-20%, etc.
  const semesterData = [
    {
      id: 1,
      subjects: [
        {
          subject: "Wiskunde",
          percentage: 81,
          competencies: "17/21",
          activities: 7,
          chartData: [1, 2, 3, 4, 8, 12, 18, 25, 15, 5],
          status: "success",
        },
        {
          subject: "Nederlands",
          percentage: 83,
          competencies: "15/18",
          activities: 5,
          chartData: [0, 1, 2, 3, 5, 10, 15, 28, 20, 8],
          status: "success",
        },
        {
          subject: "Frans",
          percentage: 81,
          competencies: "13/16",
          activities: 8,
          chartData: [1, 1, 2, 4, 6, 9, 20, 25, 18, 6],
          status: "success",
        },
        {
          subject: "Engels",
          percentage: 88,
          competencies: "14/16",
          activities: 6,
          chartData: [0, 1, 1, 2, 4, 8, 12, 22, 30, 12],
          status: "success",
        },
        {
          subject: "Levensbeschouwelijke vakken",
          percentage: 83,
          competencies: "10/12",
          activities: 2,
          chartData: [0, 1, 2, 3, 5, 8, 15, 25, 22, 10],
          status: "success",
        },
        {
          subject: "Geschiedenis",
          percentage: 77,
          competencies: "10/13",
          activities: 3,
          chartData: [1, 2, 3, 5, 8, 15, 25, 20, 12, 5],
          status: "success",
        },
        {
          subject: "Lichamelijke opvoeding",
          percentage: 50,
          competencies: "9/18",
          activities: 3,
          chartData: [5, 8, 12, 20, 25, 15, 8, 4, 2, 1],
          status: "warning",
        },
        {
          subject: "Mechanica",
          percentage: 93,
          competencies: "13/14",
          activities: 2,
          chartData: [0, 0, 1, 2, 3, 5, 10, 20, 30, 25],
          status: "success",
        },
        {
          subject: "Elektromachnetisme",
          percentage: 94,
          competencies: "15/16",
          activities: 2,
          chartData: [0, 0, 1, 1, 2, 4, 8, 18, 32, 28],
          status: "success",
        },
        {
          subject: "Natuurwetenschappen",
          percentage: 93,
          competencies: "14/15",
          activities: 4,
          chartData: [0, 0, 1, 2, 3, 6, 12, 22, 28, 22],
          status: "success",
        },
        {
          subject: "Artistieke vorming",
          percentage: 91,
          competencies: "10/11",
          activities: 3,
          chartData: [0, 1, 1, 2, 4, 7, 15, 25, 25, 15],
          status: "success",
        },
        {
          subject: "Toegepaste informatica",
          percentage: 35,
          competencies: "6/17",
          activities: 2,
          chartData: [15, 25, 20, 15, 10, 8, 4, 2, 1, 0],
          status: "danger",
        },
        {
          subject: "Thermodynamica",
          percentage: 87,
          competencies: "13/15",
          activities: 2,
          chartData: [0, 1, 2, 3, 5, 8, 15, 25, 22, 12],
          status: "success",
        },
        {
          subject: "Project STEM",
          percentage: 75,
          competencies: "6/8",
          activities: 3,
          chartData: [1, 2, 4, 6, 10, 20, 25, 18, 10, 4],
          status: "success",
        },
      ],
    },
    {
      id: 2,
      subjects: [
        {
          subject: "Wiskunde",
          percentage: 82,
          competencies: "23/28",
          activities: 4,
          chartData: [0, 1, 2, 3, 6, 10, 18, 25, 22, 8],
          status: "success",
        },
        {
          subject: "Nederlands",
          percentage: 78,
          competencies: "18/23",
          activities: 2,
          chartData: [1, 2, 3, 4, 8, 15, 25, 22, 12, 5],
          status: "success",
        },
        {
          subject: "Frans",
          percentage: 84,
          competencies: "16/19",
          activities: 5,
          chartData: [0, 1, 2, 3, 5, 8, 15, 25, 25, 10],
          status: "success",
        },
        {
          subject: "Engels",
          percentage: 75,
          competencies: "15/20",
          activities: 3,
          chartData: [1, 2, 3, 5, 10, 20, 25, 18, 10, 5],
          status: "success",
        },
        {
          subject: "Levensbeschouwelijke vakken",
          percentage: 81,
          competencies: "13/16",
          activities: 2,
          chartData: [0, 1, 2, 4, 6, 12, 20, 25, 18, 8],
          status: "success",
        },
        {
          subject: "Geschiedenis",
          percentage: 81,
          competencies: "13/16",
          activities: 1,
          chartData: [0, 1, 2, 4, 6, 12, 20, 25, 18, 8],
          status: "success",
        },
        {
          subject: "Lichamelijke opvoeding",
          percentage: 68,
          competencies: "15/22",
          activities: 2,
          chartData: [2, 3, 5, 8, 15, 25, 20, 12, 6, 3],
          status: "warning",
        },
      ],
    },
    {
      id: 3,
      subjects: [
        {
          subject: "Wiskunde",
          percentage: 86,
          competencies: "24/28",
          activities: 3,
          chartData: [0, 1, 1, 2, 4, 8, 15, 25, 28, 12],
          status: "success",
        },
        {
          subject: "Nederlands",
          percentage: 87,
          competencies: "20/23",
          activities: 4,
          chartData: [0, 1, 1, 2, 4, 8, 12, 22, 30, 15],
          status: "success",
        },
        {
          subject: "Frans",
          percentage: 89,
          competencies: "17/19",
          activities: 2,
          chartData: [0, 0, 1, 2, 3, 6, 12, 20, 32, 18],
          status: "success",
        },
        {
          subject: "Engels",
          percentage: 80,
          competencies: "16/20",
          activities: 3,
          chartData: [0, 1, 2, 3, 6, 12, 20, 25, 18, 8],
          status: "success",
        },
        {
          subject: "Levensbeschouwelijke vakken",
          percentage: 94,
          competencies: "15/16",
          activities: 1,
          chartData: [0, 0, 0, 1, 2, 3, 8, 18, 32, 30],
          status: "success",
        },
        {
          subject: "Geschiedenis",
          percentage: 94,
          competencies: "15/16",
          activities: 3,
          chartData: [0, 0, 0, 1, 2, 3, 8, 18, 32, 30],
          status: "success",
        },
        {
          subject: "Lichamelijke opvoeding",
          percentage: 91,
          competencies: "20/22",
          activities: 3,
          chartData: [0, 0, 1, 2, 3, 6, 12, 22, 30, 18],
          status: "success",
        },
      ],
    },
  ]

  // Declare d3 variable
  const d3 = window.d3

  // Create dot plots using D3.js
  createDotPlots()

  // Create subject cards using D3.js
  createSubjectCards()

  // Function to create dot plots with D3.js
  function createDotPlots() {
    for (let i = 1; i <= 3; i++) {
      const dotPlotId = `dot-plot-${i}`
      const container = d3.select(`#${dotPlotId}`)

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
      const xScale = d3.scaleLinear().domain([-10, 10]).range([0, innerWidth])

      const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

      // Create axes
      const yAxis = d3.axisLeft(yScale).tickValues([20, 40, 60, 80, 100]).tickSize(-innerWidth)

      svg.append("g").attr("class", "axis y-axis").call(yAxis)

      // Remove x-axis line
      svg.select(".y-axis path").remove()

      // Generate dot pattern data
      const generateDotPattern = () => {
        const dots = []

        // Create a diamond-like pattern
        for (let y = -10; y <= 10; y++) {
          const rowWidth = 10 - Math.abs(y)
          for (let x = -rowWidth; x <= rowWidth; x++) {
            if (Math.random() > 0.2) {
              // Add some randomness
              dots.push({
                x: x,
                y: 50 + y * 2 + Math.random() * 10 - 5, // Center around 50 with some variation
              })
            }
          }
        }

        return dots
      }

      const dots = generateDotPattern()

      // Draw dots
      svg
        .selectAll(".dot")
        .data(dots)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", 3)
        .attr("opacity", 0.8)
        .on("mouseover", function () {
          d3.select(this).transition().duration(200).attr("r", 5)
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("r", 3)
        })
    }
  }

  // Function to create subject cards using D3.js
  function createSubjectCards() {
    // Create cards for each semester
    semesterData.forEach((semester) => {
      const semesterId = `semester${semester.id}`
      const container = d3.select(`#${semesterId}-grid`)

      // Create a card for each subject
      const cards = container
        .selectAll(".subject-card")
        .data(semester.subjects)
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
        .text((d) => `${d.percentage}%`)

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
    })
  }

  // Handle window resize for responsive charts
  window.addEventListener("resize", () => {
    // Clear existing charts
    d3.selectAll(".dot-plot svg").remove()

    // Recreate charts with new dimensions
    createDotPlots()
  })
})
