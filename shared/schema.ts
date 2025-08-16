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

// CAD Dataset Tables
export const cadDatasets = pgTable("cad_datasets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  source: text("source").notNull(), // 'abc', 'mcb', 'freecad', 'openscad', 'grabcad', 'thingiverse', 'kaggle', 'nist'
  description: text("description"),
  url: text("url"),
  modelCount: integer("model_count"),
  license: text("license"),
  formats: jsonb("formats").default('[]'), // ['STEP', 'STL', 'OBJ', 'IGES']
  industries: jsonb("industries").default('[]'), // ['mechanical', 'architecture', 'electronics', etc.]
  metadata: jsonb("metadata").default('{}'),
  isActive: boolean("is_active").default(true),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cadModels = pgTable("cad_models", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  datasetId: uuid("dataset_id").references(() => cadDatasets.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // 'gear', 'bearing', 'bracket', 'enclosure', etc.
  industry: text("industry"), // 'mechanical', 'architecture', 'electronics', etc.
  fileUrl: text("file_url"),
  thumbnailUrl: text("thumbnail_url"),
  format: text("format").notNull(), // 'STEP', 'STL', 'OBJ', etc.
  fileSize: integer("file_size"),
  parameters: jsonb("parameters").default('{}'), // For parametric models
  tags: jsonb("tags").default('[]'),
  metadata: jsonb("metadata").default('{}'), // Dimensions, features, etc.
  downloadCount: integer("download_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  isParametric: boolean("is_parametric").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cadCategories = pgTable("cad_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  description: text("description"),
  icon: text("icon"),
  industry: text("industry"),
  sortOrder: integer("sort_order").default(0),
  modelCount: integer("model_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cadPrompts = pgTable("cad_prompts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  prompt: text("prompt").notNull(),
  category: text("category"),
  industry: text("industry"),
  complexity: text("complexity"), // 'beginner', 'intermediate', 'advanced'
  resultModelId: uuid("result_model_id").references(() => cadModels.id, { onDelete: 'set null' }),
  parameters: jsonb("parameters").default('{}'),
  tags: jsonb("tags").default('[]'),
  usageCount: integer("usage_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userModelLibrary = pgTable("user_model_library", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Will be used when auth is implemented
  modelId: uuid("model_id").references(() => cadModels.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  customName: text("custom_name"),
  customTags: jsonb("custom_tags").default('[]'),
  lastUsed: timestamp("last_used"),
  useCount: integer("use_count").default(0),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for CAD datasets
export const cadDatasetsRelations = relations(cadDatasets, ({ many }) => ({
  models: many(cadModels),
}));

export const cadModelsRelations = relations(cadModels, ({ one, many }) => ({
  dataset: one(cadDatasets, {
    fields: [cadModels.datasetId],
    references: [cadDatasets.id],
  }),
  prompts: many(cadPrompts),
  userLibraries: many(userModelLibrary),
}));

export const cadCategoriesRelations = relations(cadCategories, ({ one, many }) => ({
  parent: one(cadCategories, {
    fields: [cadCategories.parentId],
    references: [cadCategories.id],
  }),
  children: many(cadCategories),
}));

export const cadPromptsRelations = relations(cadPrompts, ({ one }) => ({
  resultModel: one(cadModels, {
    fields: [cadPrompts.resultModelId],
    references: [cadModels.id],
  }),
}));

export const userModelLibraryRelations = relations(userModelLibrary, ({ one }) => ({
  model: one(cadModels, {
    fields: [userModelLibrary.modelId],
    references: [cadModels.id],
  }),
  project: one(projects, {
    fields: [userModelLibrary.projectId],
    references: [projects.id],
  }),
}));

// Insert schemas for CAD datasets
export const insertCadDatasetSchema = createInsertSchema(cadDatasets).omit({
  id: true,
  createdAt: true,
});

export const insertCadModelSchema = createInsertSchema(cadModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCadCategorySchema = createInsertSchema(cadCategories).omit({
  id: true,
  createdAt: true,
});

export const insertCadPromptSchema = createInsertSchema(cadPrompts).omit({
  id: true,
  createdAt: true,
});

export const insertUserModelLibrarySchema = createInsertSchema(userModelLibrary).omit({
  id: true,
  createdAt: true,
});

// Types for CAD datasets
export type CadDataset = typeof cadDatasets.$inferSelect;
export type InsertCadDataset = z.infer<typeof insertCadDatasetSchema>;

export type CadModel = typeof cadModels.$inferSelect;
export type InsertCadModel = z.infer<typeof insertCadModelSchema>;

export type CadCategory = typeof cadCategories.$inferSelect;
export type InsertCadCategory = z.infer<typeof insertCadCategorySchema>;

export type CadPrompt = typeof cadPrompts.$inferSelect;
export type InsertCadPrompt = z.infer<typeof insertCadPromptSchema>;

export type UserModelLibrary = typeof userModelLibrary.$inferSelect;
export type InsertUserModelLibrary = z.infer<typeof insertUserModelLibrarySchema>;
