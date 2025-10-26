import { z } from "zod";
import type { MenuItem } from "./schema";

export interface CartItem extends MenuItem {
  quantity: number;
}

export const orderItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().min(1),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const customerOrderSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
  preferredTime: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

export type CustomerOrder = z.infer<typeof customerOrderSchema>;
