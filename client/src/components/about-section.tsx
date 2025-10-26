import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Heart, Sparkles } from "lucide-react";
import kitchenImage from "@assets/generated_images/Creperie_kitchen_interior_scene_f29ea8c4.png";

export function AboutSection() {
  const features = [
    {
      icon: ChefHat,
      title: "Traditional Recipes",
      description:
        "Authentic French techniques passed down through generations, ensuring every crêpe is perfect.",
    },
    {
      icon: Heart,
      title: "Fresh Ingredients",
      description:
        "We source the finest local and imported ingredients to create unforgettable flavors.",
    },
    {
      icon: Sparkles,
      title: "Made to Order",
      description:
        "Each crêpe is prepared fresh when you order, guaranteeing quality and taste.",
    },
  ];

  return (
    <section id="about" className="py-20 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <img
              src={kitchenImage}
              alt="Creperie kitchen with chef preparing fresh crepes"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-about"
            />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <Badge variant="secondary" className="mb-4" data-testid="badge-about">
              Our Story
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Bringing France to Your Table
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Since opening our doors, Crêperie Kinder 5 has been dedicated to
              bringing the authentic taste of France to our community. Our passion
              for traditional French cuisine drives us to create exceptional crêpes
              that transport you to the streets of Paris with every bite.
            </p>

            <div className="space-y-6">
              {features.map((feature) => (
                <Card key={feature.title} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
