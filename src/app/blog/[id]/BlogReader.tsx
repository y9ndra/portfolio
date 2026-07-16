"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Chapter {
  title: string;
  subtitle?: string;
  content: string;
}

interface Blog {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image: string;
  readTime: string;
  chapters?: Chapter[];
}

interface BlogReaderProps {
  blog: Blog;
  prevBlog: { id: string; title: string } | null;
  nextBlog: { id: string; title: string } | null;
}

// Simple Markdown Parser for Blog Content
const parseInlineMarkdown = (text: string) => {
  const parts = [];
  let currentIdx = 0;
  
  // Match **bold** or `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchStr = match[0];
    const matchIdx = match.index;
    
    if (matchIdx > currentIdx) {
      parts.push(text.substring(currentIdx, matchIdx));
    }
    
    if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
      parts.push(<strong key={matchIdx}>{matchStr.slice(2, -2)}</strong>);
    } else if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
      parts.push(<code key={matchIdx} className="blog-inline-code">{matchStr.slice(1, -1)}</code>);
    }
    
    currentIdx = regex.lastIndex;
  }
  
  if (currentIdx < text.length) {
    parts.push(text.substring(currentIdx));
  }
  
  return parts.length > 0 ? parts : text;
};

const renderChapterContent = (text: string) => {
  if (!text) return null;
  const blocks = text.split("\n\n");
  
  return blocks.map((block, bIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    
    // Code block
    if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
      const code = trimmed.replace(/```/g, "").trim();
      return (
        <pre key={bIdx} className="blog-code-block">
          <code>{code}</code>
        </pre>
      );
    }
    
    // Headings inside content (e.g. ##, ###, ####)
    if (trimmed.startsWith("#")) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const cleanText = trimmed.replace(/^#+\s*/, "");
      if (level === 2) return <h3 key={bIdx} className="blog-content-h2">{cleanText}</h3>;
      if (level === 3) return <h4 key={bIdx} className="blog-content-h3">{cleanText}</h4>;
      return <h5 key={bIdx} className="blog-content-h4">{cleanText}</h5>;
    }
    
    // Bullet list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const lines = trimmed.split(/\n/);
      return (
        <ul key={bIdx} className="blog-content-list">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^[-*]\s+/, "").trim();
            return <li key={lIdx}>{parseInlineMarkdown(cleanLine)}</li>;
          })}
        </ul>
      );
    }
    
    // Check if it's the 1994 interactive widget
    if (trimmed === "[interactive-1994]") {
      return <TimeTravel1994 key={bIdx} />;
    }

    // Check if it's the web comparison widget
    if (trimmed === "[web-comparison]") {
      return <WebComparison key={bIdx} />;
    }

    // Check if it's the Brendan Eich card
    if (trimmed === "[brendan-eich-card]") {
      return <BrendanEichCard key={bIdx} />;
    }

    // Check if it's the sandbox diagram
    if (trimmed === "[sandbox-diagram]") {
      return <SandboxDiagram key={bIdx} />;
    }

    // Check if it's the evolution timeline
    if (trimmed === "[evolution-timeline]") {
      return <EvolutionTimeline key={bIdx} />;
    }

    // Check if it's the engine flow
    if (trimmed === "[engine-flow]") {
      return <EngineFlow key={bIdx} />;
    }

    // Check if it's the Interpreter vs JIT split comparison
    if (trimmed === "[interpreter-vs-jit]") {
      return <InterpreterVsJit key={bIdx} />;
    }

    // Check if it's the Ryan Dahl info card
    if (trimmed === "[ryan-dahl-card]") {
      return <RyanDahlCard key={bIdx} />;
    }

    // Check if it's the C10K problem card
    if (trimmed === "[c10k-problem-card]") {
      return <C10KProblemCard key={bIdx} />;
    }
    
    // Regular paragraph
    return (
      <p key={bIdx} className="blog-content-p">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
};

// 1994 Time Travel Storytelling Component
function TimeTravel1994() {
  const [year, setYear] = useState(2026);
  const [isTraveling, setIsTraveling] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (!isTraveling) return;

    let currentYear = 2026;
    const interval = setInterval(() => {
      currentYear -= 1;
      setYear(currentYear);
      if (currentYear === 1994) {
        clearInterval(interval);
        setHasArrived(true);
        setIsTraveling(false);
      }
    }, 45); // 1.5s total shift time

    return () => clearInterval(interval);
  }, [isTraveling]);

  const handleTravel = () => {
    setIsTraveling(true);
    setHasArrived(false);
    setYear(2026);
  };

  return (
    <div className="retro-portal-container corner-box">
      <div className="retro-crt-screen">
        <div className="retro-scanlines" />
        <div className="retro-screen-flicker" />
        
        {!isTraveling && !hasArrived && (
          <div className="retro-screen-welcome">
            <span className="retro-blink-text">&gt; SYSTEM STANDBY</span>
            <p className="retro-instruction">Ready to visit the birth era of the web?</p>
            <button className="retro-btn" onClick={handleTravel} type="button">
              INITIATE TIME TRAVEL
            </button>
          </div>
        )}

        {isTraveling && (
          <div className="retro-screen-traveling">
            <div className="retro-glitch-text">TEMPORAL SHIFT ACTIVE</div>
            <div className="retro-year-display">{year}</div>
            <div className="retro-progress-bar-wrap">
              <div 
                className="retro-progress-bar-fill" 
                style={{ width: `${((2026 - year) / (2026 - 1994)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {hasArrived && (
          <div className="retro-screen-arrived">
            <div className="retro-win-header">
              <span>Netscape Navigator 1.0 — 1994.exe</span>
              <button className="retro-win-close" onClick={handleTravel} type="button">Reload</button>
            </div>
            <div className="retro-win-body">
              <div className="retro-browser-bar">
                <span>URL: http://www.web.1994/</span>
              </div>
              <div className="retro-browser-content">
                <h3>Welcome to the Web in 1994!</h3>
                <ul className="retro-stats">
                  <li><strong>Total Websites:</strong> ~3,000</li>
                  <li><strong>Active Users:</strong> 0.4% of Earth</li>
                  <li><strong>Speed:</strong> 14.4 Kbps (Dial-Up)</li>
                  <li><strong>Experience:</strong> Grey backgrounds, blue links, static text. No buttons do anything without reloading.</li>
                </ul>
                <div className="retro-alert">
                  Warning: No JavaScript exists. Everything is static.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Web Comparison Storytelling Component (1994 Netscape vs Modern Reactive App)
function WebComparison() {
  // Netscape State
  const [netscapePage, setNetscapePage] = useState("home");
  const [netscapeLoading, setNetscapeLoading] = useState(false);

  // Modern State
  const [activeUsers, setActiveUsers] = useState(148);
  const [latency, setLatency] = useState(14);
  const [trafficRate, setTrafficRate] = useState(50);
  const [modernLogs, setModernLogs] = useState<string[]>([
    "WebSocket channel established on port 443",
    "Aggregated analytics pipeline successfully synced"
  ]);

  const handleNetscapeLink = (page: string) => {
    setNetscapeLoading(true);
    setTimeout(() => {
      setNetscapePage(page);
      setNetscapeLoading(false);
    }, 800); // Simulated roundtrip slow server load
  };

  const triggerModernAction = () => {
    setActiveUsers((u) => u + 1);
    const calculatedLatency = Math.max(2, Math.floor(trafficRate * 0.2 + Math.random() * 8));
    setLatency(calculatedLatency);
    const newLog = `Simulated request resolved dynamically in ${calculatedLatency}ms`;
    setModernLogs((logs) => [newLog, ...logs.slice(0, 1)]);
  };

  const handleTrafficChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseInt(e.target.value, 10);
    setTrafficRate(rate);
    const calcLatency = Math.max(2, Math.floor(rate * 0.2 + Math.random() * 5));
    setLatency(calcLatency);
  };

  return (
    <div className="web-compare-container">
      <div className="web-compare-grid">
        
        {/* Left Side: Netscape Navigator (1994) */}
        <div className="web-compare-card retro-side">
          <div className="web-compare-header">
            <span className="compare-dot-marker" />
            <span className="compare-title-tag">Netscape Navigator 1.0 (1994)</span>
          </div>
          
          {/* Netscape Retro Chrome Menu Panel */}
          <div className="netscape-chrome">
            <div className="netscape-buttons">
              <button 
                type="button" 
                onClick={() => handleNetscapeLink("home")} 
                disabled={netscapePage === "home" || netscapeLoading}
              >
                Back
              </button>
              <button type="button" disabled>Forward</button>
              <button 
                type="button" 
                onClick={() => handleNetscapeLink("home")} 
                disabled={netscapeLoading}
              >
                Home
              </button>
              <button 
                type="button" 
                onClick={() => handleNetscapeLink(netscapePage)} 
                disabled={netscapeLoading}
              >
                Reload
              </button>
              <button type="button" disabled>Print</button>
              <button type="button" disabled>Stop</button>
            </div>
            <div className="netscape-url-row">
              <span className="netscape-url-label">Location:</span>
              <div className="netscape-url-bar">
                http://info.cern.ch/{netscapePage !== "home" ? `${netscapePage}.html` : ""}
              </div>
            </div>
          </div>

          <div className="compare-body retro-body-frame">
            {netscapeLoading ? (
              <div className="netscape-loader">
                <div className="netscape-spinner" />
                <span>Contacting HTTP Server...</span>
                <span>Transferring document (1.2KB)...</span>
              </div>
            ) : (
              <>
                {netscapePage === "home" && (
                  <>
                    <h1 className="mosaic-main-title">The World Wide Web</h1>
                    <p className="mosaic-p">
                      The WorldWideWeb (W3) is a wide-area hypermedia information retrieval initiative aiming to give universal access to a large universe of documents.
                    </p>
                    
                    <h3 className="mosaic-section-title">Directory of Links:</h3>
                    <ul className="mosaic-list">
                      <li>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handleNetscapeLink("help"); }} 
                          className="mosaic-link"
                        >
                          Help
                        </a>{" "}
                        - on browser software and server setup.
                      </li>
                      <li>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handleNetscapeLink("bib"); }} 
                          className="mosaic-link"
                        >
                          Bibliography
                        </a>{" "}
                        - papers, articles and resources.
                      </li>
                    </ul>
                  </>
                )}

                {netscapePage === "help" && (
                  <>
                    <h1 className="mosaic-main-title">W3 Help & Setup</h1>
                    <p className="mosaic-p">
                      To host pages, you must compile the CERN daemon source code and configure port 80 in raw Unix.
                    </p>
                    <p className="mosaic-p">
                      Every link click in 1994 halts client execution and requests a full page roundtrip from the server.
                    </p>
                    <p className="mosaic-p" style={{ marginTop: "1rem" }}>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); handleNetscapeLink("home"); }} 
                        className="mosaic-link"
                      >
                        &lt; Return to Home Directory
                      </a>
                    </p>
                  </>
                )}

                {netscapePage === "bib" && (
                  <>
                    <h1 className="mosaic-main-title">W3 Bibliography</h1>
                    <p className="mosaic-p">
                      - Berners-Lee, T., "Information Management: A Proposal", CERN, March 1989.
                    </p>
                    <p className="mosaic-p">
                      - Cailliau, R., "Proposal for W3 Funding", CERN, 1990.
                    </p>
                    <p className="mosaic-p" style={{ marginTop: "1rem" }}>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); handleNetscapeLink("home"); }} 
                        className="mosaic-link"
                      >
                        &lt; Return to Home Directory
                      </a>
                    </p>
                  </>
                )}

                <div className="mosaic-warning">
                  INFO: Static page content. Click events fetch raw pages from a server.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Current Gen Reactive Dashboard (2026) */}
        <div className="web-compare-card modern-side">
          <div className="web-compare-header">
            <div className="compare-modern-dots">
              <span className="compare-dot dot-red" />
              <span className="compare-dot dot-yellow" />
              <span className="compare-dot dot-green" />
            </div>
            <span className="compare-title-tag">Modern Web App (2026)</span>
          </div>
          
          <div className="compare-body modern-body-frame">
            <div className="modern-dashboard-header">
              <span className="modern-logo-text">NexTech Real-Time</span>
            </div>
            
            {/* React Live Metrics Row */}
            <div className="modern-metric-grid">
              <div className="modern-metric-box">
                <span className="metric-label">Simulated Clients</span>
                <span className="metric-val">{activeUsers}</span>
              </div>
              <div className="modern-metric-box">
                <span className="metric-label">Latency</span>
                <span className="metric-val" style={{ color: latency > 30 ? "#ffbd2e" : "#27c93f" }}>
                  {latency}ms
                </span>
              </div>
            </div>

            {/* Simulated Live User Slider */}
            <div className="modern-slider-box">
              <div className="slider-header">
                <span className="slider-label">Simulate Load Traffic:</span>
                <span className="slider-val">{trafficRate} req/s</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="200" 
                value={trafficRate} 
                onChange={handleTrafficChange}
                className="modern-range-input"
              />
            </div>

            {/* Dynamic Activity Log */}
            <div className="modern-log-box">
              <span className="log-title">Live event logs (Reactive DOM):</span>
              <div className="log-entries">
                {modernLogs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="log-time">[instant]</span> {log}
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="modern-interactive-btn" 
              onClick={triggerModernAction}
              type="button"
            >
              Asynchronously Send Request
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Interpreter vs JIT Comparison Component
function InterpreterVsJit() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  
  // Interpreter state
  const [interpIter, setInterpIter] = useState(1);
  const [interpActive, setInterpActive] = useState<string | null>(null);
  
  // V8 JIT state
  const [jitIter, setJitIter] = useState(1);
  const [jitActive, setJitActive] = useState<string | null>(null);
  const [jitDone, setJitDone] = useState(false);
  const [interpDone, setInterpDone] = useState(false);

  const resetSimulation = () => {
    setStep(0);
    setInterpIter(1);
    setInterpActive(null);
    setJitIter(1);
    setJitActive(null);
    setJitDone(false);
    setInterpDone(false);
  };

  const startSimulation = () => {
    resetSimulation();
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    let currentStep = 0;
    const maxSteps = 40; // Interpreter runs 10 iterations * 4 steps = 40 steps

    const interval = setInterval(() => {
      // 1. Interpreter logic
      const interpreterIteration = Math.floor(currentStep / 4) + 1;
      const interpreterStepIndex = currentStep % 4;
      const interpreterSteps = ["read", "translate", "execute", "repeat"];
      
      if (interpreterIteration <= 10) {
        setInterpIter(interpreterIteration);
        setInterpActive(interpreterSteps[interpreterStepIndex]);
      } else {
        setInterpActive(null);
        setInterpDone(true);
      }

      // 2. V8 JIT logic
      // Step timeline for V8:
      // t=0: Interpret (Iter 1)
      // t=1: Observe (Iter 1)
      // t=2: Compile Hot Code (Iter 1)
      // t=3: Reuse (Iter 2)
      // t=4: Reuse (Iter 3)
      // ...
      // t=11: Reuse (Iter 10) -> Done
      if (currentStep === 0) {
        setJitIter(1);
        setJitActive("interpret");
      } else if (currentStep === 1) {
        setJitActive("observe");
      } else if (currentStep === 2) {
        setJitActive("compile");
      } else if (currentStep >= 3 && currentStep <= 11) {
        setJitIter(currentStep - 1);
        setJitActive("reuse");
      } else {
        setJitActive(null);
        setJitDone(true);
      }

      setStep(currentStep);
      currentStep++;

      if (currentStep >= maxSteps) {
        clearInterval(interval);
        setIsRunning(false);
        setInterpDone(true);
      }
    }, 180); // Speed: 180ms per step

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="jit-comp-card">
      <div className="jit-comp-header">
        <span className="jit-comp-badge">Sim</span>
        <span className="jit-comp-title">Execution Pipeline: Interpreter vs JIT</span>
        <button 
          className="jit-sim-btn" 
          onClick={isRunning ? resetSimulation : startSimulation}
          type="button"
        >
          {isRunning ? "Reset" : "Run 10-Loop Simulation"}
        </button>
      </div>

      <div className="jit-comp-split">
        {/* Old Engine */}
        <div className="jit-comp-col">
          <div className="jit-comp-col-header">
            <span>Classic Interpreter</span>
            <span className="jit-status-badge">
              {interpDone ? "Finished (40 steps)" : isRunning ? `Loop ${interpIter}/10` : "Idle"}
            </span>
          </div>
          
          <div className="jit-comp-steps">
            <div className={`jit-step-item ${interpActive === "read" ? "active" : ""}`}>
              <div className="jit-step-indicator">&darr;</div>
              <div className="jit-step-label">Read</div>
              <div className="jit-step-desc">Fetch the next line of JavaScript code</div>
            </div>
            
            <div className={`jit-step-item ${interpActive === "translate" ? "active" : ""}`}>
              <div className="jit-step-indicator">&darr;</div>
              <div className="jit-step-label">Translate</div>
              <div className="jit-step-desc">Convert the line to bytecode on the fly</div>
            </div>
            
            <div className={`jit-step-item ${interpActive === "execute" ? "active" : ""}`}>
              <div className="jit-step-indicator">&darr;</div>
              <div className="jit-step-label">Execute</div>
              <div className="jit-step-desc">CPU executes the translated instructions</div>
            </div>
            
            <div className={`jit-step-item ${interpActive === "repeat" ? "active" : ""}`}>
              <div className="jit-step-indicator">&#8634;</div>
              <div className="jit-step-label">Repeat</div>
              <div className="jit-step-desc">Go back and repeat for the next line</div>
            </div>
          </div>
        </div>

        <div className="jit-comp-divider" />

        {/* V8 JIT Compiler */}
        <div className="jit-comp-col">
          <div className="jit-comp-col-header">
            <span>V8 Engine (JIT)</span>
            <span className="jit-status-badge">
              {jitDone ? "Finished (12 steps) ✓" : isRunning ? `Loop ${jitIter}/10` : "Idle"}
            </span>
          </div>

          <div className="jit-comp-steps">
            <div className={`jit-step-item ${jitActive === "interpret" ? "active" : ""}`}>
              <div className="jit-step-indicator">&darr;</div>
              <div className="jit-step-label">Interpret</div>
              <div className="jit-step-desc">Start executing code immediately</div>
            </div>

            <div className={`jit-step-item ${jitActive === "observe" ? "active" : ""}`}>
              <div className="jit-step-indicator">&darr;</div>
              <div className="jit-step-label">Observe</div>
              <div className="jit-step-desc">Monitor code for frequently run loops ("hot code")</div>
            </div>

            <div className={`jit-step-item ${jitActive === "compile" ? "active" : ""}`}>
              <div className="jit-step-indicator">&darr;</div>
              <div className="jit-step-label">Compile Hot Code</div>
              <div className="jit-step-desc">Compile the hot loop directly into native machine code</div>
            </div>

            <div className={`jit-step-item ${jitActive === "reuse" ? "active" : ""}`}>
              <div className="jit-step-indicator">&#8635;</div>
              <div className="jit-step-label">Reuse</div>
              <div className="jit-step-desc">Execute native machine code directly (bypass Interpreter)</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparative readout */}
      {isRunning || jitDone || interpDone ? (
        <div className="jit-comp-readout">
          <div className="readout-title">Simulation Status</div>
          <div className="readout-grid">
            <div className="readout-item">
              <span className="readout-label">Interpreter Steps:</span>
              <span className="readout-value font-mono">{interpDone ? "40" : `${(interpIter - 1) * 4 + (interpActive ? ["read", "translate", "execute", "repeat"].indexOf(interpActive) + 1 : 0)}`}</span>
            </div>
            <div className="readout-item">
              <span className="readout-label">V8 Steps:</span>
              <span className="readout-value font-mono">{jitDone ? "12" : `${step >= 12 ? "12" : step + 1}`}</span>
            </div>
            <div className="readout-item full-width">
              <span className="readout-label">Performance Gain:</span>
              <span className="readout-value highlight font-mono">
                {jitDone && interpDone ? "V8 JIT was ~3.3x faster (Saved 28 overhead steps)" : "Calculating..."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="jit-comp-footer">
          Click the run button to simulate how JIT optimizes loop performance.
        </div>
      )}
    </div>
  );
}

