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
const parseInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // Match `code` or **bold**
  const regex = /(`.*?`|\*\*.*?\*\*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="blog-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2);
      parts.push(
        <strong key={match.index}>
          {parseInlineMarkdown(inner)}
        </strong>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
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
      if (code.includes("JavaScript starts work") && code.includes("Event Loop")) {
        return <EventLoopSequenceFlowDiagram key={bIdx} />;
      }
      if (code.includes("Network") && code.includes("libuv Thread Pool")) {
        return <LibuvThreadPoolComparisonDiagram key={bIdx} />;
      }
      if (code.includes("waits for network") && code.includes("Operating System")) {
        return null;
      }
      return (
        <pre key={bIdx} className="blog-code-block">
          <code>{code}</code>
        </pre>
      );
    }
    
    // Intercept "###Behind the Curtain." to render animated arrow pointing to next part
    if (trimmed === "###Behind the Curtain.") {
      return <BehindCurtainArrow key={bIdx} />;
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
    
    // Intercept "Node.js is single-threaded." to display the cliffhanger visual statement
    if (trimmed === '**"Node.js is single-threaded."**' || trimmed === '"Node.js is single-threaded."') {
      return <SingleThreadedStatement key={bIdx} />;
    }

    // Intercept "the entire system has to wait...." to display the blocking sequence flow visual
    if (trimmed === "the entire system has to wait....") {
      return (
        <React.Fragment key={bIdx}>
          <p className="blog-content-p">{parseInlineMarkdown(trimmed)}</p>
          <BlockingThreadVisualization />
        </React.Fragment>
      );
    }

    // Intercept "JavaScript in Node.js runs on a single main thread." to display the Main Thread Execution visual
    if (trimmed === "**JavaScript in Node.js runs on a single main thread.**" || trimmed === "JavaScript in Node.js runs on a single main thread.") {
      return (
        <React.Fragment key={bIdx}>
          <p className="blog-content-p">{parseInlineMarkdown(trimmed)}</p>
          <MainThreadExecutionVisual />
        </React.Fragment>
      );
    }

    // Intercept "It doesn't sit there and read files." to display delegation work visual
    if (trimmed === "It doesn't sit there and read files.") {
      return (
        <React.Fragment key={bIdx}>
          <p className="blog-content-p">{parseInlineMarkdown(trimmed)}</p>
          <DelegationThreadVisual />
        </React.Fragment>
      );
    }

    // Intercept "This is where the Event Loop fits in." to display Event Loop messenger flow visual
    if (trimmed === "This is where the Event Loop fits in.") {
      return (
        <React.Fragment key={bIdx}>
          <p className="blog-content-p">{parseInlineMarkdown(trimmed)}</p>
          <EventLoopMessengerVisual />
        </React.Fragment>
      );
    }

    // Intercept "uses a pool of worker threads." to display the complete request architecture diagram
    if (trimmed === "uses a pool of worker threads.") {
      return (
        <React.Fragment key={bIdx}>
          <p className="blog-content-p">{parseInlineMarkdown(trimmed)}</p>
          <FinalNodeArchitectureDiagram />
        </React.Fragment>
      );
    }

    // Intercept "The Accidental Backend." to display it large, centered, and typed out on scroll
    if (trimmed === "**The Accidental Backend.**" || trimmed === "The Accidental Backend.") {
      return <AccidentalBackendTyping key={bIdx} />;
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

    // Part 2 Interactive Diagrams
    if (trimmed === "[curtain-diagram]") {
      return <CurtainDiagram key={bIdx} />;
    }

    if (trimmed === "[callstack-demo]") {
      return <CallStackDemo key={bIdx} />;
    }

    if (trimmed === "[node-architecture-diagram]") {
      return <NodeArchitectureDiagram key={bIdx} />;
    }

    if (trimmed === "[thread-pool-diagram]") {
      return <ThreadPoolDiagram key={bIdx} />;
    }

    if (trimmed === "[event-loop-diagram]") {
      return <EventLoopDiagram key={bIdx} />;
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

// CurtainDiagram Component for Part 2 Intro
function CurtainDiagram() {
  return (
    <div 
      className="sbx-card" 
      style={{ 
        margin: "2rem 0", 
        overflow: "hidden", 
        background: "var(--bg-3)", 
        border: "2px solid var(--border)", 
        borderRadius: "10px",
        padding: "0.4rem"
      }}
    >
      <div 
        style={{
          width: "100%",
          position: "relative",
          minHeight: "230px",
          background: "var(--bg-1)",
          border: "2px solid var(--border)",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1.75rem 1.25rem"
        }}
      >
        {/* PROMINENT VISIBLE FRONT SERVER BADGE (POSITIONED ABOVE) */}
        <div style={{
          position: "relative",
          zIndex: 4,
          background: "var(--bg-2)",
          border: "1.5px solid var(--border)",
          padding: "0.65rem 1.6rem",
          borderRadius: "6px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginTop: "0.25rem"
        }}>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.95rem", color: "var(--t1)", letterSpacing: "0.05em" }}>
            Server
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--t3)", fontFamily: "var(--font-mono, monospace)", borderLeft: "1px solid var(--border)", paddingLeft: "0.75rem" }}>
            node app.js
          </span>
        </div>

        {/* Down Connecting Cable */}
        <div style={{ width: "2px", height: "28px", background: "var(--border)", zIndex: 3, marginTop: "0.25rem" }} />

        {/* BARELY VISIBLE COMPONENTS BEHIND THE CURTAIN (POSITIONED LOWER) */}
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          opacity: 0.18,
          filter: "blur(0.4px)",
          zIndex: 1,
          marginTop: "auto"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "0.65rem",
            width: "100%"
          }}>
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.85rem 0.4rem", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>V8 Engine</div>
              <div style={{ fontSize: "0.68rem", color: "var(--t3)", marginTop: "0.2rem" }}>JS Execution</div>
            </div>

            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.85rem 0.4rem", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>Event Loop</div>
              <div style={{ fontSize: "0.68rem", color: "var(--t3)", marginTop: "0.2rem" }}>Coordinator</div>
            </div>

            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.85rem 0.4rem", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>libuv</div>
              <div style={{ fontSize: "0.68rem", color: "var(--t3)", marginTop: "0.2rem" }}>Thread Pool</div>
            </div>

            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.85rem 0.4rem", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>OS Kernel</div>
              <div style={{ fontSize: "0.68rem", color: "var(--t3)", marginTop: "0.2rem" }}>Async I/O</div>
            </div>
          </div>
        </div>

        {/* CURTAIN FABRIC TEXTURE OVERLAY */}
        <div style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          pointerEvents: "none",
          border: "2px solid var(--border)",
          borderRadius: "8px",
          background: `
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(0, 0, 0, 0.82) 22px,
              rgba(255, 255, 255, 0.03) 44px,
              rgba(0, 0, 0, 0.88) 66px
            )
          `
        }} />
      </div>
    </div>
  );
}

