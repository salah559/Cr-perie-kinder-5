import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, Plus, Info } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, Category } from "@shared/schema";

export function MenuSection() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const isLoading = categoriesLoading || itemsLoading;

  const getItemsByCategory = (categoryId: string) => {
    return menuItems?.filter((item) => item.categoryId === categoryId && item.available) || [];
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    setSelectedItem(null);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleViewDetails = (item: MenuItem) => {
    setSelectedItem(item);
  };

  return (
    <>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>Product Details</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {selectedItem.price} DZD
                  </span>
                  {selectedItem.popular && (
                    <Badge variant="secondary">Popular</Badge>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>
              <Button 
                onClick={() => handleAddToCart(selectedItem)}
                className="w-full"
                size="lg"
                data-testid={`button-add-cart-dialog-${selectedItem.id}`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <section id="menu" className="py-20 md:py-24 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4" data-testid="badge-menu">
            Our Menu
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Notre Menu
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Découvrez nos délicieuses crêpes, cheesecakes, donuts et boissons
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-48" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {categories?.map((category) => {
              const items = getItemsByCategory(category.id);
              if (items.length === 0) return null;

              return (
                <div key={category.id} data-testid={`category-${category.id}`}>
                  <h3 className="text-3xl font-semibold mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-muted-foreground mb-8 text-lg">
                      {category.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        className="hover-elevate transition-shadow overflow-hidden"
                        data-testid={`menu-item-${item.id}`}
                      >
                        {item.imageUrl && (
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              data-testid={`img-${item.id}`}
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2 flex items-center gap-2 flex-wrap">
                                {item.name}
                                {item.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-base leading-relaxed">
                                {item.description}
                              </CardDescription>
                            </div>
                            <span
                              className="text-xl font-bold text-primary whitespace-nowrap"
                              data-testid={`price-${item.id}`}
                            >
                              {item.price} DZD
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button 
                            onClick={() => handleViewDetails(item)}
                            className="w-full"
                            data-testid={`button-view-details-${item.id}`}
                          >
                            <Info className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
    </>
  );
}
