"use client";

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Documentation } from "./components/Documentation";
import { TechStack } from "./components/TechStack";
import { Comparison } from "./components/Comparison";
import { Roadmap } from "./components/Roadmap";
import { Scripts } from "./components/Scripts";
import { Footer } from "./components/Footer";

function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <TechStack />
        <Documentation />
        <Comparison />
        <Roadmap />
        <Scripts />
      </main>
      <Footer />
    </div>
  );
}

export { Homepage };
