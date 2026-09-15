import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Narration from "@/components/Narration";
import Approach from "@/components/Approach";
import Portfolio from "@/components/Portfolio";
import Planner from "@/components/Planner";
import Team from "@/components/Team";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingPlanner from "@/components/FloatingPlanner";

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Narration />
      <Approach />
      <Portfolio />
      <Planner />
      <Team />
      <Process />
      <Contact />
      <Footer />
      <FloatingPlanner />
    </main>
  );
}