// Engine Flow Component
function EngineFlow() {
  const stages = [
    {
      id: "js",
      tag: "INPUT",
      label: "JavaScript",
      detail: "Your source code",
      mono: true,
    },
    {
      id: "parser",
      tag: "STEP 1",
      label: "Parser",
      detail: "Checks syntax, structures the code",
      mono: false,
    },
    {
      id: "interpreter",
      tag: "STEP 2",
      label: "Interpreter",
      detail: "Translates and executes line-by-line on the fly",
      mono: false,
    },
    {
      id: "cpu",
      tag: "OUTPUT",
      label: "CPU / Execution",
      detail: "Executes translated code immediately",
      mono: false,
    },
  ];

  return (
    <div className="ef-card">
      <div className="ef-header">
        <span className="ef-header-label">Classic Engine Flow (Pre-V8)</span>
        <span className="ef-header-sub">How browsers executed JS before JIT compilation</span>
      </div>
      <div className="ef-pipeline">
        {stages.map((stage, i) => (
          <div key={stage.id} className="ef-stage-wrap">
            <div className={`ef-stage${stage.mono ? " ef-stage-mono" : ""}`}>
              <span className="ef-tag">{stage.tag}</span>
              <span className="ef-label">{stage.label}</span>
              <span className="ef-detail">{stage.detail}</span>
            </div>
            {i < stages.length - 1 && (
              <div className="ef-arrow">
                <div className="ef-arrow-line" />
                <div className="ef-arrow-head" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Evolution Timeline Component
function EvolutionTimeline() {
  const steps = [
    { label: "HTML",        year: "1991", desc: "Structure of the web. Static pages, no interaction.", mystery: false },
    { label: "CSS",         year: "1996", desc: "Style and layout. Pages started to look designed.",  mystery: false },
    { label: "JavaScript",  year: "1995", desc: "Behaviour in the browser. Pages became interactive.", mystery: false },
    { label: "???",         year: "????", desc: "Something changes. JavaScript gets a lot faster.",    mystery: true  },
    { label: "???",         year: "????", desc: "The escape begins. JavaScript finds a new home.",     mystery: true  },
  ];

  return (
    <div className="etl-card">
      <div className="etl-header">
        <span className="etl-label">Evolution</span>
      </div>
      <div className="etl-body">
        {steps.map((step, i) => (
          <div key={i} className={`etl-row${step.mystery ? " etl-row-mystery" : ""}`}>
            <div className="etl-left">
              <span className="etl-year">{step.year}</span>
            </div>
            <div className="etl-spine">
              <div className={`etl-dot${step.mystery ? " etl-dot-mystery" : ""}`} />
              {i < steps.length - 1 && <div className={`etl-line${step.mystery ? " etl-line-mystery" : ""}`} />}
            </div>
            <div className="etl-right">
              <span className="etl-step-label">{step.label}</span>
              <span className="etl-step-desc">{step.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Browser Sandbox Diagram Component
function SandboxDiagram() {
  const available = ["DOM", "Events", "Timers", "Fetch API"];
  const blocked   = ["File System", "Operating System", "Processes", "Raw TCP"];

  return (
    <div className="sbx-card">
      <div className="sbx-header">
        <span className="sbx-badge">JS</span>
        <span className="sbx-heading">Inside the Browser Sandbox</span>
      </div>
      <div className="sbx-cols">
        <div className="sbx-col sbx-col-yes">
          <p className="sbx-col-title yes">Available</p>
          <ul className="sbx-list">
            {available.map((item) => (
              <li key={item} className="sbx-item sbx-item-yes">
                <span className="sbx-marker yes">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="sbx-divider" />
        <div className="sbx-col sbx-col-no">
          <p className="sbx-col-title no">Not Available</p>
          <ul className="sbx-list">
            {blocked.map((item) => (
              <li key={item} className="sbx-item sbx-item-no">
                <span className="sbx-marker no">&#10007;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Ryan Dahl Info Card Component
function RyanDahlCard() {
  return (
    <div className="profile-card-container small-card">
      <div className="profile-card-content">
        <h4 className="profile-card-title">Ryan Dahl</h4>
        <ul className="profile-bullets simple-list">
          <li>Software Engineer & Creator of Node.js</li>
          <li>Began developing Node.js in 2009</li>
          <li>Sought a better way to handle file uploads and concurrent connections</li>
          <li>Discovered that a single-threaded event loop paired with V8 was the perfect solution</li>
        </ul>
      </div>
    </div>
  );
}

// C10K Problem Info Card Component
function C10KProblemCard() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeReqs, setActiveReqs] = useState<number[]>([]);
  const [threadStatus, setThreadStatus] = useState<string[]>(["Idle", "Idle", "Idle"]);
  const [blockedCount, setBlockedCount] = useState(0);
  
  const [eventLoopStatus, setEventLoopStatus] = useState("Idle");
  const [delegatedCount, setDelegatedCount] = useState(0);

  const resetSim = () => {
    setIsRunning(false);
    setActiveReqs([]);
    setThreadStatus(["Idle", "Idle", "Idle"]);
    setBlockedCount(0);
    setEventLoopStatus("Idle");
    setDelegatedCount(0);
  };

  const startSim = () => {
    resetSim();
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    let reqIndex = 0;
    const totalRequests = 10;
    const interval = setInterval(() => {
      if (reqIndex < totalRequests) {
        const reqNum = reqIndex + 1;
        setActiveReqs(prev => [...prev, reqNum]);

        // 1. Thread-per-request logic (3 threads capacity)
        setThreadStatus(prev => {
          const next = [...prev];
          let assigned = false;
          for (let i = 0; i < next.length; i++) {
            if (next[i] === "Idle" && !assigned) {
              next[i] = `Req #${reqNum} (Busy / Waiting for I/O)`;
              assigned = true;
            }
          }
          return next;
        });

        if (reqNum > 3) {
          setBlockedCount(reqNum - 3);
        }

        // 2. Event loop logic
        setEventLoopStatus(`Processing Req #${reqNum}`);
        setDelegatedCount(d => d + 1);
        
        // Event loop immediately clears itself after passing request to OS background
        setTimeout(() => {
          setEventLoopStatus("Free (ready for next)");
        }, 120);

        reqIndex++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="c10k-card">
      <div className="c10k-header">
        <span className="c10k-badge">Sim</span>
        <span className="c10k-title">The C10K Challenge: Handling 10 Simultaneous Requests</span>
        <button 
          className="c10k-sim-btn" 
          onClick={isRunning ? resetSim : startSim}
          type="button"
        >
          {isRunning ? "Reset" : "Simulate Request Traffic"}
        </button>
      </div>

      <div className="c10k-split">
        {/* Thread-per-request */}
        <div className="c10k-col">
          <div className="c10k-col-title">Thread-Per-Connection (Classic Apache/PHP)</div>
          <p className="c10k-col-desc">Allocates a separate system thread for each user connection.</p>
          
          <div className="c10k-visual-box">
            <div className="c10k-thread-pool">
              {threadStatus.map((status, idx) => (
                <div key={idx} className={`c10k-thread ${status.includes("Busy") ? "active" : ""}`}>
                  <span className="thread-label">Thread {idx + 1}:</span>
                  <span className="thread-status font-mono">{status}</span>
                </div>
              ))}
            </div>

            <div className="c10k-metric-row">
              <span className="metric-label">Thread Capacity:</span>
              <span className="metric-value font-mono">3 Max</span>
            </div>
            
            <div className="c10k-metric-row">
              <span className="metric-label">Blocked / Waiting Connections:</span>
              <span className="metric-value font-mono highlight-blocked">{blockedCount}</span>
            </div>
          </div>
        </div>

        <div className="c10k-divider" />

        {/* Event Loop */}
        <div className="c10k-col">
          <div className="c10k-col-title">Single Event Loop (Node.js Model)</div>
          <p className="c10k-col-desc">Uses one thread to receive requests and delegates I/O tasks to the OS.</p>

          <div className="c10k-visual-box">
            <div className={`c10k-event-loop ${eventLoopStatus.includes("Processing") ? "active" : ""}`}>
              <span className="loop-icon">&#8635;</span>
              <div className="loop-info">
                <span className="loop-label">Event Loop State:</span>
                <span className="loop-status font-mono">{eventLoopStatus}</span>
              </div>
            </div>

            <div className="c10k-metric-row">
              <span className="metric-label">Active / Delegated Tasks:</span>
              <span className="metric-value font-mono">{delegatedCount}</span>
            </div>

            <div className="c10k-metric-row">
              <span className="metric-label">Blocked / Waiting Connections:</span>
              <span className="metric-value font-mono highlight-free">0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="c10k-footer">
        {blockedCount > 0 ? (
          <span>Notice: The classic server ran out of threads and blocked {blockedCount} incoming requests. The event loop handled all requests instantly by offloading them.</span>
        ) : (
          <span>Click the button to visualize how thread pool exhaustion blocks users compared to the event loop.</span>
        )}
      </div>
    </div>
  );
}

// Brendan Eich Info Card Component
function BrendanEichCard() {
  return (
    <div className="profile-card-container small-card">
      <div className="profile-card-glow" />
      <div className="profile-card-content">
        <h4 className="profile-card-title">Brendan Eich</h4>
        <ul className="profile-bullets simple-list">
          <li>Compiler Architect & Software Engineer</li>
          <li>Joined Netscape in April 1995</li>
          <li>Tasked with developing a lightweight, accessible web programming language</li>
          <li>Required to build the initial prototype in just 10 days</li>
        </ul>
      </div>
    </div>
  );
}

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

const EyeIcon = () => (
  <svg 
    width="13" 
    height="13" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "-0.15em", marginRight: "4px" }}
    aria-hidden
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function ShareButton({ title, description }: { title: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className="blog-share-btn" onClick={handleShare} aria-label="Share this post">
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

export default function BlogReader({ blog, prevBlog, nextBlog }: BlogReaderProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Record view of this specific blog part
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: blog.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views === "number") {
          setViews(data.views);
        }
      })
      .catch((err) => console.error("Error recording view:", err));
  }, [blog.id]);

  useEffect(() => {
    chapterRefs.current = chapterRefs.current.slice(0, blog.chapters?.length || 0);
  }, [blog]);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      } else {
        setScrollProgress(0);
      }

      // Determine active chapter based on scroll position
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      let currentActive = 0;

      for (let i = 0; i < chapterRefs.current.length; i++) {
        const ref = chapterRefs.current[i];
        if (ref) {
          const top = ref.offsetTop;
          if (scrollPosition >= top) {
            currentActive = i;
          }
        }
      }
      setActiveChapter(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [blog]);

  const scrollToChapter = (index: number) => {
    const ref = chapterRefs.current[index];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="blog-detail-main">
      {/* Scroll Progress Bar */}
      <div 
        className="blog-progress-bar" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Back button */}
      <div className="wrap">
        <div className="proj-detail-back-wrap a0">
          <Link href={`/blog/${blog.id.replace(/-part-\d+$/, "")}`} className="proj-detail-back">
            <ArrowLeft /> Back to Blog Overview
          </Link>
        </div>
      </div>

      {/* Banner image */}
      {blog.image && (
        <div className="wrap a1">
          <div className="proj-detail-banner">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              style={{ objectFit: "contain" }}
              priority
            />
            <div className="proj-detail-banner-overlay" />
          </div>
        </div>
      )}

      {/* Header & Main grid layout */}
      <div className="wrap">
        <div className="blog-detail-grid">
          


          {/* Main content pane */}
          <article className="blog-content-container">
            {/* Blog Header Metadata */}
            <div className="proj-detail-header a2" style={{ marginBottom: "2rem" }}>
              <div className="proj-detail-title-row">
                <h1 className="proj-detail-title">{blog.title}</h1>
              </div>
              <div className="blog-detail-meta" style={{ marginTop: "0.25rem", marginBottom: "0.75rem" }}>
                <div className="blog-detail-meta-left">
                  <span className="blog-meta-item">{blog.date}</span>
                  <span className="blog-meta-item">{blog.readTime}</span>
                  <span className="blog-meta-item">
                    {views !== null ? `${views.toLocaleString()} views` : "— views"}
                  </span>
                </div>
                <ShareButton title={blog.title} description={blog.description} />
              </div>
              <p className="proj-detail-desc">{blog.description}</p>
            </div>

            {/* Render chapters */}
            <div className="blog-content-body">
              {blog.chapters?.map((ch, idx) => (
                <section
                  key={idx}
                  ref={(el) => {
                    chapterRefs.current[idx] = el;
                  }}
                  className="blog-chapter-section"
                  id={`chapter-${idx + 1}`}
                >
                  <div className="blog-chapter-header">
                    {ch.title.toLowerCase().startsWith("chapter") && ch.title.includes(":") ? (
                      <>
                        <span className="blog-chapter-num">{ch.title.split(":")[0].trim()}</span>
                        <h2 className="blog-chapter-title">
                          {ch.title.split(":").slice(1).join(":").trim()}
                        </h2>
                      </>
                    ) : (
                      <h2 className="blog-chapter-title">{ch.title}</h2>
                    )}
                    {ch.subtitle && (
                      <p className="blog-chapter-subtitle">{ch.subtitle}</p>
                    )}
                  </div>
                  <div className="blog-chapter-content">
                    {renderChapterContent(ch.content)}
                  </div>
                </section>
              ))}
            </div>

            {/* Pagination Navigation */}
            <div className="blog-pagination">
              {prevBlog ? (
                <Link href={`/blog/${prevBlog.id}`} className="blog-pagination-btn">
                  <span className="blog-pagination-label">
                    {prevBlog.id === blog.id.replace(/-part-\d+$/, "") ? "← Blog Overview" : "← Previous Part"}
                  </span>
                  <span className="blog-pagination-title">{prevBlog.title}</span>
                </Link>
              ) : (
                <div style={{ flex: 1 }} />
              )}
              {nextBlog ? (
                <Link href={`/blog/${nextBlog.id}`} className="blog-pagination-btn" style={{ textAlign: "right", alignItems: "flex-end" }}>
                  <span className="blog-pagination-label">Next Part →</span>
                  <span className="blog-pagination-title">{nextBlog.title}</span>
                </Link>
              ) : (
                <div style={{ flex: 1 }} />
              )}
            </div>

          </article>
        </div>
      </div>
    </main>
  );
}