// SingleThreadedStatement Component for Part 2 Chapter 1 Cliffhanger
function SingleThreadedStatement() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        margin: "2.5rem 0",
        padding: "2.5rem 1.5rem",
        background: "var(--bg-2)",
        border: "2px dashed var(--border)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      <div 
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "1.45rem",
          fontWeight: 800,
          color: "var(--t1)",
          lineHeight: "1.35",
          letterSpacing: "-0.02em",
          marginBottom: "1.25rem"
        }}
      >
        {glitch ? '"N0de.js 1s s1ngle-threaded."' : '"Node.js is single-threaded."'}
      </div>

      <div 
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.9rem",
          fontWeight: 700,
          background: "var(--bg-1)",
          border: "2px solid var(--border)",
          padding: "0.45rem 1.25rem",
          borderRadius: "4px",
          color: "var(--t1)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          animation: "pulseThread 2s infinite ease-in-out"
        }}
      >
        TRUE? <span style={{ animation: "blinkCursor 1s infinite steps(2, start)" }}>_</span>
      </div>

      <style>{`
        @keyframes pulseThread {
          0%, 100% { opacity: 0.8; border-color: var(--border); }
          50% { opacity: 1; border-color: var(--t1); }
        }
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// EventLoopMessengerVisual Component for Part 2 Chapter 3 Event Loop Intro
function EventLoopMessengerVisual() {
  const [step, setStep] = useState<"idle" | "ready" | "notifying" | "done">("idle");

  const runSimulation = () => {
    if (step !== "idle") return;
    
    // Step 1: Background task finishes, needs to notify JavaScript
    setStep("ready");
    
    // Step 2: Event Loop picks it up and carries the notification
    setTimeout(() => {
      setStep("notifying");
    }, 1200);

    // Step 3: JavaScript receives notification and runs callback
    setTimeout(() => {
      setStep("done");
    }, 2400);

    // Reset
    setTimeout(() => {
      setStep("idle");
    }, 4500);
  };

  return (
    <div className="sbx-card">
      <div className="sbx-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span className="sbx-heading">The Notification Loop</span>
        </div>
        <button 
          onClick={runSimulation}
          disabled={step !== "idle"}
          className="c10k-sim-btn"
          style={{
            padding: "0.45rem 1rem",
            fontSize: "0.72rem",
            fontFamily: "var(--font-mono, monospace)"
          }}
          type="button"
        >
          {step === "idle" && "Simulate Task"}
          {step === "ready" && "Task Completed..."}
          {step === "notifying" && "Notifying..."}
          {step === "done" && "Notified!"}
        </button>
      </div>

      <div 
        style={{
          padding: "1.75rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* JAVASCRIPT BLOCK */}
        <div style={{
          background: step === "done" ? "var(--bg-3)" : "var(--bg-2)",
          border: step === "done" ? "2px solid var(--t1)" : "1.5px solid var(--border)",
          borderRadius: "6px",
          padding: "0.75rem 1.75rem",
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "var(--t1)",
          transition: "all 0.3s ease",
          boxShadow: step === "done" ? "0 4px 12px rgba(0,0,0,0.5)" : "none",
          textAlign: "center"
        }}>
          <div>JavaScript Thread</div>
          <div style={{ fontSize: "0.7rem", color: "var(--t3)", marginTop: "0.15rem" }}>
            {step === "done" ? "Executing Callback" : "Running JS Execution"}
          </div>
        </div>

        {/* CONNECTION LINE DOWN */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
          <div style={{ 
            width: "2px", 
            height: "24px", 
            background: step === "notifying" || step === "done" ? "var(--t1)" : "var(--border)",
            transition: "all 0.3s ease"
          }} />
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: `6px solid ${step === "notifying" || step === "done" ? "var(--t1)" : "var(--border)"}`,
            marginTop: "-1px",
            transition: "all 0.3s ease"
          }} />
        </div>

        {/* EVENT LOOP MESSAGE TRANSLATOR */}
        <div style={{
          background: step === "notifying" ? "var(--bg-3)" : "var(--bg-2)",
          border: step === "notifying" ? "2px solid var(--t1)" : "1.5px solid var(--border)",
          borderRadius: "8px",
          padding: "0.85rem 2rem",
          minWidth: "220px",
          textAlign: "center",
          boxShadow: step === "notifying" ? "0 4px 12px rgba(0,0,0,0.5)" : "none",
          transition: "all 0.3s ease",
          position: "relative"
        }}>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: "0.95rem", color: "var(--t1)", letterSpacing: "0.05em" }}>
            Event Loop
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--t3)", fontFamily: "var(--font-mono, monospace)", marginTop: "0.2rem" }}>
            {step === "idle" && "Polling Background Task..."}
            {step === "ready" && "Noticed Finished Task!"}
            {step === "notifying" && 'Asking: "Is anything ready?"'}
            {step === "done" && "Task Dispatched"}
          </div>
        </div>

        {/* CONNECTION LINE DOWN */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
          <div style={{ 
            width: "2px", 
            height: "24px", 
            background: step === "ready" || step === "notifying" ? "var(--t1)" : "var(--border)",
            transition: "all 0.3s ease"
          }} />
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: `6px solid ${step === "ready" || step === "notifying" ? "var(--t1)" : "var(--border)"}`,
            transform: "rotate(180deg)",
            marginTop: "-1px",
            transition: "all 0.3s ease"
          }} />
        </div>

        {/* BACKGROUND WORK NOTIFIER */}
        <div style={{
          background: step === "ready" ? "var(--bg-3)" : "var(--bg-2)",
          border: step === "ready" ? "2px solid var(--t1)" : "1.5px dashed var(--border)",
          borderRadius: "6px",
          padding: "0.75rem 1.5rem",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "var(--t2)",
          textAlign: "center",
          transition: "all 0.3s ease"
        }}>
          <div>Background Task</div>
          <div style={{ fontSize: "0.7rem", color: "var(--t3)", marginTop: "0.15rem" }}>
            {step === "idle" && "Reading file bytes asynchronously..."}
            {step === "ready" && "Task Completed! Signaling Event Loop..."}
            {step === "notifying" && "Signaled"}
            {step === "done" && "Idle"}
          </div>
        </div>
      </div>
    </div>
  );
}

// BehindCurtainArrow Component — animated curling arrow at end of Part 1
function BehindCurtainArrow() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", marginTop: "2.5rem", marginBottom: "0", paddingBottom: "0" }}>
      {/* The heading text — left aligned, unchanged */}
      <h4 className="blog-content-h3" style={{ marginBottom: "0" }}>Behind the Curtain.</h4>

      {/* Full-width SVG arrow overlay: starts right of text, loops, sweeps to bottom-right */}
      <svg
        viewBox="0 0 600 150"
        width="100%"
        height="150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", marginTop: "-0.5rem", marginBottom: "0", paddingBottom: "0", overflow: "visible" }}
        aria-hidden
      >
        <style>{`
          @keyframes bca-draw {
            0%   { stroke-dashoffset: 1100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes bca-head {
            0%, 78% { opacity: 0; }
            100%     { opacity: 1; }
          }
          .bca-path {
            stroke-dasharray: 1100;
            stroke-dashoffset: 1100;
            animation: ${isVisible ? "bca-draw 2s cubic-bezier(0.3, 0, 0.2, 1) forwards" : "none"};
          }
          .bca-head {
            opacity: 0;
            animation: ${isVisible ? "bca-head 2s cubic-bezier(0.3, 0, 0.2, 1) forwards" : "none"};
          }
        `}</style>

        {/*
          Path:
          - Starts exactly next to the period of "Behind the Curtain." (x=190, y=18)
          - Sweeps up and right, then loops clockwise (tilted left, matching hand-drawn style)
          - Exits sweeping down-right
          - Ends at x=460, y=135 pointing down-right at the target card
        */}
        <path
          className="bca-path"
          d="      M 130 20
    C 155 42, 185 52, 215 50
    C 245 48, 275 32, 305 30
    C 330 28, 350 42, 352 62
    C 355 84, 342 102, 322 106
    C 300 110, 280 96, 280 78
    C 280 58, 300 43, 325 38
    C 355 32, 390 38, 415 52
    C 445 68, 462 94, 470 120
    C 476 138, 478 151, 480 160"
          stroke="var(--t2)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Arrowhead pointing down-right along path tangent */}
        <g className="bca-head">
          <path
            d=" M 465 150
    C 470 154, 475 158, 480 160
    C 484 154, 489 148, 494 142"
            stroke="var(--t2)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

// AccidentalBackendTyping Component — scroll-triggered typing animation for final line
function AccidentalBackendTyping() {
  const [text, setText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const fullText = "The Accidental Backend.";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      if (currentIndex < fullText.length) {
        setText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        const randomDelay = Math.random() * 80 + 70; // humanized typing delays
        timeoutId = setTimeout(type, randomDelay);
      }
    };

    type();
    return () => clearTimeout(timeoutId);
  }, [isVisible]);

  const isDone = text.length === fullText.length;

  return (
    <p
      ref={containerRef}
      className="blog-content-p"
      style={{
        fontSize: "1.65rem",
        fontWeight: 800,
        textAlign: "center",
        margin: "3rem 0 0",
        color: "var(--t1)",
        fontFamily: "var(--font-mono, monospace)",
        minHeight: "2.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <span>{text}</span>
      <span
        style={{
          display: "inline-block",
          marginLeft: "4px",
          width: "8px",
          height: "1.45rem",
          backgroundColor: "var(--accent, #7c6bff)",
          animation: "blink 1s step-end infinite",
          opacity: isDone ? 0.3 : 1
        }}
      />
      <style>{`
        @keyframes blink {
          from, to { background-color: transparent }
          50% { background-color: var(--accent, #7c6bff) }
        }
      `}</style>
    </p>
  );
}

// LibuvThreadPoolComparisonDiagram Component for Part 2 Chapter 4
function LibuvThreadPoolComparisonDiagram() {
  return (
    <div className="sbx-card" style={{ margin: "2rem 0" }}>
      <div className="sbx-header">
        <span className="sbx-heading">I/O Offloading Paths</span>
      </div>
      
      <div 
        style={{
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "var(--bg-1)",
          fontFamily: "var(--font-mono, monospace)"
        }}
      >
        {/* Node.js Root */}
        <div style={{
          background: "var(--bg-2)",
          border: "2px solid var(--border)",
          borderRadius: "6px",
          padding: "0.6rem 2rem",
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "var(--t1)",
          textAlign: "center"
        }}>
          Node.js
        </div>

        {/* Cable Down */}
        <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />
        <div style={{ width: "66%", height: "2px", background: "var(--border)" }} />

        {/* 2 branch cables */}
        <div style={{ width: "66%", display: "flex", justifyContent: "space-between", height: "16px" }}>
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
        </div>

        {/* 2 main branch descriptors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", width: "100%" }}>
          {/* Left Branch */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t2)",
              textAlign: "center"
            }}>
              Network I/O
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
              <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--border)", marginTop: "-1px" }} />
            </div>

            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 1.25rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--t1)",
              textAlign: "center"
            }}>
              Operating System
            </div>
          </div>

          {/* Right Branch */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t2)",
              textAlign: "center"
            }}>
              Certain operations
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
              <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--border)", marginTop: "-1px" }} />
            </div>

            <div style={{
              background: "var(--bg-2)",
              border: "2px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 1.25rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--t1)",
              textAlign: "center"
            }}>
              libuv Thread Pool
            </div>

            {/* Split from Thread Pool to File/DNS/Crypto */}
            <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />
            <div style={{ width: "80%", height: "2px", background: "var(--border)" }} />
            <div style={{ width: "80%", display: "flex", justifyContent: "space-between", height: "16px" }}>
              <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
              <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
              <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
            </div>

            {/* 3 Workers Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", width: "100%" }}>
              <div style={{ background: "var(--bg-2)", border: "1.5px dashed var(--border)", borderRadius: "4px", padding: "0.4rem 0.2rem", fontSize: "0.7rem", textAlign: "center", fontWeight: 700, color: "var(--t2)" }}>
                File I/O
              </div>
              <div style={{ background: "var(--bg-2)", border: "1.5px dashed var(--border)", borderRadius: "4px", padding: "0.4rem 0.2rem", fontSize: "0.7rem", textAlign: "center", fontWeight: 700, color: "var(--t2)" }}>
                DNS
              </div>
              <div style={{ background: "var(--bg-2)", border: "1.5px dashed var(--border)", borderRadius: "4px", padding: "0.4rem 0.2rem", fontSize: "0.7rem", textAlign: "center", fontWeight: 700, color: "var(--t2)" }}>
                Crypto
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// FinalNodeArchitectureDiagram Component for Part 2 Chapter 4 Finale
function FinalNodeArchitectureDiagram() {
  const [opType, setOpType] = useState<"network" | "file">("network");
  const [step, setStep] = useState<"idle" | "javascript" | "main-thread" | "nodejs" | "offload" | "event-loop" | "done">("idle");

  const runLifecycle = () => {
    if (step !== "idle") return;

    setStep("javascript");
    
    setTimeout(() => setStep("main-thread"), 800);
    setTimeout(() => setStep("nodejs"), 1600);
    setTimeout(() => setStep("offload"), 2400);
    setTimeout(() => setStep("event-loop"), 3200);
    setTimeout(() => setStep("done"), 4000);
    setTimeout(() => setStep("idle"), 5600);
  };

  const getGlowStyle = (activeSteps: typeof step[]) => {
    const isActive = activeSteps.includes(step);
    return {
      transition: "all 0.4s ease",
      border: isActive ? "2px solid var(--t1)" : "1.5px solid var(--border)",
      background: isActive ? "var(--bg-3)" : "var(--bg-2)",
      boxShadow: isActive ? "0 4px 12px rgba(255, 255, 255, 0.15)" : "none",
      color: isActive ? "var(--t1)" : "var(--t2)"
    };
  };

  const getArrowColor = (activeSteps: typeof step[]) => {
    return activeSteps.includes(step) ? "var(--t1)" : "var(--border)";
  };

  return (
    <div className="sbx-card" style={{ margin: "2rem 0" }}>
      <div className="sbx-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span className="sbx-heading">Complete Request Architecture Trace</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select 
            value={opType} 
            onChange={(e) => setOpType(e.target.value as "network" | "file")}
            disabled={step !== "idle"}
            style={{
              padding: "0.35rem 0.5rem",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--t1)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.72rem",
              cursor: "pointer"
            }}
          >
            <option value="network">Network (OS path)</option>
            <option value="file">File/Crypto (libuv path)</option>
          </select>
          <button 
            onClick={runLifecycle}
            disabled={step !== "idle"}
            className="c10k-sim-btn"
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.72rem",
              fontFamily: "var(--font-mono, monospace)"
            }}
            type="button"
          >
            {step === "idle" ? "Trace Lifecycle" : "Tracing..."}
          </button>
        </div>
      </div>
      
      <div 
        style={{
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "var(--bg-1)",
          fontFamily: "var(--font-mono, monospace)"
        }}
      >
        {/* JavaScript Box */}
        <div style={{
          ...getGlowStyle(["javascript"]),
          borderRadius: "6px",
          padding: "0.6rem 2rem",
          fontWeight: 700,
          fontSize: "0.85rem",
          textAlign: "center"
        }}>
          JavaScript
        </div>

        {/* Down Arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
          <div style={{ width: "2px", height: "16px", background: getArrowColor(["javascript"]), transition: "background 0.4s ease" }} />
          <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${getArrowColor(["javascript"])}`, marginTop: "-1px", transition: "border-color 0.4s ease" }} />
        </div>

        {/* Main Thread Box */}
        <div style={{
          ...getGlowStyle(["main-thread"]),
          borderRadius: "6px",
          padding: "0.5rem 1.5rem",
          fontSize: "0.8rem",
          fontWeight: 700,
          textAlign: "center"
        }}>
          Main Thread
        </div>

        {/* Down Arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
          <div style={{ width: "2px", height: "16px", background: getArrowColor(["main-thread"]), transition: "background 0.4s ease" }} />
          <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${getArrowColor(["main-thread"])}`, marginTop: "-1px", transition: "border-color 0.4s ease" }} />
        </div>

        {/* Node.js Box */}
        <div style={{
          ...getGlowStyle(["nodejs"]),
          borderRadius: "6px",
          padding: "0.6rem 2rem",
          fontWeight: 700,
          fontSize: "0.9rem",
          textAlign: "center"
        }}>
          Node.js
        </div>

        {/* Split to OS / libuv */}
        <div style={{ width: "2px", height: "16px", background: getArrowColor(["nodejs"]), transition: "background 0.4s ease" }} />
        <div style={{ width: "66%", height: "2px", background: getArrowColor(["nodejs"]), transition: "background 0.4s ease" }} />
        <div style={{ width: "66%", display: "flex", justifyContent: "space-between", height: "16px" }}>
          <div style={{ width: "2px", height: "100%", background: getArrowColor(["nodejs", "offload"]), transition: "background 0.4s ease" }} />
          <div style={{ width: "2px", height: "100%", background: getArrowColor(["nodejs", "offload"]), transition: "background 0.4s ease" }} />
        </div>

        {/* Two Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", width: "100%" }}>
          {/* OS Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: opType === "network" ? 1 : 0.4, transition: "opacity 0.4s ease" }}>
            <div style={{
              ...getGlowStyle(["offload"]),
              borderRadius: "6px",
              padding: "0.45rem 1rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              textAlign: "center"
            }}>
              OS
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
              <div style={{ width: "2px", height: "16px", background: getArrowColor(["offload"]), transition: "background 0.4s ease" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${getArrowColor(["offload"])}`, marginTop: "-1px", transition: "border-color 0.4s ease" }} />
            </div>

            <div style={{
              ...getGlowStyle(["offload"]),
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              textAlign: "center"
            }}>
              Network I/O
            </div>
          </div>

          {/* libuv Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: opType === "file" ? 1 : 0.4, transition: "opacity 0.4s ease" }}>
            <div style={{
              ...getGlowStyle(["offload"]),
              borderRadius: "6px",
              padding: "0.45rem 1rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              textAlign: "center"
            }}>
              libuv
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
              <div style={{ width: "2px", height: "16px", background: getArrowColor(["offload"]), transition: "background 0.4s ease" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${getArrowColor(["offload"])}`, marginTop: "-1px", transition: "border-color 0.4s ease" }} />
            </div>

            <div style={{
              ...getGlowStyle(["offload"]),
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              textAlign: "center"
            }}>
              Thread Pool
            </div>
          </div>
        </div>

        {/* Merge path back down */}
        <div style={{ width: "2px", height: "16px", background: getArrowColor(["offload"]), transition: "background 0.4s ease", marginTop: "0.5rem" }} />
        <div style={{ width: "66%", height: "2px", background: getArrowColor(["offload"]), transition: "background 0.4s ease" }} />
        <div style={{ width: "66%", display: "flex", justifyContent: "space-between", height: "12px" }}>
          <div style={{ width: "2px", height: "100%", background: getArrowColor(["offload", "event-loop"]), transition: "background 0.4s ease" }} />
          <div style={{ width: "2px", height: "100%", background: getArrowColor(["offload", "event-loop"]), transition: "background 0.4s ease" }} />
        </div>
        <div style={{ width: "2px", height: "20px", background: getArrowColor(["event-loop"]), transition: "background 0.4s ease" }} />
        <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${getArrowColor(["event-loop"])}`, marginTop: "-1px", transition: "border-color 0.4s ease" }} />

        {/* Event Loop Box */}
        <div style={{
          ...getGlowStyle(["event-loop"]),
          borderRadius: "6px",
          padding: "0.6rem 1.5rem",
          fontWeight: 700,
          fontSize: "0.85rem",
          textAlign: "center"
        }}>
          Event Loop
        </div>

        {/* Down Arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
          <div style={{ width: "2px", height: "16px", background: getArrowColor(["event-loop"]), transition: "background 0.4s ease" }} />
          <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${getArrowColor(["event-loop"])}`, marginTop: "-1px", transition: "border-color 0.4s ease" }} />
        </div>

        {/* JavaScript Box (Bottom) */}
        <div style={{
          ...getGlowStyle(["done"]),
          borderRadius: "6px",
          padding: "0.5rem 1.5rem",
          fontWeight: 700,
          fontSize: "0.85rem",
          textAlign: "center"
        }}>
          {step === "done" ? "JavaScript (Callback Executed!)" : "JavaScript"}
        </div>

      </div>
    </div>
  );
}

