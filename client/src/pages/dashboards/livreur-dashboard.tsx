
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { subscribeToOrders, updateFirebaseOrderStatus, type FirebaseOrder } from '@/lib/firebase-orders';
import { CheckCircle2, Package, MapPin, Phone, Mail, User, Clock } from 'lucide-react';

export default function LivreurDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOrderAction = async (orderId: string, status: FirebaseOrder['status']) => {
    try {
      await updateFirebaseOrderStatus(orderId, status);
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const myDeliveries = orders.filter(o => o.status === 'confirmed' || o.status === 'delivered');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Delivery Dashboard - Live Orders</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{pendingOrders.length}</CardTitle>
              <CardDescription>Available for Pickup</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{confirmedOrders.length}</CardTitle>
              <CardDescription>Active Deliveries</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Available Orders</CardTitle>
              <CardDescription>Orders ready for delivery</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Loading orders...</p>
              ) : pendingOrders.length === 0 ? (
                <p className="text-center text-muted-foreground">No pending orders</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="border-yellow-300 bg-yellow-50/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="font-bold">
                              {order.customerFirstName} {order.customerLastName}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p>{order.customerPhone}</p>
                          </div>

                          {order.location && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                              <p className="flex-1">{order.location.address}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <p className="capitalize">{order.deliveryType}</p>
                          </div>

                          {order.preferredTime && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <p>Preferred time: {order.preferredTime}</p>
                            </div>
                          )}

                          <div className="pt-2">
                            <p className="font-bold text-lg text-primary">
                              {order.totalAmount} DZD
                            </p>
                          </div>

                          <div className="border-t pt-3 space-y-1">
                            <p className="font-semibold text-sm">Items:</p>
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">
                                {item.quantity}x {item.name} - {item.price} DZD
                              </p>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="border-t pt-3">
                              <p className="text-sm font-semibold">Notes:</p>
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          )}

                          <Button
                            onClick={() => handleOrderAction(order.id!, 'confirmed')}
                            className="w-full mt-3"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept Delivery
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle>My Deliveries</CardTitle>
              <CardDescription>Orders you've accepted for delivery</CardDescription>
            </CardHeader>
            <CardContent>
              {myDeliveries.length === 0 ? (
                <p className="text-center text-muted-foreground">No confirmed deliveries yet</p>
              ) : (
                <div className="space-y-4">
                  {myDeliveries.map((order) => (
                    <Card key={order.id} className={
                      order.status === 'delivered' ? 'border-blue-300 bg-blue-50/50' : 'border-green-300 bg-green-50/50'
                    }>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <p className="font-bold">
                                {order.customerFirstName} {order.customerLastName}
                              </p>
                            </div>
                            <Badge className={
                              order.status === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }>
                              {order.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p>{order.customerPhone}</p>
                          </div>

                          {order.location && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                              <p className="flex-1">{order.location.address}</p>
                            </div>
                          )}

                          <div className="pt-2">
                            <p className="font-bold text-lg text-primary">
                              {order.totalAmount} DZD
                            </p>
                          </div>

                          <div className="border-t pt-3 space-y-1">
                            <p className="font-semibold text-sm">Items:</p>
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </div>

                          {order.status === 'confirmed' && (
                            <Button
                              onClick={() => handleOrderAction(order.id!, 'delivered')}
                              className="w-full mt-3"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
