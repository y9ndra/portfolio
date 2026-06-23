"use client";

import Hero           from "@/components/Hero";
import Skills         from "@/components/Skills";
import Experience     from "@/components/Experience";
import Projects       from "@/components/Projects";
import Contact        from "@/components/Contact";
import Footer         from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";


export default function Home() {
  useScrollReveal();

  return (
    <>
      <main style={{ position: "relative", zIndex: 1 }}>
        
        {/* Hero / About combined */}
        <Hero />


        {/* Work Experience */}
        <Experience />

        {/* Skills */}
        <Skills />

        {/* Projects */}
        <Projects />

        {/* Contact */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