// EventLoopSequenceFlowDiagram Component for Part 2 Chapter 3
function EventLoopSequenceFlowDiagram() {
  return (
    <div className="sbx-card" style={{ margin: "2rem 0" }}>
      <div className="sbx-header">
        <span className="sbx-heading">Event Loop Coordination Cycle</span>
      </div>
      
      <div 
        style={{
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "var(--bg-1)",
          fontFamily: "var(--font-mono, monospace)"
        }}
      >
        {/* START Node */}
        <div style={{
          background: "var(--bg-2)",
          border: "2px solid var(--border)",
          borderRadius: "6px",
          padding: "0.6rem 1.5rem",
          fontWeight: 700,
          fontSize: "0.85rem",
          color: "var(--t1)",
          textAlign: "center"
        }}>
          JavaScript
        </div>

        {/* Arrow Down */}
        <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />

        {/* Starts Work Box */}
        <div style={{
          background: "var(--bg-2)",
          border: "1.5px solid var(--border)",
          borderRadius: "6px",
          padding: "0.5rem 1.25rem",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--t2)",
          textAlign: "center"
        }}>
          Starts some work
        </div>

        {/* Branching Lines */}
        <div style={{ width: "2px", height: "16px", background: "var(--border)" }} />
        <div style={{ width: "70%", height: "2px", background: "var(--border)" }} />
        
        <div style={{ width: "70%", display: "flex", justifyContent: "space-between", height: "20px" }}>
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
        </div>

        {/* Two Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", width: "100%", position: "relative" }}>
          
          {/* Left Path: JS Continues */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t1)",
              textAlign: "center",
              marginTop: "0.5rem"
            }}>
              JavaScript continues
            </div>
            
            {/* Long Vertical line down to merge */}
            <div style={{ width: "2px", height: "216px", background: "var(--border)", borderLeft: "1px dashed var(--border)" }} />
          </div>

          {/* Right Path: Async Delegation & Completion */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            
            {/* Work Handled Elsewhere */}
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t2)",
              textAlign: "center",
              marginTop: "0.5rem"
            }}>
              Work handled elsewhere
            </div>

            {/* Down Arrow */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.2rem 0" }}>
              <div style={{ width: "2px", height: "16px", background: "var(--border)" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--border)", marginTop: "-1px" }} />
            </div>

            {/* Work Finishes */}
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px dashed var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t2)",
              textAlign: "center"
            }}>
              Work finishes
            </div>

            {/* Down Arrow */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
              <div style={{ width: "2px", height: "16px", background: "var(--border)" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--border)", marginTop: "-1px" }} />
            </div>

            {/* Event Loop notices */}
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t1)",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
            }}>
              Event Loop
            </div>

            {/* Down Arrow */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.2rem 0" }}>
              <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />
            </div>

          </div>

        </div>

        {/* Merge Lines */}
        <div style={{ width: "70%", display: "flex", justifyContent: "space-between", height: "10px" }}>
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
        </div>
        <div style={{ width: "70%", height: "2px", background: "var(--border)" }} />
        <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />
        <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--border)", marginTop: "-1px" }} />

        {/* Handle Result Box */}
        <div style={{
          background: "var(--bg-2)",
          border: "2px solid var(--border)",
          borderRadius: "6px",
          padding: "0.6rem 1.25rem",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--t1)",
          textAlign: "center",
          marginTop: "0.25rem"
        }}>
          JavaScript handles the result
        </div>

      </div>
    </div>
  );
}

