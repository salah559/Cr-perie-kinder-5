import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-primary text-primary-foreground mt-20">
      <div className="absolute top-0 left-0 w-full h-32 bg-background" style={{
        clipPath: 'ellipse(150% 100% at 50% 0%)'
      }}></div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Crêperie Kinder 5</h3>
            <p className="text-white/90 leading-relaxed">
              Authentic Algerian crêpes made with love and tradition. Experience
              the taste of Algeria in every bite.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {["Menu", "About", "Location", "Reservations"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => {
                      const element = document.getElementById(link.toLowerCase());
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-white/80 hover:text-white transition-colors hover-elevate rounded-md px-2 py-1 -ml-2"
                    data-testid={`footer-link-${link.toLowerCase()}`}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">123 Rue de Paris, City Center</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">hello@creperie-kinder5.fr</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Hours</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-white/80">
                <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p>Mon-Thu: 11am - 9pm</p>
                  <p>Fri-Sat: 11am - 10pm</p>
                  <p>Sunday: 10am - 8pm</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 text-center text-sm text-white/70">
          <p>
            © {currentYear} Crêperie Kinder 5. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
