# CLAIRE

<div align="center">
  <img src="public/CLAIRE-Logo.png" alt="CLAIRE Logo" width="200" height="200" />
  <p><strong>Competency Learning Analytics for Insights and Reflection in Education</strong></p>
</div>

## Overview
CLAIRE is a dashboard designed to make learning data more accessible and insightful. Developed as a proof of concept (PoC) in collaboration with **KU Leuven**, **GITO Overijse**, and **Eummena**, it aims to support secondary school teachers in monitoring and interpreting student progress.

This project was initiated by Jonas Van Hove as part of his master’s thesis, _"Turning Learning Data into Meaningful Learning Analytics Dashboards"_ (2025). The dashboard was further developed in cooperation with Eummena to enhance its functionality and impact.

With great care, the CLAIRE dashboard has been crafted to serve as a valuable tool for future learning analytics dashboards, both within GITO and beyond.

---

## Project Overview

This prototype demonstrates a Learning Analytics Dashboard designed to support secondary school teachers in interpreting student progress during class councils.

### Key Features:
- **Student Selection & Notes** – Easily filter and select students, view profiles, and check teacher notes.
- **Competency Overview** – Track overall progress, achievements, and status across three semesters.
- **Subject Breakdown** – Visualize class distribution, achieved competencies, and evaluation activities.
- **Competency Details** – Identify competencies that need extra attention and see related evaluations.
- **Activity Insights** – Analyze test scores, assignments, and how students perform compared to their peers.

The dashboard aims to transform raw learning data into clear, actionable insights that enable teachers to make informed decisions during class councils.

💬 Your feedback is invaluable! Let us know your thoughts in the comments—every suggestion helps refine the tool.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository

2. Install dependencies
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Start the development server
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

The project is documented using TypeDoc. To generate the documentation, run:

\`\`\`bash
npm run docs
# or
yarn docs
\`\`\`

This will create a `docs` folder with the generated documentation. Open `docs/index.html` in your browser to view it.

## Project Structure

\`\`\`
claire-student-dashboard/
├── app/                  # Next.js app directory
│   ├── layout.tsx        # Root layout component
│   ├── page.tsx          # Home page component
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Other components
├── contexts/             # React contexts
│   ├── student-context.tsx  # Student context
│   └── ui-context.tsx    # UI context
├── data/                 # Mock data
│   └── student-data.ts   # Student data
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── services/             # API services
│   └── api.ts            # API service
├── types/                # TypeScript types
├── docs/                 # Generated documentation
└── ...                   # Configuration files
\`\`\`

## API Documentation

The API service is documented using JSDoc comments. The documentation is generated using TypeDoc and can be found in the `docs` folder.

### Key API Endpoints

- `getStudentList`: Get a list of students with filtering options
- `getStudentDetails`: Get detailed information for a specific student
- `getSemesterScores`: Get semester scores for class comparison
- `getSubjectCompetencies`: Get competencies for a specific subject
- `getCompetencyActivities`: Get activities for a specific competency
- `getSubjectActivities`: Get activities for a specific subject
- `getClassDistribution`: Get class distribution for a specific subject

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
