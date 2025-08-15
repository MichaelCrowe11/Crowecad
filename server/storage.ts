import { 
  projects, 
  facilities, 
  zones, 
  equipmentTypes, 
  equipmentInstances,
  commands,
  assistantThreads,
  type Project,
  type InsertProject,
  type Facility,
  type InsertFacility,
  type Zone,
  type InsertZone,
  type EquipmentType,
  type InsertEquipmentType,
  type EquipmentInstance,
  type InsertEquipmentInstance,
  type Command,
  type InsertCommand,
  type AssistantThread,
  type InsertAssistantThread
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  listProjects(): Promise<Project[]>;

  // Facilities
  getFacility(id: string): Promise<Facility | undefined>;
  createFacility(facility: InsertFacility): Promise<Facility>;
  updateFacility(id: string, updates: Partial<InsertFacility>): Promise<Facility>;
  getFacilitiesByProject(projectId: string): Promise<Facility[]>;

  // Zones
  getZone(id: string): Promise<Zone | undefined>;
  createZone(zone: InsertZone): Promise<Zone>;
  updateZone(id: string, updates: Partial<InsertZone>): Promise<Zone>;
  deleteZone(id: string): Promise<void>;
  getZonesByFacility(facilityId: string): Promise<Zone[]>;

  // Equipment Types
  getEquipmentType(id: string): Promise<EquipmentType | undefined>;
  createEquipmentType(equipmentType: InsertEquipmentType): Promise<EquipmentType>;
  listEquipmentTypes(): Promise<EquipmentType[]>;

  // Equipment Instances
  getEquipmentInstance(id: string): Promise<EquipmentInstance | undefined>;
  createEquipmentInstance(instance: InsertEquipmentInstance): Promise<EquipmentInstance>;
  updateEquipmentInstance(id: string, updates: Partial<InsertEquipmentInstance>): Promise<EquipmentInstance>;
  deleteEquipmentInstance(id: string): Promise<void>;
  getEquipmentInstancesByFacility(facilityId: string): Promise<EquipmentInstance[]>;

  // Commands
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: string, updates: Partial<InsertCommand>): Promise<Command>;
  getCommandsByProject(projectId: string): Promise<Command[]>;

  // Assistant Threads
  saveAssistantThread(sessionId: string, threadId: string): Promise<void>;
  getAssistantThread(sessionId: string): Promise<string | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db
      .insert(projects)
      .values(project)
      .returning();
    return created;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async listProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  // Facilities
  async getFacility(id: string): Promise<Facility | undefined> {
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id));
    return facility || undefined;
  }

  async createFacility(facility: InsertFacility): Promise<Facility> {
    const [created] = await db
      .insert(facilities)
      .values(facility)
      .returning();
    return created;
  }

  async updateFacility(id: string, updates: Partial<InsertFacility>): Promise<Facility> {
    const [updated] = await db
      .update(facilities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(facilities.id, id))
      .returning();
    return updated;
  }

  async getFacilitiesByProject(projectId: string): Promise<Facility[]> {
    return await db
      .select()
      .from(facilities)
      .where(eq(facilities.projectId, projectId))
      .orderBy(desc(facilities.updatedAt));
  }

  // Zones
  async getZone(id: string): Promise<Zone | undefined> {
    const [zone] = await db.select().from(zones).where(eq(zones.id, id));
    return zone || undefined;
  }

  async createZone(zone: InsertZone): Promise<Zone> {
    const [created] = await db
      .insert(zones)
      .values(zone)
      .returning();
    return created;
  }

  async updateZone(id: string, updates: Partial<InsertZone>): Promise<Zone> {
    const [updated] = await db
      .update(zones)
      .set(updates)
      .where(eq(zones.id, id))
      .returning();
    return updated;
  }

  async deleteZone(id: string): Promise<void> {
    await db.delete(zones).where(eq(zones.id, id));
  }

  async getZonesByFacility(facilityId: string): Promise<Zone[]> {
    return await db
      .select()
      .from(zones)
      .where(eq(zones.facilityId, facilityId));
  }

  // Equipment Types
  async getEquipmentType(id: string): Promise<EquipmentType | undefined> {
    const [type] = await db.select().from(equipmentTypes).where(eq(equipmentTypes.id, id));
    return type || undefined;
  }

  async createEquipmentType(equipmentType: InsertEquipmentType): Promise<EquipmentType> {
    const [created] = await db
      .insert(equipmentTypes)
      .values(equipmentType)
      .returning();
    return created;
  }

  async listEquipmentTypes(): Promise<EquipmentType[]> {
    return await db.select().from(equipmentTypes).orderBy(equipmentTypes.category, equipmentTypes.name);
  }

  // Equipment Instances
  async getEquipmentInstance(id: string): Promise<EquipmentInstance | undefined> {
    const [instance] = await db.select().from(equipmentInstances).where(eq(equipmentInstances.id, id));
    return instance || undefined;
  }

  async createEquipmentInstance(instance: InsertEquipmentInstance): Promise<EquipmentInstance> {
    const [created] = await db
      .insert(equipmentInstances)
      .values(instance)
      .returning();
    return created;
  }

  async updateEquipmentInstance(id: string, updates: Partial<InsertEquipmentInstance>): Promise<EquipmentInstance> {
    const [updated] = await db
      .update(equipmentInstances)
      .set({ ...updates, lastModified: new Date() })
      .where(eq(equipmentInstances.id, id))
      .returning();
    return updated;
  }

  async deleteEquipmentInstance(id: string): Promise<void> {
    await db.delete(equipmentInstances).where(eq(equipmentInstances.id, id));
  }

  async getEquipmentInstancesByFacility(facilityId: string): Promise<EquipmentInstance[]> {
    return await db
      .select()
      .from(equipmentInstances)
      .where(eq(equipmentInstances.facilityId, facilityId));
  }

  // Commands
  async createCommand(command: InsertCommand): Promise<Command> {
    const [created] = await db
      .insert(commands)
      .values(command)
      .returning();
    return created;
  }

  async updateCommand(id: string, updates: Partial<InsertCommand>): Promise<Command> {
    const [updated] = await db
      .update(commands)
      .set(updates)
      .where(eq(commands.id, id))
      .returning();
    return updated;
  }

  async getCommandsByProject(projectId: string): Promise<Command[]> {
    return await db
      .select()
      .from(commands)
      .where(eq(commands.projectId, projectId))
      .orderBy(desc(commands.executedAt));
  }

  async saveAssistantThread(sessionId: string, threadId: string): Promise<void> {
    await db
      .insert(assistantThreads)
      .values({ sessionId, threadId })
      .onConflictDoUpdate({
        target: assistantThreads.sessionId,
        set: { threadId, createdAt: new Date() },
      });
  }

  async getAssistantThread(sessionId: string): Promise<string | undefined> {
    const [thread] = await db
      .select()
      .from(assistantThreads)
      .where(eq(assistantThreads.sessionId, sessionId));
    return thread?.threadId;
  }
}

export const storage = new DatabaseStorage();
