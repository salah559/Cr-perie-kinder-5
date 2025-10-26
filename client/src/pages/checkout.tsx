import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { customerOrderSchema, type CustomerOrder, type OrderItem } from "@shared/cart-types";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { createFirebaseOrder } from "@/lib/firebase-orders";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryFee] = useState(200); // 200 DZD delivery fee
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setGoogleUser(user);
        const names = user.displayName?.split(' ') || ['', ''];
        form.setValue('firstName', names[0] || '');
        form.setValue('lastName', names.slice(1).join(' ') || '');
        form.setValue('email', user.email || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoadingAuth(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Signed in successfully!",
        description: "Your information has been pre-filled.",
      });
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingAuth(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "Location captured",
            description: "Your location has been saved for delivery.",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enter your address manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const form = useForm<CustomerOrder>({
    resolver: zodResolver(customerOrderSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      preferredTime: "",
      deliveryAddress: "",
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: CustomerOrder) => {
      const orderItems = items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const finalTotal = deliveryType === 'delivery' ? totalPrice + deliveryFee : totalPrice;

      // Create order in Firebase
      const firebaseOrderData: any = {
        customerFirstName: data.firstName,
        customerLastName: data.lastName,
        customerEmail: data.email,
        customerPhone: data.phone,
        items: orderItems,
        totalAmount: finalTotal.toString(),
        deliveryFee: deliveryType === 'delivery' ? deliveryFee.toString() : '0',
        deliveryType,
        status: 'pending' as const,
      };

      // Only add location if delivery type is delivery AND address exists
      if (deliveryType === 'delivery' && data.deliveryAddress) {
        firebaseOrderData.location = {
          address: data.deliveryAddress,
        };
        // Only add coordinates if they exist
        if (userLocation) {
          firebaseOrderData.location.coordinates = userLocation;
        }
      }

      // Only add notes if they exist
      if (data.message) {
        firebaseOrderData.notes = data.message;
      }

      // Only add preferredTime if it exists
      if (data.preferredTime) {
        firebaseOrderData.preferredTime = data.preferredTime;
      }

      await createFirebaseOrder(firebaseOrderData);

      // Also save to PostgreSQL for backup
      const orderData = {
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        customerPhone: data.phone,
        items: JSON.stringify(orderItems),
        totalAmount: finalTotal.toString(),
        orderType: deliveryType,
        deliveryAddress: data.deliveryAddress,
        notes: data.message 
          ? `${data.message}${data.preferredTime ? `\n\nPreferred Time: ${data.preferredTime}` : ''}`
          : data.preferredTime 
            ? `Preferred Time: ${data.preferredTime}` 
            : undefined,
      };

      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      setOrderSuccess(true);
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. We will contact you shortly to confirm.",
      });
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerOrder) => {
    createOrder.mutate(data);
  };

  if (items.length === 0 && !orderSuccess) {
    setLocation("/cart");
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 py-20 md:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 text-center">
            <CheckCircle2 className="w-24 h-24 mx-auto text-green-500 mb-6" />
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Thank you for your order. We've received your request and will contact you shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to home page...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>
                    Please provide your contact details so we can process your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!googleUser && (
                    <div className="mb-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={loadingAuth}
                        className="w-full"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        {loadingAuth ? 'Signing in...' : 'Sign in with Google'}
                      </Button>
                      <Separator className="my-4" />
                    </div>
                  )}

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <Label>Delivery Type</Label>
                        <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as any)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <Label htmlFor="pickup">Pickup (Free)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="delivery" id="delivery" />
                            <Label htmlFor="delivery">Delivery (+{deliveryFee} DZD)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  {...field} 
                                  data-testid="input-firstname"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Doe" 
                                  {...field} 
                                  data-testid="input-lastname"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                {...field} 
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="+213 XXX XXX XXX" 
                                {...field} 
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {deliveryType === 'delivery' && (
                        <>
                          <FormField
                            control={form.control}
                            name="deliveryAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Address *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter your full delivery address"
                                    className="min-h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            className="w-full"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            {userLocation ? 'Location Captured ✓' : 'Capture My Location'}
                          </Button>
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Time (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                placeholder="e.g., Today at 3 PM, Tomorrow morning" 
                                {...field} 
                                data-testid="input-preferred-time"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special requests or dietary requirements?" 
                                className="min-h-24"
                                {...field} 
                                data-testid="input-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={createOrder.isPending}
                        data-testid="button-place-order"
                      >
                        {createOrder.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          `Place Order - ${(deliveryType === 'delivery' ? totalPrice + deliveryFee : totalPrice).toFixed(2)} DZD`
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(parseFloat(item.price) * item.quantity).toFixed(2)} DZD
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {deliveryType === 'delivery' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{totalPrice.toFixed(2)} DZD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className="font-medium">{deliveryFee.toFixed(2)} DZD</span>
                      </div>
                      <Separator className="my-2" />
                    </>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary" data-testid="text-checkout-total">
                      {(deliveryType === 'delivery' ? totalPrice + deliveryFee : totalPrice).toFixed(2)} DZD
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
