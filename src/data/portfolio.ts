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
  avatar: "/assets/images/profile+v6.png",
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

export const BLOGS = [
  {
    id: "node-js-the-accidental-backend",
    title: "Node.js : The Accidental Backend",
    date: "Jul 2026",
    description: "A deep dive into the history, execution model, and unexpected rise of Node.js as a dominant force in backend development.",
    tags: ["Node.js", "Backend", "JavaScript", "History"],
    image: "/assets/images/Accidental-Backend.png",
    readTime: "22 min read",
    parts: [
      {
        id: "node-js-the-accidental-backend-part-1",
        title: "Part 1: The Accidental Success",
        description: "Exploring the genesis of Node.js, the integration of Chrome's V8 engine, and the design of the non-blocking event loop.",
        chapterPreviews: [
          "The Birth of a Mistake",
          "Chrome's Secret Weapon",
          "The Magic of the Loop",
          "The Unintended Standard",
          "The Monolithic Myth"
        ]
      },
      {
        id: "node-js-the-accidental-backend-part-2",
        title: "Part 2: The Modern Powerhouse",
        description: "Exploring the npm package ecosystem, scaling in the enterprise, the transition to modern ES Modules, runtime rivals, and next-gen paradigms.",
        chapterPreviews: [
          "The Package Explosion",
          "Enterprise Takeover",
          "Under the Hood Evolution",
          "Rising Rivals",
          "The Future of the Accidental Giant"
        ]
      }
    ]
  },
  {
    id: "node-js-the-accidental-backend-part-1",
    title: "Node.js : The Accidental Backend (Part 1)",
    date: "Jul 2026",
    description: "Part 1 of a deep dive into the history, execution model, and unexpected rise of Node.js as a dominant force in backend development.",
    tags: ["Node.js", "Backend", "JavaScript", "History"],
    image: "/assets/images/Accidental-Backend.png",
    readTime: "10 min read",
    chapters: [
      {
        title: "Chapter 1: The Birth of a Mistake",
        subtitle: "How Ryan Dahl's quest for progress bars accidentally sparked a server-side JavaScript revolution.",
        content: "Ryan Dahl originally created Node.js not to build general-purpose backend applications, but to solve a specific, seemingly minor problem: file upload progress bars. In 2009, web servers struggled with concurrent connections, blocking threads for every open socket. By combining Google's V8 engine with an event loop, Dahl created a runtime that handled I/O asynchronously, paving the way for real-time web applications."
      },
      {
        title: "Chapter 2: Chrome's Secret Weapon",
        subtitle: "How the V8 JavaScript engine broke free from the browser sandbox.",
        content: "Before 2008, JavaScript was widely considered a slow, client-side scripting language for browser alerts. Google's release of the Chrome browser and its open-source V8 engine changed everything. V8 compiled JavaScript directly to native machine code, providing the speed and performance that made server-side JavaScript not just possible, but highly competitive with languages like Java and C++."
      },
      {
        title: "Chapter 3: The Magic of the Loop",
        subtitle: "Demystifying non-blocking I/O and the single-threaded event loop.",
        content: "Unlike traditional multi-threaded web servers that spawn a new thread for each connection, Node.js runs on a single main thread. It achieves concurrency through non-blocking system calls and an event loop (libuv). When Node.js performs a file read or network request, it delegates the operation to the operating system and continues executing, calling the registered callback only when the operation completes."
      },
      {
        title: "Chapter 4: The Unintended Standard",
        subtitle: "How Express and the early community shaped Node.js into a backend powerhouse.",
        content: "While Node's core APIs were low-level, developers quickly built abstractions. The emergence of TJ Holowaychuk's Express framework in 2010 defined the routing and middleware patterns that remain standard today. Express made building APIs simple and accessible, drawing thousands of frontend developers into the backend ecosystem and establishing Node.js as the default choice for quick server setups."
      },
      {
        title: "Chapter 5: The Monolithic Myth",
        subtitle: "Early scalability, callbacks, and the struggles of growing up.",
        content: "As Node.js applications grew, so did their complexity. Early developers faced the dreaded 'callback hell'—deeply nested asynchronous operations that made code hard to read and debug. Furthermore, the single-threaded nature of Node meant that CPU-bound operations could block the entire server. This chapter explores how the community navigated these early scalability bottlenecks."
      }
    ]
  },
  {
    id: "node-js-the-accidental-backend-part-2",
    title: "Node.js : The Accidental Backend (Part 2)",
    date: "Jul 2026",
    description: "Part 2 exploring the package ecosystem explosion, enterprise adoption at scale, modern runtime competitors, and the legacy/future of Node.",
    tags: ["Node.js", "Backend", "Ecosystem", "Scaling"],
    image: "/assets/images/Accidental-Backend.png",
    readTime: "12 min read",
    chapters: [
      {
        title: "Chapter 1: The Package Explosion",
        subtitle: "The rise of npm and the double-edged sword of dependencies.",
        content: "Isaac Z. Schlueter created npm (Node Package Manager) in 2010, which became the largest software registry in the world. While npm enabled unprecedented code reuse and rapid prototyping, it also introduced security challenges, bloated node_modules directories, and dependency reliability issues—making modern package management a complex balancing act."
      },
      {
        title: "Chapter 2: Enterprise Takeover",
        subtitle: "How Netflix, PayPal, and Walmart shifted to Node.js at scale.",
        content: "Despite initial skepticism about JavaScript on the server, major enterprises began adopting Node.js. PayPal replaced its Java stack with Node.js and saw double the request throughput with half the development effort. Netflix moved its startup scripts to Node, slashing boot times. These success stories cemented Node.js as a production-grade enterprise runtime."
      },
      {
        title: "Chapter 3: Under the Hood Evolution",
        subtitle: "From callback hell to Promises, Async/Await, and modern ES Modules.",
        content: "Node's syntax and runtime capabilities evolved dramatically to support enterprise codebases. Callback-based APIs were wrapped in Promises, and the addition of Async/Await made asynchronous code look and behave like synchronous code. The transition to ES Modules (import/export) standard brought Node.js align with browser standards, closing the syntax gap."
      },
      {
        title: "Chapter 4: Rising Rivals",
        subtitle: "Comparing Node.js with next-generation runtimes like Deno and Bun.",
        content: "In recent years, new contenders have emerged to address Node's historical limitations. Deno, created by Ryan Dahl himself, focuses on security, TypeScript support, and web standards. Bun, written from scratch in Zig and powered by JavascriptCore, targets raw speed. We analyze how these competitors are pushing Node.js to innovate faster."
      },
      {
        title: "Chapter 5: The Future of the Accidental Giant",
        subtitle: "Serverless architectures, edge computing, and Node's lasting legacy.",
        content: "As infrastructure shifts from long-running servers to serverless functions and edge computing, Node.js remains a primary runtime. Modern Node.js versions include native test runners, watch modes, and built-in SQLite integration. The accidental backend runtime continues to adapt, proving that the software built on it will shape the web for decades to come."
      }
    ]
  }
];

