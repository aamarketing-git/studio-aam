import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Narration from "@/components/Narration";
import Approach from "@/components/Approach";
import Portfolio from "@/components/Portfolio";
import FilmPortfolio from "@/components/FilmPortfolio";
import ShowroomThreeD from "@/components/ShowroomThreeD";
import Planner from "@/components/Planner";
import AiMarketingLab from "@/components/AiMarketingLab";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingPlanner from "@/components/FloatingPlanner";

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Portfolio />
      <FilmPortfolio />
      <ShowroomThreeD />
      <Narration />
      <Approach />
      <Planner />
      <AiMarketingLab />
      <Process />
      <Contact />
      <Footer />
      <FloatingPlanner />
    </main>
  );
}
