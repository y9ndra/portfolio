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
    description: "The story of how a browser scripting language accidentally became one of the world's most influential backend runtimes.",
    tags: ["Node.js", "Backend", "JavaScript", "History"],
    image: "/assets/images/Accidental-Backend.jpg",
    readTime: "20 min read",
    parts: [
      {
        id: "node-js-the-accidental-backend-part-1",
        title: "Part 1: The Escape",
        description: "Before JavaScript could become a backend language, it first had to escape the only place it had ever known.",
        readTime: "10 min read",
        chapterPreviews: [
          "Before the Escape",
          "1. A Language Built in 10 Days",
          "2. Trapped Inside The Browser",
          "3. The Engine That Changed Everything",
          "4. The Birth Of Node.js",
          "The Story Continues..."
        ]
      },
      {
        id: "node-js-the-accidental-backend-part-2",
        title: "Part 2: Behind The Curtain",
        description: "Now we know why Node.js exists. It's time to see what actually happens behind the curtain.",
        readTime: "10 min read",
        chapterPreviews: [
          "Before We Look Behind",
          "1. More Than Just a Runtime",
          "2. The Single-Threaded Myth",
          "3. The Event Loop",
          "4. The Hidden Workers",
          "The Curtain Falls"
        ]
      }
    ]
  },
  {
    id: "node-js-the-accidental-backend-part-1",
    title: "Part 1: The Escape",
    date: "Jul 2026",
    description: "Before JavaScript could become a backend language, it first had to escape the only place it had ever known.",
    tags: ["Node.js", "Backend", "JavaScript", "History"],
    image: "/assets/images/Accidental-Backend.jpg",
    readTime: "10 min read",
    chapters: [
      {
        title: "Before the Escape",
        content: `As a Node.js developer,

we use Node.js every day.

We type \`node app.js\`.

Build APIs.

Deploy applications.

But only a few of us think about this.

**Why does Node.js even exist?**

JavaScript wasn't created for servers.

It wasn't supposed to power backend applications.

So...

how did it become one of the most popular backend runtimes?

To know that,

we have to go back to where everything began.

[interactive-1994]`
      },
      {
        title: "Chapter 1 : A Language Built in 10 Days",
        content: `Let's move to 1994, where web pages were just static pages.

No movement, no interactions, no animations—nothing like what we have today.

The webpages looked like a sheet of paper on the web.

[web-comparison]

When some interaction was done,

a button was clicked,

every single time, the entire page had to be replaced by another.

The server had to send a new page to the browser.

It was basically connected pages,

from one page to another.

That's when two major companies tried to conquer the browser market—Netscape Navigator and Microsoft Internet Explorer.

Netscape Navigator was used by many people in the mid-1990s.

The Problem: Netscape thought that web pages looked boring and needed to be made more interactive.

They needed a scripting language for their browser.

Meet **Brendan Eich.**

[brendan-eich-card]

In 1995, Netscape hired Brendan Eich, who had extensive experience in compilers.

They gave him the task of creating a scripting language for their browser.

The deadline given to Brendan was too short.

He had to build the language in a very limited amount of time.

That's where the myth comes from:

A language built in 10 days.

Actually, Brendan didn't build JavaScript entirely in 10 days.

He built the first working version in 10 days using his knowledge of compilers and programming language theory.

JavaScript now helped make web pages feel alive.

JavaScript actually solved Netscape's problem.

It could respond to a button click.

It could validate forms.

But...

there was a catch.

JavaScript could only perform all of this inside a browser.

It couldn't read a file.

It couldn't create a web server.

It solved a major problem, but at the same time, it had a major limitation too.

JavaScript was

Trapped Inside the Browser.`
      },
      {
        title: "Chapter 2 : Trapped Inside The Browser",
        content: `Now, JavaScript had become the language of the web.

It could handle clicks.

Submit forms.

But...

it couldn't read files.

It couldn't create a server.

Why?

Didn't JavaScript have the ability to do that?

Actually, JavaScript is just a language.

It can't access HTML, CSS, buttons, or any of them on its own.

All of those are provided to JavaScript by the browser.

For example,

When we write:

\`\`\`
document.getElementById()
\`\`\`

It's not a JavaScript object.

It's provided by the browser.

If the browser can provide these, why can't it provide APIs so that JavaScript can access files?

This is where **security** becomes a question.

If the browser gave access to the files in the system, then any random website could access your files, passwords, and private data.

So, the browser created a room in which JavaScript could do only limited things.

[sandbox-diagram]

Back then, developers used:

- Java
- PHP
- Python
- Ruby

for backend development.

Not JavaScript

The reason?

There wasn't an environment that could help JavaScript run outside the browser.

Could someone take JavaScript outside the browser?

It may sound easy to say, but it wasn't.

The browser didn't just execute JavaScript.

It also had...

**a JavaScript engine.**

JavaScript had lived inside the browser for years, not because it was weak, but because it was the only place it could live.

Outside the browser, JavaScript had nowhere to go.

Until a browser vendor built something.

[evolution-timeline]

It wasn't a language.

It wasn't a new browser.

It was an engine.

**The Engine That Changed Everything.**`
      },
      {
        title: "Chapter 3 : The Engine That Changed Everything",
        content: `Now, JavaScript needed a new place outside the browser.

But there was another problem.

JavaScript wasn't that fast, even inside the browser.

If it was going to power something bigger than just the browser, it first needed a better engine.

What's an engine?

Why do we need it?

An engine is basically a translator that converts JavaScript code into machine code.

[engine-flow]

Different browsers had different engines to execute JavaScript, but the problem was performance.

The problem:

JavaScript read a line, then translated it, then read another line, then translated it again...

Enter **Google.**

In 2008, Google needed a browser that was faster, more stable, and offered better performance.

To achieve this, they introduced **Google Chrome** with a JavaScript engine

**V8 Engine**

V8 was different from how engines had worked so far.

It introduced **Just-In-Time (JIT) Compilation**.

It combined both interpretation and compilation.

Interpret the code so that the page could start running faster, then compile the frequently executed code for better performance.

[interpreter-vs-jit]

This actually changed how people saw JavaScript.

Until now, it was just a lightweight scripting language.

But V8 changed everything by making it significantly faster.

Though Google built V8 to make Chrome better, a new and more powerful engine had emerged.

Imagine you're an engineer in 2008.

Now you have an engine that can run JavaScript outside the browser.

What will you do?

Do we still need to keep it inside the browser?

Someone thought the same way.

**Ryan Dahl**

He didn't see V8 as just an engine.

He saw the foundation of a server.

The one question that changed the entire story:

**What if JavaScript didn't need a browser anymore?**

**The Birth of Node.js**`
      },
      {
        title: "Chapter 4 : The Birth Of Node.js",
        content: `Google had built one of the fastest JavaScript engine ever created.

Developers now saw a better browser.

Except for one person.

That person was trying to solve a different problem.

Meet **Ryan Dahl**.

[ryan-dahl-card]

A software engineer who spent a lot of time building network applications.

While working on web servers, he noticed something.

Servers spent too much time...

**Waiting.**

Servers waited for files.

Waited for databases.

Waited for network requests.

The waiting took too much time.

Ryan Dahl questioned,

Why can't the waiting time be invested in doing useful work?

#### The Problem: C10K

The C10K problem.

What does this mean?

The C10K problem asked:

How can a server efficiently handle **10,000 simultaneous client connections?**

[c10k-problem-card]

At that time, many server models created a single thread or process for each connection, which was quite expensive.

Ryan wanted something better.

Now Ryan had found a problem, and he also had the V8 engine with better performance.

He asked himself,

What if I used this engine, not inside Chrome, but inside a server?

And...

the first release of **Node.js** happened in **2009**.

For the first time, JavaScript could:

- Read files.
- Create servers.
- Communicate with databases.
- Build backend applications.

Ryan didn't want Node.js to make JavaScript the next great backend language.

He just wanted a server that spent less time waiting.

In many ways, backend JavaScript wasn't the original destination.

It was an unexpected result...

of solving a different problem.

And that's how a language built to make web pages interactive...

accidentally became one of the world's most influential backend technologies.

### Node.js: The Accidental Backend`
      },
      {
        title: "The Story Continues...",
        content: `JavaScript had finally escaped the browser.

A browser engine had unexpectedly become the heart of a backend runtime.

Now,

we know why Node.js exists.

But...

how does Node.js actually work?

If JavaScript is running on a single thread,

who reads the files?

Who waits for databases?

Who handles thousands of incoming requests?

For that,

we need to know what's

###Behind the Curtain.`
      }
    ]
  },
  {
    id: "node-js-the-accidental-backend-part-2",
    title: "Part 2: Behind The Curtain",
    date: "Jul 2026",
    description: "Now we know why Node.js exists. It's time to see what actually happens behind the curtain.",
    tags: ["Node.js", "Backend", "JavaScript", "Architecture", "Event Loop"],
    image: "/assets/images/Accidental-Backend.jpg",
    readTime: "10 min read",
    chapters: [
      {
        title: "Before We Look Behind",
        content: `We now know that JavaScript escaped the browser.

We know how Node.js came into existence.

But....

we still haven't answered the big question.

**What actually happens when we type \`node app.js\`?**

[curtain-diagram]

We start a server.

A request arrives.

The database responds.

The API returns data.

Everything seems good.

But...

underneath all of this,

something big is happening.

If JavaScript runs on a single thread,

who's doing all the waiting?

Who's reading the file?

Before we look behind,

there's one thing we need to understand.

Node.js is far more than just JavaScript and the V8 engine.

And that's where the story continues....`
      },
      {
        title: "Chapter 1 : More Than Just a Runtime",
        content: `We now know why JavaScript was created.

But...

did Ryan Dahl simply take V8 from the browser and name it Node.js?

Not really.

If V8 was enough,

how can JavaScript read files?

How can it create servers?

How can it talk to databases?

V8 is just an engine.

Its only job is to execute JavaScript code.

That's what Google made it for.

It can't read files.

Or create servers.

Or communicate with databases.

Then how can JavaScript do all this?

JavaScript came out of the browser,

but...

it still needed a way to do all these things.

It needed an environment.

That's what Node.js is.

It's not just V8.

Not just JavaScript.

It's an entire environment built around V8.

It's actually a bridge between JavaScript and the world.

To make this happen,

Node.js brings several different components together as a runtime.

[node-architecture-diagram]

Now we know that Node.js is not just a runtime.

It's an entire environment.

But before we learn how that environment works,

we need to clarify one thing.

It's a sentence every single Node.js developer would have heard:

**"Node.js is single-threaded."**

Is it really?

**The Single-Threaded Myth**`
      },
      {
        title: "Chapter 2 : The Single-Threaded Myth",
        content: `Node.js is single-threaded......

Most of us hear this, accept it, and move on.

Some among us actually want to know:

**Why?**

What does that mean?

Let's ask ourselves a question.

If Node.js is single-threaded,

what happens when a file is opened?

Will Node.js wait?

If so,

the entire system has to wait....

So something's wrong.

What's that?

Actually,

the term we heard wasn't wrong.

But...

it's incomplete.

**JavaScript in Node.js runs on a single main thread.**

This single phrase changes everything.

What does this phrase actually mean?

What is a main thread?

The main thread's job is to:

Execute JavaScript.

Finish one piece of JavaScript.

Move to the next piece.

It doesn't sit there and read files.

Alright.

If this too doesn't do these things,

then...

who's reading the file?

Who's waiting for databases?

Who's handling the network?

Before knowing that,

we need to understand another thing.

And this is where we meet...

**The Event Loop**`
      },
      {
        title: "Chapter 3 : The Event Loop",
        content: `If JavaScript isn't waiting,

then how does it know when something is finished?

Who's telling JavaScript that the work is done?

This is where the Event Loop fits in.

The Event Loop is like a messenger to JavaScript.

It doesn't do the work,

like executing JavaScript or waiting for files.

Its job is to notice when work is ready to be handled

and let JavaScript continue with it.

It's like a coordinator that keeps the process moving.

When the work is finished,

it tells JavaScript that it's ready to be handled.

\`\`\`
JavaScript starts work
          ↓
Work is handled elsewhere
          ↓
JavaScript continues
          ↓
Work finishes
          ↓
Event Loop notices
          ↓
JavaScript handles the result
\`\`\`

Why "Loop"?

Because it never stops checking.

It checks.

Again.

And again.

And again.

If something is ready,

it lets JavaScript execute it.

Looks cool.

But we still haven't got the answer.

If the Event Loop also didn't read files,

then who actually does that work?

This is where we meet...

**The Hidden Workers.**`
      },
      {
        title: "Chapter 4 : The Hidden Workers",
        content: `Imagine a request comes to JavaScript.

What happens now?

The JavaScript main thread doesn't have to do everything itself.

It can hand certain work to other parts of the system.

The main thread shouldn't stop doing everything because one task takes time.

Then who does all this?

**Enter the Operating System.**

For many network operations, Node.js can rely on the OS's own asynchronous I/O capabilities.

\`\`\`
JavaScript
    │
    ▼
 Node.js
    │
    ▼
Operating System
    │
    │ waits for network
    ▼
Data arrives
\`\`\`

The JavaScript main thread can leave the work to the OS.

Once the work is completed,

the Event Loop can indicate that it's ready,

and JavaScript can continue with it.

But some operations aren't naturally handled through the OS's asynchronous mechanisms.

Then who handles those operations?

Here comes...

**libuv's Thread Pool.**

libuv has a pool of worker threads

where certain operations can be handled.

By default,

the libuv thread pool has 4 worker threads.

Its size can also be modified.

It helps handle certain operations like:

- Filesystem operations
- Some DNS operations
- Some cryptographic operations
- Other operations that need background workers

But the thing is...

**not every asynchronous operation goes through the thread pool.**

\`\`\`
                Node.js
                   │
             ┌─────┴─────┐
             │           │
          Network      Some I/O
             │           │
             ▼           ▼
          OS I/O     libuv Thread Pool
\`\`\`

So....

JavaScript execution happens on one main thread.

But the runtime itself works with the operating system

and, when needed,

uses a pool of worker threads.

Moving back to what Ryan needed...

He noticed that servers spent too much time waiting.

He wanted an architecture in which

the main thread didn't have to sit around doing nothing while work was waiting.

And that's where this architecture fits well.

Instead of...

waiting....

waiting....

waiting....

the main JavaScript thread can keep moving

while other parts of the system handle the work.

The main thread,

the Event Loop,

libuv,

the Operating System...

everything is structured in a way that keeps the JavaScript thread from being blocked by every operation.

And by knowing this...

**The Curtain Falls.**`
      },
      {
        title: "The Curtain Falls",
        content: `We started with a simple question.

**Why does Node.js even exist?**

JavaScript was created to make web pages interactive.

It lived inside a browser.

But then...

it escaped the browser.

V8 sped it up.

Ryan gave it an environment.

Node.js helped JavaScript interact with the world.

But that's only the beginning.

Behind that simple \`node app.js\`,

there's something big happening.

JavaScript runs on a single main thread.

The Event Loop keeps it moving.

libuv helps coordinate the work.

The OS handles what it can.

What looked like one thread doing everything

was never really alone.

And that's what makes Node.js interesting.

A language built in 10 days...

trapped inside a browser...

escaped through an engine...

found a new home...

JavaScript didn't set out to become a backend.

It simply found itself there.

**The Accidental Backend.**`
      }
    ]
  }
];

