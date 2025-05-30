# CLAIRE

<div align="center">
  <img src="public/CLAIRE-Logo.png" alt="CLAIRE Logo" width="200" height="200" />
  <p><strong>Competency Learning Analytics for Insights and Reflection in Education</strong></p>
</div>

## Overview
CLAIRE is a dashboard designed to support the interpretation of learning data. It was developed as a proof of concept (PoC) by a master's student in Applied Computer Science at KU Leuven.

This dashboard was created by Jonas Van Hove as part of his master's thesis titled "Turning Learning Data into Meaningful Learning Analytics Dashboards" (2025).

Developed with care, in the hope that CLAIRE will serve as a useful foundation for future data-driven tools in education.

---

## Project Overview

This prototype demonstrates a Learning Analytics Dashboard designed to support secondary school teachers in interpreting student progress.

### Key Features:
- **Student Selection & Notes** – Easily filter and select students, view profiles, and check teacher notes.
- **Competency Overview** – Track overall progress, achievements, and status across three semesters.
- **Subject Breakdown** – Visualize class distribution, achieved competencies, and evaluation activities.
- **Competency Details** – Identify competencies that need extra attention and see related evaluations.
- **Activity Insights** – Analyze test scores, assignments, and how students perform compared to their peers.

The dashboard aims to transform raw learning data into clear, actionable insights that enable teachers to make informed decisions.

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
