import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddMenuItemDialog } from '@/components/add-menu-item-dialog';
import { AssetManager } from '@/components/asset-manager';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Edit, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToFirebase, deleteImageFromFirebase } from '@/lib/firebase-storage';

interface Order {
  id: string;
  customerName: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  deliveryFee: string;
  categoryId: string;
  imageUrl: string | null;
  available: boolean;
  popular: boolean;
}

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'livreur' as 'livreur' | 'owner'
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    deliveryFee: '',
    categoryId: '',
    available: true,
    popular: false,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, usersRes, menuItemsRes, categoriesRes] = await Promise.all([
        fetch('/api/orders', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' }),
        fetch('/api/menu-items'),
        fetch('/api/categories'),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (menuItemsRes.ok) {
        const menuItemsData = await menuItemsRes.json();
        setMenuItems(menuItemsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu item deleted successfully"
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete menu item",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      deliveryFee: item.deliveryFee,
      categoryId: item.categoryId,
      available: item.available,
      popular: item.popular,
    });
    setEditImageFile(null);
    setEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', editForm.name);
      formDataToSend.append('description', editForm.description);
      formDataToSend.append('price', editForm.price);
      formDataToSend.append('deliveryFee', editForm.deliveryFee);
      formDataToSend.append('categoryId', editForm.categoryId);
      formDataToSend.append('available', editForm.available.toString());
      formDataToSend.append('popular', editForm.popular.toString());

      if (editImageFile) {
        console.log('Uploading image file:', editImageFile.name, editImageFile.size, 'bytes');
        formDataToSend.append('image', editImageFile);
        console.log('FormData has image:', formDataToSend.has('image'));
      } else {
        console.log('No new image file selected');
      }

      console.log('Updating menu item:', editingItem.id);
      console.log('FormData keys:', Array.from(formDataToSend.keys()));

      const response = await fetch(`/api/menu-items/${editingItem.id}`, {
        method: 'PATCH',
        body: formDataToSend,
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        toast({
          title: "Success",
          description: editImageFile ? "Menu item and image updated successfully" : "Menu item updated successfully"
        });
        setEditDialogOpen(false);
        setEditingItem(null);
        setEditImageFile(null);
        fetchData();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
        toast({
          title: "Error",
          description: error.error || "Failed to update menu item",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive"
      });
    }
  };

  const createStaffUser = async () => {
    try {
      if (!staffForm.email || !staffForm.password || !staffForm.name) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/users/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(staffForm)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${staffForm.role === 'owner' ? 'Admin' : 'Delivery person'} created successfully`
        });
        setStaffDialogOpen(false);
        setStaffForm({
          email: '',
          password: '',
          name: '',
          phone: '',
          role: 'livreur'
        });
        fetchData();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="mt-4">Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{orders.length}</CardTitle>
              <CardDescription>Total Orders</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {orders.filter(o => o.status === 'pending').length}
              </CardTitle>
              <CardDescription>Pending Orders</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{users.length}</CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Manage all customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{order.totalAmount} DT</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'refused' ? 'bg-red-100 text-red-800' :
                          order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleOrderAction(order.id, 'confirmed')}
                          className="flex-1"
                          size="sm"
                        >
                          Confirm Order
                        </Button>
                        <Button
                          onClick={() => handleOrderAction(order.id, 'refused')}
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                        >
                          Decline Order
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Menu Items Management</CardTitle>
              <CardDescription>Manage your restaurant menu items</CardDescription>
            </div>
            <AddMenuItemDialog onSuccess={fetchData} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : menuItems.length === 0 ? (
              <p className="text-center text-muted-foreground">No menu items yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Image</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Delivery Fee</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-2">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-2">{item.price} DT</td>
                        <td className="p-2">{item.deliveryFee} DT</td>
                        <td className="p-2 capitalize">{item.categoryId}</td>
                        <td className="p-2">
                          <div className="flex gap-1 flex-wrap">
                            {item.available && (
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                            {item.popular && (
                              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                                Popular
                              </span>
                            )}
                            {!item.available && (
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-8">
          <AssetManager />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>All registered users</CardDescription>
            </div>
            <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Staff Account</DialogTitle>
                  <DialogDescription>
                    Add a new delivery person or admin to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="staff-role">Role *</Label>
                    <Select
                      value={staffForm.role}
                      onValueChange={(value: 'livreur' | 'owner') =>
                        setStaffForm({...staffForm, role: value})
                      }
                    >
                      <SelectTrigger id="staff-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="livreur">Delivery Person</SelectItem>
                        <SelectItem value="owner">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="staff-name">Name *</Label>
                    <Input
                      id="staff-name"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-email">Email *</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-password">Password *</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({...staffForm, password: e.target.value})}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff-phone">Phone</Label>
                    <Input
                      id="staff-phone"
                      type="tel"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                      placeholder="+213 555 000 000"
                    />
                  </div>
                  <Button onClick={createStaffUser} className="w-full">
                    Create {staffForm.role === 'owner' ? 'Admin' : 'Delivery Person'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground">No users yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'livreur' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the menu item details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Item Name *</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={editForm.categoryId}
                    onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (DT) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-deliveryFee">Delivery Fee (DT)</Label>
                  <Input
                    id="edit-deliveryFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.deliveryFee}
                    onChange={(e) => setEditForm({ ...editForm, deliveryFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Item Image</Label>
                {editingItem?.imageUrl && !editImageFile && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={editingItem.imageUrl}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Current image</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;

                        if (file) {
                          // Validate file
                          if (!file.type.startsWith('image/')) {
                            toast({
                              title: 'Invalid File',
                              description: 'Please select an image file',
                              variant: 'destructive',
                            });
                            e.target.value = '';
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: 'File Too Large',
                              description: 'Image must be less than 5MB',
                              variant: 'destructive',
                            });
                            e.target.value = '';
                            return;
                          }

                          setEditImageFile(file);
                          toast({
                            title: "Image Selected",
                            description: `${file.name} ready to upload`
                          });
                        } else {
                          setEditImageFile(null);
                        }
                      }}
                      className="flex-1"
                    />
                    {editImageFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditImageFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {editImageFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-600 font-bold">✓</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-green-700 font-medium truncate">
                          {editImageFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {Math.round(editImageFile.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Select a new image to replace the current one (Max 5MB)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-available"
                    checked={editForm.available}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, available: checked as boolean })
                    }
                  />
                  <Label htmlFor="edit-available" className="font-normal cursor-pointer">
                    Available for order
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-popular"
                    checked={editForm.popular}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, popular: checked as boolean })
                    }
                  />
                  <Label htmlFor="edit-popular" className="font-normal cursor-pointer">
                    Mark as popular item
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateItem} className="flex-1">
                  Update Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}