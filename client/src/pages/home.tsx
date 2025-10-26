import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { CategoryCarousel } from "@/components/category-carousel";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <CategoryCarousel />
      </main>
      <Footer />
    </div>
  );
}
