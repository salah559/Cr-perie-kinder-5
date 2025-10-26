import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema, insertOrderSchema, insertMenuItemSchema } from "@shared/schema";
import authRouter, { requireAuth, requireRole } from "./auth";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from '@replit/object-storage';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'attached_assets', 'menu_images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.use("/api/auth", authRouter);

  // Configuration endpoint for frontend
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    });
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Menu items endpoints
  app.get("/api/menu-items", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Upload image to Object Storage
  app.post("/api/upload-image", requireRole("owner"), upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const client = new Client();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `menu-items/${timestamp}-${randomString}${fileExtension}`;

      // Upload to Object Storage
      await client.uploadFromBytes(fileName, new Uint8Array(fs.readFileSync(req.file.path)));

      // Generate URL (for now, we'll store the path and serve it later)
      const imageUrl = `/storage/${fileName}`;

      // Delete the temporary file if it exists
      if (req.file.path) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }

      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Serve images from Object Storage
  app.get("/storage/:folder/:filename", async (req, res) => {
    try {
      const client = new Client();
      const filePath = `${req.params.folder}/${req.params.filename}`;
      const result = await client.downloadAsBytes(filePath);

      if (!result.ok) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Determine content type from file extension
      const ext = path.extname(req.params.filename).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(result.value));
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  // Create menu item with image upload for owners
  app.post("/api/menu-items", requireRole("owner"), async (req, res) => {
    try {
      console.log('Received menu item creation request');
      console.log('Body:', req.body);

      const menuItemData = {
        ...req.body,
        available: req.body.available === 'true' || req.body.available === true,
        popular: req.body.popular === 'true' || req.body.popular === true,
      };

      console.log('Processed menu item data:', menuItemData);

      const validatedData = insertMenuItemSchema.parse(menuItemData);
      const menuItem = await storage.createMenuItem(validatedData);

      console.log('Menu item created successfully:', menuItem.id);
      res.status(201).json(menuItem);
    } catch (error: any) {
      console.error("Error creating menu item:", error);
      if (error.name === "ZodError") {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ error: "Invalid menu item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ error: "Failed to fetch menu item" });
    }
  });

  app.patch("/api/menu-items/:id", requireRole("owner"), upload.single('image'), async (req, res) => {
    try {
      console.log('Received menu item update request for ID:', req.params.id);
      console.log('File:', req.file);
      console.log('Body:', req.body);

      // Get the current menu item to check for existing image
      const currentItem = await storage.getMenuItem(req.params.id);
      if (!currentItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      const updates: any = {
        ...req.body,
        available: req.body.available === 'true' || req.body.available === true,
        popular: req.body.popular === 'true' || req.body.popular === true,
      };

      if (req.file) {
        // If a new image is uploaded, use the URL from the upload-image endpoint
        const client = new Client();
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `menu-items/${timestamp}-${randomString}${fileExtension}`;

        await client.uploadFromBytes(fileName, new Uint8Array(fs.readFileSync(req.file.path)));
        updates.imageUrl = `/storage/${fileName}`;

        // Delete the temporary file if it exists
        if (req.file.path) {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }

        console.log('New image URL:', updates.imageUrl);

        // Delete old image from Object Storage if it exists
        if (currentItem.imageUrl && currentItem.imageUrl.startsWith('/storage/')) {
          const oldFileName = currentItem.imageUrl.substring('/storage/'.length);
          try {
            await client.delete(oldFileName);
            console.log('Deleted old image from Object Storage:', oldFileName);
          } catch (deleteError) {
            console.error('Error deleting old image from Object Storage:', deleteError);
            // Continue with update even if deletion fails
          }
        }
      }

      console.log('Updates to apply:', updates);

      const updatedItem = await storage.updateMenuItem(req.params.id, updates);
      if (!updatedItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      console.log('Menu item updated successfully');
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", requireRole("owner"), async (req, res) => {
    try {
      // Get the menu item first to check for image
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      // Delete image file from Object Storage if it exists
      if (item.imageUrl && item.imageUrl.startsWith('/storage/')) {
        const client = new Client();
        const fileName = item.imageUrl.substring('/storage/'.length);
        try {
          await client.delete(fileName);
          console.log('Deleted image file from Object Storage:', fileName);
        } catch (deleteError) {
          console.error('Error deleting image file from Object Storage:', deleteError);
          // Continue with menu item deletion even if file deletion fails
        }
      }

      const deleted = await storage.deleteMenuItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  app.delete("/api/menu-items/:id/image", requireRole("owner"), async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      // Delete image file from Object Storage if it exists
      if (item.imageUrl && item.imageUrl.startsWith('/storage/')) {
        const client = new Client();
        const fileName = item.imageUrl.substring('/storage/'.length);
        try {
          await client.delete(fileName);
          console.log('Deleted image file from Object Storage:', fileName);
        } catch (deleteError) {
          console.error('Error deleting image file from Object Storage:', deleteError);
          // Continue with database update even if file deletion fails
        }
      }

      // Remove image reference from database
      const updatedItem = await storage.updateMenuItem(req.params.id, { imageUrl: null });

      res.json({ success: true, item: updatedItem });
    } catch (error) {
      console.error("Error removing menu item image:", error);
      res.status(500).json({ error: "Failed to remove menu item image" });
    }
  });

  // Asset management endpoints for admins
  app.get("/api/assets", requireRole("owner"), async (req, res) => {
    try {
      const assetsDir = path.join(__dirname, '..', 'attached_assets');

      const assetCategories = {
        logo_files: [] as string[],
        generated_images: [] as string[],
        stock_images: [] as string[]
      };

      // Read root assets directory for logo files (jpg, png files)
      if (fs.existsSync(assetsDir)) {
        const rootFiles = fs.readdirSync(assetsDir);
        assetCategories.logo_files = rootFiles.filter(file => {
          const ext = file.toLowerCase();
          return (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')) && 
                 !fs.statSync(path.join(assetsDir, file)).isDirectory();
        });
      }

      // Read generated_images folder
      const generatedPath = path.join(assetsDir, 'generated_images');
      if (fs.existsSync(generatedPath)) {
        const files = fs.readdirSync(generatedPath);
        assetCategories.generated_images = files;
      }

      // Read stock_images folder
      const stockPath = path.join(assetsDir, 'stock_images');
      if (fs.existsSync(stockPath)) {
        const files = fs.readdirSync(stockPath);
        assetCategories.stock_images = files;
      }

      res.json(assetCategories);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  // Replace specific asset file
  app.post("/api/assets/replace", requireRole("owner"), upload.single('image'), async (req, res) => {
    try {
      const { targetFile, category } = req.body;
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No image file provided" });
      }

      if (!targetFile) {
        return res.status(400).json({ error: "Target file not specified" });
      }

      let targetPath: string;

      // Determine the target path based on category
      if (category === 'logo') {
        targetPath = path.join(__dirname, '..', 'attached_assets', targetFile);
      } else if (category === 'generated_images' || category === 'stock_images') {
        targetPath = path.join(__dirname, '..', 'attached_assets', category, targetFile);
      } else {
        return res.status(400).json({ error: "Invalid category" });
      }

      // Delete the old file if it exists
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        console.log('Deleted old asset file:', targetPath);
      }

      // Move the uploaded file to replace the target
      const uploadedPath = uploadedFile.path;
      fs.renameSync(uploadedPath, targetPath);
      console.log('Replaced asset file:', targetPath);

      res.json({ 
        success: true, 
        message: 'Asset replaced successfully',
        file: targetFile
      });
    } catch (error) {
      console.error("Error replacing asset:", error);
      res.status(500).json({ error: "Failed to replace asset" });
    }
  });

  // Reservations endpoints
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const validatedData = insertReservationSchema.parse(req.body);
      const reservation = await storage.createReservation(validatedData);
      res.status(201).json(reservation);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid reservation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  // Orders endpoints
  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let orders;
      if (user.role === "owner") {
        // Owner sees all orders
        orders = await storage.getOrders();
      } else if (user.role === "livreur") {
        // Livreur sees pending orders + their assigned orders
        const pendingOrders = await storage.getPendingOrders();
        const assignedOrders = await storage.getOrdersByLivreur(user.id);

        // Combine and remove duplicates
        const orderMap = new Map();
        [...pendingOrders, ...assignedOrders].forEach(order => {
          orderMap.set(order.id, order);
        });
        orders = Array.from(orderMap.values());
      } else {
        orders = await storage.getOrdersByUser(user.id);
      }

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        userId: userId || null,
      });
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (user.role === "livreur" || user.role === "owner") {
        const updates: any = { updatedAt: new Date() };

        // Handle status updates
        if (req.body.status) {
          updates.status = req.body.status;

          // If confirming order and it's a livreur, assign them
          if (req.body.status === 'confirmed' && user.role === "livreur" && !order.livreurId) {
            updates.livreurId = user.id;
          }
        }

        const updatedOrder = await storage.updateOrder(req.params.id, updates);
        return res.json(updatedOrder);
      }

      return res.status(403).json({ error: "Not authorized to update orders" });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/users", requireRole("owner"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users/create-staff", requireRole("owner"), async (req: any, res) => {
    try {
      const { email, password, name, phone, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Email, password, name, and role are required' });
      }

      if (!['owner', 'livreur'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be owner or livreur' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating staff user:", error);
      res.status(500).json({ error: "Failed to create staff user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}