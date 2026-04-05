import { pgTable, text, uuid, timestamp, boolean, integer, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ... [all existing tables unchanged until after orders schema] ...

// Orders table (enhanced with coupons)
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 100 }),
  customerId: uuid("customer_id").references(() => users.id),
  deliveryAddress: text("delivery_address").notNull(),
  customerLocationLat: decimal("customer_location_lat", { precision: 10, scale: 8 }),
  customerLocationLng: decimal("customer_location_lng", { precision: 11, scale: 8 }),
  notes: text("notes"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  items: text("items").notNull(), 
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: varchar("estimated_time", { length: 50 }).default("30-45 دقيقة"),
  deliveryPreference: varchar("delivery_preference", { length: 20 }).default("now"),
  scheduledDate: varchar("scheduled_date", { length: 50 }),
  scheduledTimeSlot: varchar("scheduled_time_slot", { length: 100 }),
  driverEarnings: decimal("driver_earnings", { precision: 10, scale: 2 }).default("0"),
  restaurantEarnings: decimal("restaurant_earnings", { precision: 10, scale: 2 }).default("0"),
  companyEarnings: decimal("company_earnings", { precision: 10, scale: 2 }).default("0"),
  distance: decimal("distance", { precision: 10, scale: 2 }).default("0"),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  restaurantName: varchar("restaurant_name", { length: 200 }),
  restaurantPhone: varchar("restaurant_phone", { length: 20 }),
  driverId: uuid("driver_id").references(() => drivers.id),
  adminPhone: varchar("admin_phone", { length: 20 }), // Added for client tracking
  isRated: boolean("is_rated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).default("percentage").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),
  maxUses: integer("max_uses").default(null), // null = unlimited
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  categoryId: uuid("category_id").references(() => categories.id),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ... [all remaining tables and schemas unchanged] ...

export const insertOrderSchema = createInsertSchema(orders).partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  orderNumber: true,
  distance: true,
  driverEarnings: true,
  restaurantEarnings: true,
  companyEarnings: true,
  isRated: true,
  couponCode: true,
  couponDiscount: true,
  adminPhone: true,
});

export const selectOrderSchema = createSelectSchema(orders);
export type Order = z.infer<typeof selectOrderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// New coupon schemas
export const insertCouponSchema = createInsertSchema(coupons).partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  maxUses: true,
  usedCount: true,
});
export const selectCouponSchema = createSelectSchema(coupons);
export type Coupon = z.infer<typeof selectCouponSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

// [Keep all other existing schemas unchanged - paste the full content below this point]

