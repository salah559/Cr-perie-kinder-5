import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function ContactPage() {
  const hours = [
    { day: "Monday - Thursday", time: "11:00 AM - 9:00 PM" },
    { day: "Friday - Saturday", time: "11:00 AM - 10:00 PM" },
    { day: "Sunday", time: "10:00 AM - 8:00 PM" },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "Crêperie Kinder 5, Algeria",
      action: "Get Directions",
      link: "https://maps.app.goo.gl/q2Fzgr1BJifGT5A88",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+213 XX XX XX XX",
      action: "Call Us",
      link: "tel:+213XXXXXXXX",
    },
    {
      icon: Mail,
      title: "Email",
      content: "contact@kinder5.dz",
      action: "Send Email",
      link: "mailto:contact@kinder5.dz",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-contact">
              Visit Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Contact & Location
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Come visit us and experience authentic Algerian crêpes in a warm,
              welcoming atmosphere
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hours.map((schedule) => (
                    <div
                      key={schedule.day}
                      className="flex justify-between items-center py-3 border-b last:border-0"
                      data-testid={`hours-${schedule.day.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className="font-medium">{schedule.day}</span>
                      <span className="text-muted-foreground">{schedule.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.title} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <info.icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="font-medium mb-1">{info.title}</h2>
                        <p className="text-muted-foreground mb-2">{info.content}</p>
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                          data-testid={`button-${info.title.toLowerCase()}`}
                        >
                          {info.action}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
