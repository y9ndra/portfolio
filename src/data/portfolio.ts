export const PERSONAL = {
  name: "Yugendhra E",
  title: "Software Developer",
  tagline: "Building scalable backend systems and full-stack applications.",
  about: [
    "I'm an Information Technology graduate with a thing for <strong>building software</strong> and figuring out <strong>how it works under the hood</strong>. You'll usually find me <strong>building backend systems, solving DSA problems</strong>, or turning <strong>random ideas into projects</strong> that teach me something new."
  ],
  email: "yugendhra18@gmail.com",
  github: "https://github.com/y9ndra",
  linkedin: "https://www.linkedin.com/in/y9ndra",
  leetcode: "https://leetcode.com/u/y9ndra/",
  resume: "/assets/resume/resume.pdf",
  avatar: "/assets/images/profile_bw_v4.png",
};

export const SKILLS = [
  {
    category: "Languages",
    items: ["C++", "Java", "Python", "JavaScript", "TypeScript"],
  },
  {
    category: "Frontend",
    items: ["HTML", "CSS", "React", "Next.js"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "Socket.IO", "WebRTC"],
  },
  {
    category: "Databases",
    items: ["MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase"],
  },
  {
    category: "Tools",
    items: ["Git", "GitHub", "Render", "Vercel", "Postman", "VS Code", "Antigravity", "Windsurf"],
  },
];


export const PROJECTS = [
  {
    id: "spendwise",
    title: "SpendWise",
    year: "2025",
    description:
      "Expense tracker backend with JWT authentication, user-specific data handling, filtering, pagination, and expense analytics.",
    tech: ["Node.js", "Express", "MongoDB", "JWT", "Docker", "Bcrypt", "Postman", "Render"],
    github: "https://github.com/y9ndra/SpendWise",
    demo: "https://spendwise-nlql.onrender.com",
    image: "/assets/images/spendwise.jpg",
    highlights: [
      "Built registration/login routes secured via encrypted hashing and authorization tokens",
      "Designed data policies that isolate records strictly to their respective owner identity",
      "Created server-side pagination with flexible date and category filters for records",
      "Developed aggregation queries to dynamically compute category and time-series summaries",
      "Wrote structured data indexing paths to accelerate document lookup speed"
    ],
    learned: [
      "<strong>REST API Patterns:</strong> Clean route setup, modular controllers, and strict user data isolation.",
      "<strong>Security & Auth:</strong> Password hashing via Bcrypt and stateless user authorization using JSON Web Tokens (JWT).",
      "<strong>Database Performance:</strong> Designing MongoDB schemas and setting up compound indexing to accelerate queries.",
      "<strong>DevOps & Deployment:</strong> Building Dockerized container environments and hosting/managing live backends on Render."
    ],
    stats: [
      { label: "Query Speed", value: "< 15ms" },
      { label: "Auth Type", value: "JWT + Bcrypt" },
      { label: "Deployment", value: "Docker/Render" },
      { label: "API Standard", value: "RESTful" }
    ]
  },
  {
    id: "onepiece-website",
    title: "One Piece Themed Website",
    year: "2024",
    description:
      "A responsive One Piece themed website built using pure HTML and CSS with immersive design and animations.",
    tech: ["HTML", "CSS"],
    github: "https://github.com/y9ndra/One-Piece-Themed-Website",
    demo: "https://y9ndra.github.io/One-Piece-Themed-Website",
    image: "/assets/images/onepiece.png",
    highlights: [
      "Designed and built a multi-section fan website themed around the One Piece anime series",
      "Wrote semantic HTML5 tags and clean CSS stylesheets without any frontend frameworks",
      "Implemented fluid multi-column alignments with CSS Flexbox and CSS Grid systems",
      "Created custom keyframe animations and transitions for interactive UI elements",
      "Applied media queries to achieve a fully responsive mobile-friendly layout"
    ],
    learned: [
      "<strong>Semantic Structure:</strong> Mastered HTML5 tags to build clean, accessible layout trees from scratch.",
      "<strong>Layout Systems:</strong> Used CSS Flexbox and Grid to align multi-dimensional visual components.",
      "<strong>Responsive Design:</strong> Wrote custom media queries to build a fully adaptive mobile-friendly website.",
      "<strong>Animations:</strong> Created transitions and hover effects using pure CSS styles without JavaScript."
    ],
    stats: [
      { label: "Frameworks Used", value: "None (Pure)" },
      { label: "Layout Method", value: "Flexbox & Grid" },
      { label: "Styling Type", value: "Pure CSS3" }
    ]
  },
];

export const EXPERIENCES = [
  {
    company: "BigSIBucks Innovation",
    role: "Full Stack Development Intern",
    date: "Jun 2025 – Jul 2025",
    status: "Done",
    logo: "/assets/images/bigsibucks.jpg",
    description: [
      "Learned and applied fundamentals of HTML, CSS, and JavaScript through guided internship tasks"
    ],
  },
  {
    company: "Altruisty",
    role: "Full Stack Development Intern",
    date: "Oct 2024 – Dec 2024",
    status: "Done",
    logo: "/assets/images/Altruisty.jpg",
    description: [
      "Designed the front-end UI for a College Management System focusing on usability and layout consistency",
      "Gained hands-on experience in UI structuring and front-end design workflows"
    ],
  },
  {
    company: "SystemTron",
    role: "Web Development Intern",
    date: "Mar 2024 – Apr 2024",
    status: "Done",
    logo: "/assets/images/Systemtron1.jpg",
    description: [
      "Developed a Netflix-inspired static website as the primary internship project",
      "Built mini projects including a Calculator and Connect 4 Dots game to strengthen front-end fundamentals"
    ],
  },
];
