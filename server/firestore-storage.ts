import {
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type Reservation,
  type InsertReservation,
  type Order,
  type InsertOrder,
  type User,
  type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import type { IStorage } from "./storage";

export class FirestoreStorage implements IStorage {
  private users: Map<number, User>;
  private userIdCounter: number;

  constructor() {
    this.users = new Map();
    this.userIdCounter = 1;
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const bcrypt = await import('bcryptjs');

    // Create default test users (kept in memory for now)
    const defaultUsers = [
      {
        id: 1,
        email: 'test@test.com',
        password: bcrypt.hashSync('password123', 10),
        name: 'Test User',
        phone: null,
        role: 'client' as const,
        active: true,
        createdAt: new Date(),
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    this.userIdCounter = 2;

    // Initialize default categories in Firestore
    await this.initializeCategories();
  }

  private async initializeCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      // Only initialize if categories don't exist
      if (snapshot.empty) {
        console.log('🔄 تهيئة الفئات الافتراضية في Firestore...');
        
        const categoriesData = [
          { id: "crepe", name: "Crêpe", description: "Délicieuses crêpes artisanales", order: 1 },
          { id: "cheesecake", name: "Cheesecake", description: "Cheesecakes onctueux et savoureux", order: 2 },
          { id: "donuts", name: "Donuts", description: "Donuts moelleux et gourmands", order: 3 },
          { id: "mini-pancakes", name: "Mini-Pancakes", description: "Mini-pancakes délicieux", order: 4 },
          { id: "fondant", name: "Fondant", description: "Fondants au chocolat fondant", order: 5 },
          { id: "tiramisu", name: "Tiramisu", description: "Tiramisu traditionnel et créatif", order: 6 },
          { id: "boissons-fraiches", name: "Boissons Fraîches", description: "Jus de fruits frais", order: 7 },
          { id: "boissons-chaudes", name: "Boissons Chaudes", description: "Café, thé et boissons chaudes", order: 8 },
        ];

        for (const category of categoriesData) {
          await setDoc(doc(db, 'categories', category.id), category);
        }
        
        console.log('✅ تم تهيئة الفئات في Firestore بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في تهيئة الفئات:', error);
    }
  }

  // ============ USER METHODS (Kept in Memory) ============
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? 'client',
      active: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // ============ CATEGORY METHODS (Firestore) ============

  async getCategories(): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
    } catch (error) {
      console.error('Error fetching categories from Firestore:', error);
      return [];
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = insertCategory.name.toLowerCase().replace(/\s+/g, '-');
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      order: insertCategory.order ?? 0,
    };
    
    await setDoc(doc(db, 'categories', id), category);
    return category;
  }

  // ============ MENU ITEMS METHODS (Firestore) ============

  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const snapshot = await getDocs(menuItemsRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          deliveryFee: data.deliveryFee || "0",
          categoryId: data.categoryId,
          imageUrl: data.imageUrl || null,
          available: data.available !== false,
          popular: data.popular || false,
        } as MenuItem;
      });
    } catch (error) {
      console.error('Error fetching menu items from Firestore:', error);
      return [];
    }
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    try {
      const docRef = doc(db, 'menuItems', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return undefined;
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        price: data.price,
        deliveryFee: data.deliveryFee || "0",
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || null,
        available: data.available !== false,
        popular: data.popular || false,
      } as MenuItem;
    } catch (error) {
      console.error('Error fetching menu item from Firestore:', error);
      return undefined;
    }
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const item: MenuItem = {
      id,
      name: insertItem.name,
      description: insertItem.description,
      price: typeof insertItem.price === 'number' ? insertItem.price.toString() : insertItem.price,
      deliveryFee: typeof insertItem.deliveryFee === 'number' ? insertItem.deliveryFee.toString() : (insertItem.deliveryFee ?? "0"),
      categoryId: insertItem.categoryId,
      imageUrl: insertItem.imageUrl ?? null,
      available: insertItem.available ?? true,
      popular: insertItem.popular ?? false,
    };
    
    await setDoc(doc(db, 'menuItems', id), item);
    return item;
  }

  async updateMenuItem(id: string, updates: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const docRef = doc(db, 'menuItems', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return undefined;

      const normalizedUpdates: any = {
        ...updates,
        price: updates.price !== undefined 
          ? (typeof updates.price === 'number' ? updates.price.toString() : updates.price)
          : undefined,
        deliveryFee: updates.deliveryFee !== undefined
          ? (typeof updates.deliveryFee === 'number' ? updates.deliveryFee.toString() : updates.deliveryFee)
          : undefined,
      };

      // Remove undefined values
      Object.keys(normalizedUpdates).forEach(key => 
        normalizedUpdates[key] === undefined && delete normalizedUpdates[key]
      );

      await updateDoc(docRef, normalizedUpdates);
      
      // Return updated item
      return this.getMenuItem(id);
    } catch (error) {
      console.error('Error updating menu item in Firestore:', error);
      return undefined;
    }
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      return true;
    } catch (error) {
      console.error('Error deleting menu item from Firestore:', error);
      return false;
    }
  }

  // ============ RESERVATIONS METHODS (Firestore) ============

  async getReservations(): Promise<Reservation[]> {
    try {
      const reservationsRef = collection(db, 'reservations');
      const q = query(reservationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          date: data.date,
          time: data.time,
          partySize: data.partySize,
          specialRequests: data.specialRequests || null,
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        } as Reservation;
      });
    } catch (error) {
      console.error('Error fetching reservations from Firestore:', error);
      return [];
    }
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = randomUUID();
    const reservation: Reservation = {
      id,
      name: insertReservation.name,
      email: insertReservation.email,
      phone: insertReservation.phone,
      date: insertReservation.date,
      time: insertReservation.time,
      partySize: insertReservation.partySize,
      specialRequests: insertReservation.specialRequests ?? null,
      status: "pending",
      createdAt: new Date(),
    };
    
    // Convert Date to Firestore Timestamp
    const firestoreData = {
      ...reservation,
      createdAt: Timestamp.fromDate(reservation.createdAt)
    };
    
    await setDoc(doc(db, 'reservations', id), firestoreData);
    return reservation;
  }

  // ============ ORDERS METHODS (Firestore) ============

  async getOrders(): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || null,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: data.items,
          totalAmount: data.totalAmount,
          orderType: data.orderType,
          deliveryAddress: data.deliveryAddress || null,
          notes: data.notes || null,
          status: data.status || "pending",
          livreurId: data.livreurId || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Order;
      });
    } catch (error) {
      console.error('Error fetching orders from Firestore:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return undefined;
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        items: data.items,
        totalAmount: data.totalAmount,
        orderType: data.orderType,
        deliveryAddress: data.deliveryAddress || null,
        notes: data.notes || null,
        status: data.status || "pending",
        livreurId: data.livreurId || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as Order;
    } catch (error) {
      console.error('Error fetching order from Firestore:', error);
      return undefined;
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      id,
      userId: insertOrder.userId ?? null,
      customerName: insertOrder.customerName,
      customerEmail: insertOrder.customerEmail,
      customerPhone: insertOrder.customerPhone,
      items: insertOrder.items,
      totalAmount: insertOrder.totalAmount,
      orderType: insertOrder.orderType,
      deliveryAddress: insertOrder.deliveryAddress ?? null,
      notes: insertOrder.notes ?? null,
      status: "pending",
      livreurId: insertOrder.livreurId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    
    // Convert Dates to Firestore Timestamps
    const firestoreData = {
      ...order,
      createdAt: Timestamp.fromDate(order.createdAt),
      updatedAt: Timestamp.fromDate(order.updatedAt)
    };
    
    await setDoc(doc(db, 'orders', id), firestoreData);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return undefined;

      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await updateDoc(docRef, updateData);
      
      // Return updated order
      return this.getOrder(id);
    } catch (error) {
      console.error('Error updating order in Firestore:', error);
      return undefined;
    }
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: data.items,
          totalAmount: data.totalAmount,
          orderType: data.orderType,
          deliveryAddress: data.deliveryAddress || null,
          notes: data.notes || null,
          status: data.status,
          livreurId: data.livreurId || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Order;
      });
    } catch (error) {
      console.error('Error fetching user orders from Firestore:', error);
      return [];
    }
  }

  async getOrdersByLivreur(livreurId: number): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('livreurId', '==', livreurId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || null,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: data.items,
          totalAmount: data.totalAmount,
          orderType: data.orderType,
          deliveryAddress: data.deliveryAddress || null,
          notes: data.notes || null,
          status: data.status,
          livreurId: data.livreurId,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Order;
      });
    } catch (error) {
      console.error('Error fetching livreur orders from Firestore:', error);
      return [];
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || null,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: data.items,
          totalAmount: data.totalAmount,
          orderType: data.orderType,
          deliveryAddress: data.deliveryAddress || null,
          notes: data.notes || null,
          status: data.status,
          livreurId: data.livreurId || null,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Order;
      });
    } catch (error) {
      console.error('Error fetching pending orders from Firestore:', error);
      return [];
    }
  }
}
