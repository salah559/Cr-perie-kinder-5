import { useLanguage } from "@/contexts/language-context";
import { Card } from "@/components/ui/card";

export function KinderShowcase() {
  const { t, dir } = useLanguage();

  return (
    <section dir={dir} className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            {t("kinder.title") || "Kinder Surprise Experience"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("kinder.description") || "Discover our signature Kinder creations with premium ingredients!"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg shadow-lg border">
                <h3 className="text-2xl font-bold mb-3">🍫 Crêpe Kinder 5</h3>
                <p className="text-muted-foreground mb-4">
                  {t("kinder.product1.description") || "Our signature Kinder crepe, filled with rich chocolate and topped with a surprise Kinder treat. Made fresh daily with premium ingredients."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">12.50 DT</span>
                  <span className="text-sm text-muted-foreground">⭐ 4.9/5</span>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-lg border">
                <h3 className="text-xl font-bold mb-3">✨ {t("kinder.features") || "What Makes It Special"}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t("kinder.feature1") || "Authentic Kinder chocolate"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t("kinder.feature2") || "Fresh handmade crepes"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t("kinder.feature3") || "Surprise Kinder egg topping"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t("kinder.feature4") || "Perfect for all ages"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2" data-testid="container-product-image">
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 shadow-2xl">
              <div className="w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center p-8">
                <img 
                  src="/attached_assets/generated_images/Kinder_crepe_product_photo_7c9a3fe6.png" 
                  alt="Kinder Crepe - Our signature chocolate crepe topped with Kinder treats"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            💡 {t("kinder.tip") || "Visit us today to experience this delightful treat!"}
          </p>
        </div>
      </div>
    </section>
  );
}