// DelegationThreadVisual Component for Part 2 Chapter 2
function DelegationThreadVisual() {
  return (
    <div 
      className="sbx-card" 
      style={{ 
        margin: "1.75rem 0", 
        overflow: "hidden", 
        background: "var(--bg-3)", 
        border: "2px solid var(--border)", 
        borderRadius: "10px",
        padding: "0.4rem"
      }}
    >
      <div 
        style={{
          width: "100%",
          background: "var(--bg-1)",
          border: "2px solid var(--border)",
          borderRadius: "8px",
          padding: "1.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* Title */}
        <div style={{ width: "100%", textAlign: "left", marginBottom: "1.25rem" }}>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.85rem", color: "var(--t2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            The Delegation Flow
          </div>
          <div style={{ width: "100%", height: "1px", background: "var(--border)", marginTop: "0.4rem" }} />
        </div>

        {/* 2 Column Flow (Main Thread vs Background) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%", position: "relative" }}>
          
          {/* Main Thread Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: "0.75rem", color: "var(--t2)", marginBottom: "0.85rem", textTransform: "uppercase" }}>
              Main Thread
            </div>
            
            {/* Step 1 Box */}
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t1)",
              textAlign: "center"
            }}>
              fs.readFile(...)
            </div>

            {/* Vertical Flow Arrow */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
              <div style={{ width: "2px", height: "30px", background: "var(--border)" }} />
              <div style={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "5px solid var(--border)",
                marginTop: "-1px"
              }} />
              <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono, monospace)", color: "var(--t3)", marginTop: "0.15rem" }}>
                Immediately Free
              </span>
            </div>

            {/* Step 2 Box */}
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--t1)",
              textAlign: "center"
            }}>
              Execute Next JS Block
            </div>
          </div>

          {/* Background / Delegation Column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: "0.75rem", color: "var(--t2)", marginBottom: "0.85rem", textTransform: "uppercase" }}>
              Background
            </div>

            {/* Empty space matching alignment */}
            <div style={{ height: "36px" }} />

            {/* Background Work Box */}
            <div style={{
              background: "var(--bg-2)",
              border: "1.5px dashed var(--border)",
              borderRadius: "6px",
              padding: "0.85rem 0.8rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "var(--t2)",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
            }}>
              Read file bytes from disk
            </div>
          </div>

          {/* DELEGATION ROW / CONNECTOR LINE (OVERLAY ARROW FROM LEFT TO RIGHT) */}
          <div style={{
            position: "absolute",
            top: "54px",
            left: "50%",
            width: "35%",
            height: "2px",
            background: "var(--border)",
            borderTop: "1px dashed var(--border)",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end"
          }}>
            <span style={{
              fontSize: "0.58rem",
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--t2)",
              background: "var(--bg-1)",
              padding: "0.05rem 0.3rem",
              border: "1px solid var(--border)",
              borderRadius: "3px",
              position: "absolute",
              left: "50%",
              transform: "translate(-50%, -12px)",
              whiteSpace: "nowrap"
            }}>
              Delegate
            </span>
            <div style={{
              width: 0,
              height: 0,
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: "6px solid var(--border)",
              marginRight: "-2px"
            }} />
          </div>

        </div>
      </div>
    </div>
  );
}

