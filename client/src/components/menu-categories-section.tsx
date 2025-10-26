import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import type { MenuItem, Category } from "@shared/schema";

export function MenuCategoriesSection() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const isLoading = categoriesLoading || itemsLoading;

  const getCategoryImage = (categoryId: string) => {
    const item = menuItems?.find((item) => item.categoryId === categoryId && item.imageUrl);
    return item?.imageUrl;
  };

  const getCategoryItemCount = (categoryId: string) => {
    return menuItems?.filter((item) => item.categoryId === categoryId && item.available).length || 0;
  };

  return (
    <section className="py-20 md:py-24 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4" data-testid="badge-menu-categories">
            Discover Our Menu
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Our Menu Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our delicious selection of crêpes, desserts, and beverages
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories?.map((category) => {
                const itemCount = getCategoryItemCount(category.id);
                const imageUrl = getCategoryImage(category.id);
                
                if (itemCount === 0) return null;

                return (
                  <Card
                    key={category.id}
                    className="overflow-hidden hover-elevate transition-all group cursor-pointer"
                    data-testid={`category-card-${category.id}`}
                  >
                    <Link href="/menu">
                      <div className="relative">
                        {imageUrl ? (
                          <div className="aspect-video overflow-hidden bg-muted">
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              data-testid={`img-category-${category.id}`}
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <span className="text-4xl font-bold text-primary/20">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-muted-foreground leading-relaxed">
                            {category.description}
                          </p>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Link href="/menu">
                <Button size="lg" data-testid="button-view-full-menu">
                  View Full Menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
