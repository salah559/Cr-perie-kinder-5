import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import heroImage from "@assets/generated_images/Elegant_dessert_crepe_plating_aa7d0cbd.png";
import logoImage from "@assets/Screenshot_20251020_093011_Instagram_1761476085089.jpg";
import kinderCrepe from "@assets/generated_images/Kinder_crepe_product_photo_7c9a3fe6.png";

export function HeroSection() {
  const { t, dir } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Elegant French crepe with strawberries and cream"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        {/* Animated Crepe Background */}
        <div className="animated-crepe-bg">
          <div className="crepe-circle crepe-circle-1"></div>
          <div className="crepe-circle crepe-circle-2"></div>
          <div className="crepe-circle crepe-circle-3"></div>
        </div>
        {/* Subtle Kinder Accent */}
        <div className="absolute bottom-32 right-16 opacity-10 animate-pulse hidden lg:block" style={{ animationDelay: '1.5s' }}>
          <img src={kinderCrepe} alt="" className="w-28 h-28 rounded-full object-cover blur-sm" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-32 md:py-40 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white overflow-hidden rotate-smooth" style={{
            boxShadow: '0 0 30px rgba(220, 38, 38, 0.4), 0 0 60px rgba(220, 38, 38, 0.2), 0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <img
              src={logoImage}
              alt="Crêperie Kinder 5 Logo"
              className="w-full h-full object-cover scale-150"
              data-testid="img-logo"
            />
          </div>
        </div>

        <div className="marquee-container mb-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-full overflow-hidden" data-testid="marquee-tagline">
          <div className="marquee-content">
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
            <span className="marquee-item">Imagine it, We Make it</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {t("hero.welcome")}
          <br />
          {t("hero.title")}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          {t("hero.description")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/menu">
            <Button
              size="lg"
              className="text-base px-8 py-6"
              data-testid="button-view-menu"
            >
              {t("hero.viewMenu")}
            </Button>
          </Link>
          <Link href="/reservations">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20"
              data-testid="button-reserve-table"
            >
              {t("hero.reserveTable")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}