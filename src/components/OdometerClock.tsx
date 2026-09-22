"use client";

import React, { useState, useEffect } from "react";

interface OdometerDigitProps {
  char: string;
}

function OdometerDigit({ char }: OdometerDigitProps) {
  const [current, setCurrent] = useState(char);
  const [prev, setPrev] = useState<string | null>(null);

  useEffect(() => {
    if (char !== current) {
      setPrev(current);
      setCurrent(char);

      const timer = setTimeout(() => {
        setPrev(null);
      }, 420);

      return () => clearTimeout(timer);
    }
  }, [char, current]);

  return (
    <span className="odometer-slot">
      {prev !== null && (
        <span className="odometer-num odometer-slide-out" key={`prev-${prev}`}>
          {prev}
        </span>
      )}
      <span
        className={`odometer-num ${prev !== null ? "odometer-slide-in" : ""}`}
        key={`curr-${current}`}
      >
        {current}
      </span>
    </span>
  );
}

interface ParsedTime {
  hours: string;
  minutes: string;
  seconds: string;
  ampm: string;
}

const getKolkataTime = (): ParsedTime => {
  const now = new Date();
  const str = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const [timePart, ampmPart = ""] = str.split(" ");
  const [hours = "0", minutes = "00", seconds = "00"] = timePart.split(":");

  return { hours, minutes, seconds, ampm: ampmPart };
};

export default function OdometerClock() {
  const [mounted, setMounted] = useState(false);
  const [timeData, setTimeData] = useState<ParsedTime | null>(null);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      setTimeData(getKolkataTime());
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !timeData) {
    return <span className="odometer-fallback">--:--:-- --</span>;
  }

  const { hours, minutes, seconds, ampm } = timeData;
  const fullText = `${hours}:${minutes}:${seconds} ${ampm}`;

  return (
    <span className="odometer-container" aria-label={`Current time: ${fullText}`}>
      <span className="sr-only">{fullText}</span>

      {/* Visual Reel with pixel-perfect optical alignment */}
      <span className="odometer-reel" aria-hidden="true">
        {/* Hours digits */}
        {hours.split("").map((d, idx) => (
          <OdometerDigit key={`h-${hours.length - 1 - idx}`} char={d} />
        ))}

        <span className="odometer-colon">:</span>

        {/* Minutes digits */}
        {minutes.split("").map((d, idx) => (
          <OdometerDigit key={`m-${idx}`} char={d} />
        ))}

        <span className="odometer-colon">:</span>

        {/* Seconds digits (rolls every second) */}
        {seconds.split("").map((d, idx) => (
          <OdometerDigit key={`s-${idx}`} char={d} />
        ))}

        {/* Space and AM/PM */}
        <span className="odometer-ampm">{ampm}</span>
      </span>
    </span>
  );
}
