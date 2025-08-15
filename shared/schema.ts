import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSaved: timestamp("last_saved").defaultNow(),
  settings: jsonb("settings").default('{}'),
});

export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  width: decimal("width", { precision: 10, scale: 2 }).notNull(),
  height: decimal("height", { precision: 10, scale: 2 }).notNull(),
  layout: jsonb("layout").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const zones = pgTable("zones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id").references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // cultivation, processing, storage, etc.
  x: decimal("x", { precision: 10, scale: 2 }).notNull(),
  y: decimal("y", { precision: 10, scale: 2 }).notNull(),
  width: decimal("width", { precision: 10, scale: 2 }).notNull(),
  height: decimal("height", { precision: 10, scale: 2 }).notNull(),
  color: text("color").default('#1976D2'),
  properties: jsonb("properties").default('{}'),
});

export const equipmentTypes = pgTable("equipment_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // bioreactor, environmental, processing, storage
  icon: text("icon").default('fas fa-cog'),
  defaultProperties: jsonb("default_properties").default('{}'),
  svgTemplate: text("svg_template"),
});

export const equipmentInstances = pgTable("equipment_instances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid("facility_id").references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  zoneId: uuid("zone_id").references(() => zones.id, { onDelete: 'set null' }),
  equipmentTypeId: uuid("equipment_type_id").references(() => equipmentTypes.id).notNull(),
  name: text("name").notNull(),
  x: decimal("x", { precision: 10, scale: 2 }).notNull(),
  y: decimal("y", { precision: 10, scale: 2 }).notNull(),
  rotation: decimal("rotation", { precision: 5, scale: 2 }).default('0'),
  scale: decimal("scale", { precision: 3, scale: 2 }).default('1.0'),
  properties: jsonb("properties").default('{}'),
  connections: jsonb("connections").default('[]'),
  status: text("status").default('configured'), // configured, error, warning
  lastModified: timestamp("last_modified").defaultNow(),
});

export const commands = pgTable("commands", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  command: text("command").notNull(),
  result: jsonb("result").default('{}'),
  status: text("status").default('pending'), // pending, success, error
  error: text("error"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const assistantThreads = pgTable("assistant_threads", {
  sessionId: varchar("session_id").primaryKey(),
  threadId: varchar("thread_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  facilities: many(facilities),
  commands: many(commands),
}));

export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  project: one(projects, {
    fields: [facilities.projectId],
    references: [projects.id],
  }),
  zones: many(zones),
  equipmentInstances: many(equipmentInstances),
}));

export const zonesRelations = relations(zones, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [zones.facilityId],
    references: [facilities.id],
  }),
  equipmentInstances: many(equipmentInstances),
}));

export const equipmentTypesRelations = relations(equipmentTypes, ({ many }) => ({
  instances: many(equipmentInstances),
}));

export const equipmentInstancesRelations = relations(equipmentInstances, ({ one }) => ({
  facility: one(facilities, {
    fields: [equipmentInstances.facilityId],
    references: [facilities.id],
  }),
  zone: one(zones, {
    fields: [equipmentInstances.zoneId],
    references: [zones.id],
  }),
  equipmentType: one(equipmentTypes, {
    fields: [equipmentInstances.equipmentTypeId],
    references: [equipmentTypes.id],
  }),
}));

export const commandsRelations = relations(commands, ({ one }) => ({
  project: one(projects, {
    fields: [commands.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSaved: true,
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertZoneSchema = createInsertSchema(zones).omit({
  id: true,
});

export const insertEquipmentTypeSchema = createInsertSchema(equipmentTypes).omit({
  id: true,
});

export const insertEquipmentInstanceSchema = createInsertSchema(equipmentInstances).omit({
  id: true,
  lastModified: true,
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
  executedAt: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Facility = typeof facilities.$inferSelect;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;

export type Zone = typeof zones.$inferSelect;
export type InsertZone = z.infer<typeof insertZoneSchema>;

export type EquipmentType = typeof equipmentTypes.$inferSelect;
export type InsertEquipmentType = z.infer<typeof insertEquipmentTypeSchema>;

export type EquipmentInstance = typeof equipmentInstances.$inferSelect;
export type InsertEquipmentInstance = z.infer<typeof insertEquipmentInstanceSchema>;

export type Command = typeof commands.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;

export type AssistantThread = typeof assistantThreads.$inferSelect;
export type InsertAssistantThread = typeof assistantThreads.$inferInsert;
