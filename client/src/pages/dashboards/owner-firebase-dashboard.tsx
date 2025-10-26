
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { subscribeToOrders, updateFirebaseOrderStatus, type FirebaseOrder } from '@/lib/firebase-orders';
import { CheckCircle2, XCircle, Clock, Package, MapPin, Phone, Mail, User } from 'lucide-react';

export default function OwnerFirebaseDashboard() {
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
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard - Firebase Live Orders</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{orders.length}</CardTitle>
              <CardDescription>Total Orders</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-600">{pendingOrders.length}</CardTitle>
              <CardDescription>Pending Orders</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">{confirmedOrders.length}</CardTitle>
              <CardDescription>Confirmed Orders</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{totalRevenue.toFixed(2)} DZD</CardTitle>
              <CardDescription>Total Revenue</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders (Real-time)</CardTitle>
            <CardDescription>Orders update automatically via Firebase</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className={`${
                    order.status === 'pending' ? 'border-yellow-300 bg-yellow-50/50' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-bold text-lg">
                              {order.customerFirstName} {order.customerLastName}
                            </h3>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{order.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{order.customerEmail}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'confirmed' ? 'default' :
                          order.status === 'refused' ? 'destructive' :
                          'outline'
                        }>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="border-t pt-4 mb-4">
                        <h4 className="font-semibold mb-2">Order Summary</h4>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span>{(parseFloat(item.price) * item.quantity).toFixed(2)} DZD</span>
                            </div>
                          ))}
                          {order.deliveryType === 'delivery' && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Delivery Fee</span>
                              <span>{order.deliveryFee} DZD</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span>{order.totalAmount} DZD</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 mb-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <span className="font-semibold">Type: </span>
                            <span className="capitalize">{order.deliveryType}</span>
                          </div>
                        </div>

                        {order.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="font-semibold">Delivery Address: </span>
                              <p className="text-sm">{order.location.address}</p>
                              {order.location.coordinates && (
                                <p className="text-xs text-muted-foreground">
                                  Coordinates: {order.location.coordinates.lat.toFixed(6)}, {order.location.coordinates.lng.toFixed(6)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {order.preferredTime && (
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <span className="font-semibold">Preferred Time: </span>
                              <span>{order.preferredTime}</span>
                            </div>
                          </div>
                        )}

                        {order.notes && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-semibold mb-1">Customer Notes:</p>
                            <p className="text-sm">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mb-4">
                        Order placed: {order.createdAt.toDate().toLocaleString()}
                      </div>

                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOrderAction(order.id!, 'confirmed')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Order
                          </Button>
                          <Button
                            onClick={() => handleOrderAction(order.id!, 'refused')}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline Order
                          </Button>
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <Button
                          onClick={() => handleOrderAction(order.id!, 'delivered')}
                          className="w-full"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