// MainThreadExecutionVisual Component for Part 2 Chapter 2
function MainThreadExecutionVisual() {
  return (
    <div 
      style={{ 
        margin: "2rem 0", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        width: "100%"
      }}
    >
      {/* TOP NODE.JS CARD */}
      <div style={{
        background: "var(--bg-2)",
        border: "1.5px solid var(--border)",
        borderRadius: "6px",
        padding: "0.6rem 1.5rem",
        fontFamily: "var(--font-mono, monospace)",
        fontWeight: 700,
        fontSize: "0.92rem",
        color: "var(--t1)"
      }}>
        Node.js
      </div>

      {/* CONNECTING ARROW */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0.25rem 0" }}>
        <div style={{ width: "2px", height: "16px", background: "var(--border)" }} />
        <div style={{
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "6px solid var(--border)",
          marginTop: "-1px"
        }} />
      </div>

      {/* MAIN THREAD CONTAINER */}
      <div style={{
        background: "var(--bg-2)",
        border: "2px solid var(--border)",
        borderRadius: "8px",
        padding: "1.25rem 2rem",
        minWidth: "220px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)"
      }}>
        {/* Main Thread Header */}
        <div style={{
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 800,
          fontSize: "0.85rem",
          color: "var(--t1)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.85rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.3rem",
          width: "100%",
          textAlign: "center"
        }}>
          Main Thread
        </div>

        {/* JS execution items */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--t2)", background: "var(--bg-1)", padding: "0.3rem 0.8rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
            Execute JS
          </div>
          
          <div style={{ color: "var(--t3)", fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)" }}>↓</div>

          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--t2)", background: "var(--bg-1)", padding: "0.3rem 0.8rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
            Execute JS
          </div>

          <div style={{ color: "var(--t3)", fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)" }}>↓</div>

          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--t2)", background: "var(--bg-1)", padding: "0.3rem 0.8rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
            Execute JS
          </div>
        </div>
      </div>
    </div>
  );
}

// BlockingThreadVisualization Component for Part 2 Chapter 2
function BlockingThreadVisualization() {
  return (
    <div 
      className="sbx-card" 
      style={{ 
        margin: "1.75rem 0", 
        overflow: "hidden", 
        background: "var(--bg-3)", 
        border: "2px solid var(--border)", 
        borderRadius: "10px",
        padding: "0.4rem"
      }}
    >
      <div 
        style={{
          width: "100%",
          background: "var(--bg-1)",
          border: "2px solid var(--border)",
          borderRadius: "8px",
          padding: "1.75rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* THREAD TITLE & BAR */}
        <div style={{ width: "100%", textAlign: "left", marginBottom: "1.25rem" }}>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.85rem", color: "var(--t2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            JavaScript Thread
          </div>
          <div style={{ width: "100%", height: "1px", background: "var(--border)", marginTop: "0.4rem" }} />
        </div>

        {/* SEQUENCE FLOW */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {/* Request Box */}
          <div style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "0.6rem 1.5rem",
            fontFamily: "var(--font-mono, monospace)",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "var(--t1)"
          }}>
            Request
          </div>

          {/* Arrow Down */}
          <div style={{ width: "2px", height: "20px", background: "var(--border)" }} />

          {/* Read File Box */}
          <div style={{
            background: "var(--bg-2)",
            border: "1.5px dashed var(--border)",
            borderRadius: "6px",
            padding: "0.75rem 1.75rem",
            fontFamily: "var(--font-mono, monospace)",
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "var(--t1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>
            Read File (Blocking)
          </div>

          {/* Waiting Line & Blinking Text */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", margin: "0.5rem 0" }}>
            <div style={{ width: "2px", height: "70px", background: "var(--border)", borderLeft: "1px dashed var(--border)" }} />
            
            <div style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--bg-1)",
              border: "1.5px solid var(--border)",
              borderRadius: "4px",
              padding: "0.3rem 0.8rem",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "var(--t2)",
              letterSpacing: "0.1em",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              animation: "blinkWaiting 1.5s infinite steps(2, start)"
            }}>
              WAITING...
            </div>
          </div>

          {/* Continue Box */}
          <div style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "0.6rem 1.5rem",
            fontFamily: "var(--font-mono, monospace)",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "var(--t1)"
          }}>
            Continue Execution
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blinkWaiting {
          0%, 100% { opacity: 0.5; border-color: var(--border); }
          50% { opacity: 1; border-color: var(--t1); color: var(--t1); }
        }
      `}</style>
    </div>
  );
}

// CallStackDemo Component for Part 2
function CallStackDemo() {
  const [mode, setMode] = useState<"sync" | "async">("sync");
  const [stack, setStack] = useState<string[]>([]);
  const [status, setStatus] = useState("Idle");
  const [isBusy, setIsBusy] = useState(false);
  const [reqsServed, setReqsServed] = useState(0);
  const [reqsBlocked, setReqsBlocked] = useState(0);

  const runDemo = (selectedMode: "sync" | "async") => {
    setMode(selectedMode);
    setIsBusy(true);
    setReqsServed(0);
    setReqsBlocked(0);

    if (selectedMode === "sync") {
      setStack(["main()", "fs.readFileSync('file.pdf')"]);
      setStatus("FROZEN! Main thread is synchronously waiting for disk I/O. Stack is stuck.");
      setTimeout(() => {
        setStack(["main()"]);
        setTimeout(() => {
          setStack([]);
          setStatus("Complete.");
          setIsBusy(false);
        }, 800);
      }, 3000);
    } else {
      setStack(["main()", "fs.readFile('file.pdf', cb)"]);
      setStatus("Delegated fs.readFile to libuv C++ layer. Call stack cleared immediately!");
      setTimeout(() => {
        setStack(["main()"]);
        setTimeout(() => {
          setStack([]);
          setStatus("Call Stack FREE. Main thread ready for incoming requests!");
          setTimeout(() => {
            setStack(["cb(err, data)"]);
            setStatus("I/O finished in background! Callback pushed to stack.");
            setTimeout(() => {
              setStack([]);
              setStatus("Complete.");
              setIsBusy(false);
            }, 1000);
          }, 1500);
        }, 400);
      }, 500);
    }
  };

  const handleIncomingReq = () => {
    if (isBusy && mode === "sync") {
      setReqsBlocked((b) => b + 1);
    } else {
      setReqsServed((s) => s + 1);
    }
  };

  return (
    <div className="c10k-container corner-box" style={{ margin: "1.75rem 0" }}>
      <div className="c10k-header">
        <div>
          <h4 className="c10k-title">Interactive Call Stack: Synchronous vs Asynchronous I/O</h4>
          <p className="c10k-subtitle">See how blocking operations freeze the single thread versus non-blocking delegation.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            className={`c10k-sim-btn ${mode === "sync" ? "active" : ""}`} 
            onClick={() => runDemo("sync")}
            disabled={isBusy}
            type="button"
          >
            Run fs.readFileSync() (Blocking)
          </button>
          <button 
            className={`c10k-sim-btn ${mode === "async" ? "active" : ""}`} 
            onClick={() => runDemo("async")}
            disabled={isBusy}
            type="button"
          >
            Run fs.readFile() (Async)
          </button>
        </div>
      </div>

      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t2)", marginBottom: "0.75rem" }}>
              Call Stack Frame (V8)
            </div>
            <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "8px", minHeight: "140px", padding: "0.75rem", display: "flex", flexDirection: "column-reverse", gap: "0.4rem" }}>
              {stack.length === 0 ? (
                <div style={{ color: "var(--t3)", fontSize: "0.8rem", textAlign: "center", margin: "auto" }}>[ Call Stack Empty ]</div>
              ) : (
                stack.map((item, idx) => (
                  <div key={idx} style={{ background: mode === "sync" && item.includes("readFileSync") ? "rgba(220, 38, 38, 0.2)" : "var(--bg-2)", border: `1px solid ${mode === "sync" && item.includes("readFileSync") ? "#ef4444" : "var(--border)"}`, borderRadius: "4px", padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontFamily: "var(--font-mono, monospace)", color: "var(--t1)" }}>
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t2)", marginBottom: "0.75rem" }}>
                Thread Traffic Simulator
              </div>
              <button 
                onClick={handleIncomingReq} 
                className="c10k-sim-btn" 
                style={{ width: "100%", padding: "0.6rem" }}
                type="button"
              >
                Send HTTP User Request ⚡
              </button>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div>Requests Served: <strong style={{ color: "var(--t1)" }}>{reqsServed}</strong></div>
                <div>Requests Blocked / Dropped: <strong style={{ color: reqsBlocked > 0 ? "#ef4444" : "var(--t3)" }}>{reqsBlocked}</strong></div>
              </div>
            </div>

            <div style={{ marginTop: "1rem", padding: "0.6rem 0.8rem", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--t2)" }}>
              <strong>Status:</strong> {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// NodeArchitectureDiagram Component for Part 2 Chapter 1
function NodeArchitectureDiagram() {
  return (
    <div 
      className="sbx-card" 
      style={{ 
        margin: "2rem 0", 
        overflow: "hidden", 
        background: "var(--bg-3)", 
        border: "2px solid var(--border)", 
        borderRadius: "10px",
        padding: "0.4rem"
      }}
    >
      <div 
        style={{
          width: "100%",
          background: "var(--bg-1)",
          border: "2px solid var(--border)",
          borderRadius: "8px",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* TOP NODE.JS SERVER BOX */}
        <div style={{
          background: "var(--bg-2)",
          border: "2px solid var(--border)",
          borderRadius: "6px",
          padding: "0.75rem 2rem",
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 700,
          fontSize: "1rem",
          color: "var(--t1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          Node.js Runtime
        </div>

        {/* CONNECTING LINE DOWN */}
        <div style={{ width: "2px", height: "24px", background: "var(--border)" }} />

        {/* HORIZONTAL BRANCH LINE */}
        <div style={{ width: "75%", height: "2px", background: "var(--border)", borderTop: "1px dashed var(--border)" }} />

        {/* 3 BRANCH LINES */}
        <div style={{ width: "75%", display: "flex", justifyContent: "space-between", height: "20px" }}>
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
          <div style={{ width: "2px", height: "100%", background: "var(--border)" }} />
        </div>

        {/* 3 CORE COMPONENTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", width: "100%" }}>
          {/* V8 Box */}
          <div style={{ 
            background: "var(--bg-2)", 
            border: "1.5px solid var(--border)", 
            borderRadius: "6px", 
            padding: "1rem 0.75rem", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.3rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>V8 Engine</div>
            <div style={{ fontSize: "0.68rem", color: "var(--t3)", fontFamily: "var(--font-mono, monospace)" }}>JavaScript Interpreter</div>
          </div>

          {/* APIs Box */}
          <div style={{ 
            background: "var(--bg-2)", 
            border: "1.5px solid var(--border)", 
            borderRadius: "6px", 
            padding: "1rem 0.75rem", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.3rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>Bindings</div>
            <div style={{ fontSize: "0.68rem", color: "var(--t3)", fontFamily: "var(--font-mono, monospace)" }}>Core Node APIs</div>
          </div>

          {/* libuv Box */}
          <div style={{ 
            background: "var(--bg-2)", 
            border: "1.5px solid var(--border)", 
            borderRadius: "6px", 
            padding: "1rem 0.75rem", 
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.3rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>libuv</div>
            <div style={{ fontSize: "0.68rem", color: "var(--t3)", fontFamily: "var(--font-mono, monospace)" }}>Asynchronous I/O</div>
          </div>
        </div>

        {/* CONNECTING LINE FROM LIBUV DOWN TO OS */}
        <div style={{ 
          width: "100%", 
          display: "flex", 
          justifyContent: "flex-end", 
          paddingRight: "calc(16.66% - 1px)" 
        }}>
          <div style={{ width: "2px", height: "24px", background: "var(--border)", borderLeft: "1px dashed var(--border)" }} />
        </div>

        {/* OS BOX */}
        <div style={{
          width: "33.3%",
          alignSelf: "flex-end",
          background: "var(--bg-2)",
          border: "1.5px solid var(--border)",
          borderRadius: "6px",
          padding: "0.9rem 0.75rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--t1)", fontFamily: "var(--font-mono, monospace)" }}>OS Kernel</div>
          <div style={{ fontSize: "0.68rem", color: "var(--t3)", fontFamily: "var(--font-mono, monospace)" }}>epoll / kqueue / IOCP</div>
        </div>

      </div>
    </div>
  );
}

// ThreadPoolDiagram Component for Part 2
function ThreadPoolDiagram() {
  const [workers, setWorkers] = useState([
    { id: 1, status: "Idle", task: null as string | null },
    { id: 2, status: "Idle", task: null as string | null },
    { id: 3, status: "Idle", task: null as string | null },
    { id: 4, status: "Idle", task: null as string | null },
  ]);
  const [completedCount, setCompletedCount] = useState(0);

  const dispatchTask = (taskName: string) => {
    const idleIdx = workers.findIndex((w) => w.status === "Idle");
    if (idleIdx === -1) return;

    setWorkers((prev) => {
      const next = [...prev];
      next[idleIdx] = { ...next[idleIdx], status: "Busy", task: taskName };
      return next;
    });

    setTimeout(() => {
      setWorkers((prev) => {
        const next = [...prev];
        next[idleIdx] = { ...next[idleIdx], status: "Idle", task: null };
        return next;
      });
      setCompletedCount((c) => c + 1);
    }, 2500);
  };

  return (
    <div className="sbx-card" style={{ margin: "1.75rem 0" }}>
      <div className="sbx-header">
        <span className="sbx-badge">C++</span>
        <span className="sbx-heading">libuv Worker Thread Pool Simulator (UV_THREADPOOL_SIZE=4)</span>
      </div>
      <div style={{ padding: "1.25rem" }}>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button 
            className="c10k-sim-btn" 
            onClick={() => dispatchTask("crypto.pbkdf2()")}
            type="button"
          >
            Dispatch Heavy Crypto Task 🔒
          </button>
          <button 
            className="c10k-sim-btn" 
            onClick={() => dispatchTask("fs.readFile()")}
            type="button"
          >
            Dispatch Disk Read Task 📁
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {workers.map((worker) => (
            <div 
              key={worker.id} 
              style={{ 
                background: worker.status === "Busy" ? "rgba(59, 130, 246, 0.1)" : "var(--bg-3)", 
                border: worker.status === "Busy" ? "1px solid #3b82f6" : "1px solid var(--border)", 
                borderRadius: "8px", 
                padding: "0.75rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--t1)" }}>Worker Thread #{worker.id}</div>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono, monospace)", color: worker.status === "Busy" ? "#3b82f6" : "var(--t3)" }}>
                  {worker.task ? `Processing ${worker.task}...` : "Idle (Waiting for task)"}
                </div>
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: worker.status === "Busy" ? "#3b82f6" : "var(--border)", color: worker.status === "Busy" ? "#fff" : "var(--t2)" }}>
                {worker.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--t2)", background: "var(--bg-2)", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
          Total Tasks Completed Off Main Thread: <strong style={{ color: "var(--t1)" }}>{completedCount}</strong>
        </div>
      </div>
    </div>
  );
}

// EventLoopDiagram Component for Part 2
function EventLoopDiagram() {
  const [activePhase, setActivePhase] = useState(0);
  const phases = [
    { title: "1. Timers", detail: "Executes callbacks scheduled by setTimeout() and setInterval()" },
    { title: "2. Pending Callbacks", detail: "Executes deferred I/O callbacks from previous loop iteration" },
    { title: "3. Idle, Prepare", detail: "Internal libuv housekeeping phase" },
    { title: "4. Poll Phase", detail: "Retrieves new I/O events (sockets, connections) and executes callbacks" },
    { title: "5. Check Phase", detail: "Executes callbacks registered with setImmediate()" },
    { title: "6. Close Callbacks", detail: "Executes close handlers like socket.on('close')" }
  ];

  const stepPhase = () => {
    setActivePhase((p) => (p + 1) % phases.length);
  };

  return (
    <div className="sbx-card" style={{ margin: "1.75rem 0" }}>
      <div className="sbx-header">
        <span className="sbx-badge">LOOP</span>
        <span className="sbx-heading">The 6 Phases of the Node.js Event Loop</span>
      </div>
      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--t2)" }}>
            Click step to advance the Event Loop pointer through its 6 phases.
          </p>
          <button className="c10k-sim-btn active" onClick={stepPhase} type="button">
            Step Loop Phase ↻
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {phases.map((phase, idx) => (
            <div 
              key={idx}
              style={{
                padding: "0.75rem 0.9rem",
                borderRadius: "8px",
                border: activePhase === idx ? "1px solid var(--t1)" : "1px solid var(--border)",
                background: activePhase === idx ? "var(--bg-2)" : "var(--bg-3)",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: activePhase === idx ? "var(--t1)" : "var(--t2)" }}>
                {phase.title} {activePhase === idx && "👈 ACTIVE"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--t3)", marginTop: "0.25rem" }}>
                {phase.detail}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--bg-2)", border: "1px dashed var(--border)", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--t1)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ⚡ Microtask Queue Interruption:
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--t2)", marginTop: "0.2rem" }}>
            Between EVERY phase transition, Node.js empties the Microtask Queue (<code>process.nextTick</code> and <code>Promise.then</code>) before proceeding to the next phase!
          </div>
        </div>
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
        await navigator.share({ title, url });
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
    const viewedKey = `viewed_blog_${blog.id}`;
    const hasViewed = localStorage.getItem(viewedKey) === "true";

    const fetchPromise = hasViewed
      ? fetch(`/api/views?id=${encodeURIComponent(blog.id)}`) // GET only
      : fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: blog.id }),
        }); // POST (increment)

    fetchPromise
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views === "number") {
          setViews(data.views);
          if (!hasViewed) {
            localStorage.setItem(viewedKey, "true");
          }
        }
      })
      .catch((err) => console.error("Error fetching views:", err));
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
            <div className="blog-pagination" style={
              blog.id === "node-js-the-accidental-backend-part-1" 
                ? { marginTop: "0.5rem" } 
                : blog.id === "node-js-the-accidental-backend-part-2"
                  ? { marginTop: "1rem" }
                  : undefined
            }>
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
                <Link href={`/blog/${blog.id.replace(/-part-\d+$/, "")}`} className="blog-pagination-btn" style={{ textAlign: "right", alignItems: "flex-end" }}>
                  <span className="blog-pagination-label">Blog Overview →</span>
                  <span className="blog-pagination-title">Back to Overview</span>
                </Link>
              )}
            </div>

          </article>
        </div>
      </div>
    </main>
  );
}
