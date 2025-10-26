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

export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;

  // Reservations
  getReservations(): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByLivreur(livreurId: number): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<string, Category>;
  private menuItems: Map<string, MenuItem>;
  private reservations: Map<string, Reservation>;
  private orders: Map<string, Order>;
  private userIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.menuItems = new Map();
    this.reservations = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;

    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const bcrypt = await import('bcryptjs');

    // Create default test users
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
    this.userIdCounter = 2; // Start from 2 for new users

    const categoriesData = [
      {
        id: "crepe",
        name: "Crêpe",
        description: "Délicieuses crêpes artisanales" as string | null,
        order: 1,
      },
      {
        id: "cheesecake",
        name: "Cheesecake",
        description: "Cheesecakes onctueux et savoureux" as string | null,
        order: 2,
      },
      {
        id: "donuts",
        name: "Donuts",
        description: "Donuts moelleux et gourmands" as string | null,
        order: 3,
      },
      {
        id: "mini-pancakes",
        name: "Mini-Pancakes",
        description: "Mini-pancakes délicieux" as string | null,
        order: 4,
      },
      {
        id: "fondant",
        name: "Fondant",
        description: "Fondants au chocolat fondant" as string | null,
        order: 5,
      },
      {
        id: "tiramisu",
        name: "Tiramisu",
        description: "Tiramisu traditionnel et créatif" as string | null,
        order: 6,
      },
      {
        id: "boissons-fraiches",
        name: "Boissons Fraîches",
        description: "Jus de fruits frais" as string | null,
        order: 7,
      },
      {
        id: "boissons-chaudes",
        name: "Boissons Chaudes",
        description: "Café, thé et boissons chaudes" as string | null,
        order: 8,
      },
    ];

    categoriesData.forEach(category => {
      const cat: Category = {
        id: category.id,
        name: category.name,
        description: category.description ?? null,
        order: category.order,
      };
      this.categories.set(cat.id, cat);
    });

    const menuItemsData = [
      { id: randomUUID(), name: "Guermeche", description: "Crêpe Guermeche", price: "250", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Chocolat", description: "Crêpe au chocolat", price: "250", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Pistache", description: "Crêpe à la pistache", price: "250", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/pistachio_dessert_dc6583a5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Nutela", description: "Crêpe au Nutella", price: "400", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/nutella_crepe_7c1c4a90.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Lotus", description: "Crêpe au Lotus", price: "400", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Kinder", description: "Crêpe au Kinder", price: "700", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Pasta", description: "Crêpe Pasta", price: "300", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Farsi", description: "Crêpe Farsi", price: "500", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Sushi", description: "Crêpe Sushi", price: "350", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Mordjan", description: "Crêpe Mordjan", price: "400", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Willy", description: "Crêpe Willy", price: "300", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Dubai", description: "Crêpe Dubai", price: "700", categoryId: "crepe", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },

      { id: randomUUID(), name: "Bueno", description: "Cheesecake Bueno", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Fraise", description: "Cheesecake à la fraise", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/strawberry_cheesecak_92bf98dd.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Citron", description: "Cheesecake au citron", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/lemon_cheesecake_833c0223.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Oreo", description: "Cheesecake Oreo", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/oreo_cheesecake_05dc81ae.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Lotus", description: "Cheesecake Lotus", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/lotus_biscoff_cheese_6b7d7de4.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Dubai", description: "Cheesecake Dubai", price: "600", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/pistachio_dessert_dc6583a5.jpg", available: true, popular: true },
      { id: randomUUID(), name: "San Sebastian", description: "Cheesecake San Sebastian", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/strawberry_cheesecak_92bf98dd.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Framboise", description: "Cheesecake à la framboise", price: "500", categoryId: "cheesecake", imageUrl: "/attached_assets/stock_images/strawberry_cheesecak_92bf98dd.jpg", available: true, popular: false },

      { id: randomUUID(), name: "Chocolat", description: "Donut au chocolat", price: "300", categoryId: "donuts", imageUrl: "/attached_assets/stock_images/chocolate_donut_b817abf3.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Miel-Caramel", description: "Donut miel-caramel", price: "300", categoryId: "donuts", imageUrl: "/attached_assets/stock_images/chocolate_donut_b817abf3.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Banane", description: "Donut à la banane", price: "400", categoryId: "donuts", imageUrl: "/attached_assets/stock_images/chocolate_donut_b817abf3.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Fruit", description: "Donut aux fruits", price: "450", categoryId: "donuts", imageUrl: "/attached_assets/stock_images/chocolate_donut_b817abf3.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Kinder", description: "Donut Kinder", price: "700", categoryId: "donuts", imageUrl: "/attached_assets/stock_images/chocolate_donut_b817abf3.jpg", available: true, popular: true },

      { id: randomUUID(), name: "Choco", description: "Mini-pancakes au chocolat", price: "300", categoryId: "mini-pancakes", imageUrl: "/attached_assets/stock_images/mini_pancakes_6dafaab1.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Miel-Caramel", description: "Mini-pancakes miel-caramel", price: "300", categoryId: "mini-pancakes", imageUrl: "/attached_assets/stock_images/mini_pancakes_6dafaab1.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Banane", description: "Mini-pancakes à la banane", price: "400", categoryId: "mini-pancakes", imageUrl: "/attached_assets/stock_images/mini_pancakes_6dafaab1.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Fruit", description: "Mini-pancakes aux fruits", price: "450", categoryId: "mini-pancakes", imageUrl: "/attached_assets/stock_images/mini_pancakes_6dafaab1.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Kinder", description: "Mini-pancakes Kinder", price: "700", categoryId: "mini-pancakes", imageUrl: "/attached_assets/stock_images/mini_pancakes_6dafaab1.jpg", available: true, popular: true },

      { id: randomUUID(), name: "Chocolat", description: "Fondant au chocolat", price: "500", categoryId: "fondant", imageUrl: "/attached_assets/generated_images/Chocolate_fondant_dessert_cd16ade4.png", available: true, popular: true },
      { id: randomUUID(), name: "Nutella", description: "Fondant au Nutella", price: "650", categoryId: "fondant", imageUrl: "/attached_assets/generated_images/Chocolate_fondant_dessert_cd16ade4.png", available: true, popular: true },
      { id: randomUUID(), name: "Au Noix", description: "Fondant aux noix", price: "650", categoryId: "fondant", imageUrl: "/attached_assets/generated_images/Chocolate_fondant_dessert_cd16ade4.png", available: true, popular: false },
      { id: randomUUID(), name: "Pistache", description: "Fondant à la pistache", price: "800", categoryId: "fondant", imageUrl: "/attached_assets/stock_images/pistachio_dessert_dc6583a5.jpg", available: true, popular: true },

      { id: randomUUID(), name: "Simple", description: "Tiramisu simple", price: "300", categoryId: "tiramisu", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Banane", description: "Tiramisu à la banane", price: "400", categoryId: "tiramisu", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Fruit", description: "Tiramisu aux fruits", price: "450", categoryId: "tiramisu", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Kinder", description: "Tiramisu Kinder", price: "700", categoryId: "tiramisu", imageUrl: "/attached_assets/stock_images/chocolate_crepe_dess_6be21cf5.jpg", available: true, popular: true },

      { id: randomUUID(), name: "Jus Banane", description: "Jus de banane frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Jus Orange", description: "Jus d'orange frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Jus Fraise", description: "Jus de fraise frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/strawberry_juice_smo_afc83593.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Jus Kiwi", description: "Jus de kiwi frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Jus Citron", description: "Jus de citron frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Jus Pêche", description: "Jus de pêche frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Jus Grenadine", description: "Jus de grenadine frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/strawberry_juice_smo_afc83593.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Jus Cocktail", description: "Jus cocktail de fruits", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Jus Ananas", description: "Jus d'ananas frais", price: "300", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/orange_juice_glass_9aef8a57.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Pink Lady", description: "Pink Lady", price: "450", categoryId: "boissons-fraiches", imageUrl: "/attached_assets/stock_images/strawberry_juice_smo_afc83593.jpg", available: true, popular: true },

      { id: randomUUID(), name: "Café", description: "Café", price: "150", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Café au Lait", description: "Café au lait", price: "200", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Café Days", description: "Café Days", price: "150", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Thé Citron", description: "Thé au citron", price: "150", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Thé Pomme", description: "Thé à la pomme", price: "150", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Nescafé", description: "Nescafé", price: "150", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Lipton", description: "Lipton", price: "150", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Choco Chaud", description: "Chocolat chaud", price: "300", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: true },
      { id: randomUUID(), name: "Lavazza", description: "Café Lavazza", price: "200", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Lof", description: "Lof", price: "200", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: false },
      { id: randomUUID(), name: "Espresso", description: "Espresso", price: "200", categoryId: "boissons-chaudes", imageUrl: "/attached_assets/stock_images/coffee_cup_latte_8d49a53a.jpg", available: true, popular: true },
    ];

    menuItemsData.forEach(item => {
      const menuItem: MenuItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        deliveryFee: "0",
        categoryId: item.categoryId,
        imageUrl: item.imageUrl ?? null,
        available: item.available,
        popular: item.popular,
      };
      this.menuItems.set(menuItem.id, menuItem);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = insertCategory.name.toLowerCase().replace(/\s+/g, '-');
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      order: insertCategory.order ?? 0,
    };
    this.categories.set(id, category);
    return category;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
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
    this.menuItems.set(id, item);
    return item;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const item = this.menuItems.get(id);
    if (!item) return false;
    
    this.menuItems.delete(id);
    return true;
  }

  async updateMenuItem(id: string, updates: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (!item) return undefined;

    const normalizedUpdates: Partial<MenuItem> = {
      ...updates,
      price: updates.price !== undefined 
        ? (typeof updates.price === 'number' ? updates.price.toString() : updates.price)
        : undefined,
      deliveryFee: updates.deliveryFee !== undefined
        ? (typeof updates.deliveryFee === 'number' ? updates.deliveryFee.toString() : updates.deliveryFee)
        : undefined,
    };

    const updatedItem = { ...item, ...normalizedUpdates };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async getReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
    this.reservations.set(id, reservation);
    return reservation;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrdersByLivreur(livreurId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.livreurId === livreurId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPendingOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "client",
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
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const storage = new MemStorage();