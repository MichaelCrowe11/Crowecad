import { 
  projects, 
  facilities, 
  zones, 
  equipmentTypes, 
  equipmentInstances, 
  commands,
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
  type InsertCommand
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from 'crypto';

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
}


class MemoryStorage implements IStorage {
  constructor(){
    // minimal seed for tests
    this._equipmentTypes.push({ id: randomUUID(), name: 'Stirred Tank Bioreactor', category: 'bioreactor', icon: 'fas fa-flask', defaultProperties: {}, svgTemplate: '' } as any);
  }

  private _projects: Project[] = [];
  private _facilities: Facility[] = [];
  private _zones: Zone[] = [];
  private _equipmentTypes: EquipmentType[] = [];
  private _equipmentInstances: EquipmentInstance[] = [];
  private _commands: Command[] = [];

  async getProject(id: string) { return this._projects.find(p => p.id === id); }
  async createProject(project: InsertProject) { const p = { id: randomUUID(), ...project, createdAt: new Date(), updatedAt: new Date(), lastSaved: new Date(), settings: (project as any).settings ?? {} } as unknown as Project; this._projects.push(p); return p; }
  async updateProject(id: string, updates: Partial<InsertProject>) { const p = this._projects.find(p=>p.id===id)!; Object.assign(p, updates, {updatedAt:new Date()}); return p; }
  async listProjects() { return [...this._projects].sort((a,b)=>+b.updatedAt - +a.updatedAt); }

  async getFacility(id: string){return this._facilities.find(f=>f.id===id)}
  async createFacility(fac: InsertFacility){ const f = { id: randomUUID(), ...fac, createdAt:new Date(), updatedAt:new Date() } as unknown as Facility; this._facilities.push(f); return f }
  async updateFacility(id: string, updates: Partial<InsertFacility>){ const f=this._facilities.find(f=>f.id===id)!; Object.assign(f, updates, {updatedAt:new Date()}); return f }
  async getFacilitiesByProject(projectId: string){ return this._facilities.filter(f=>f.projectId===projectId).sort((a,b)=>+b.updatedAt-+a.updatedAt) }

  async getZone(id: string){ return this._zones.find(z=>z.id===id) }
  async createZone(zone: InsertZone){ const z = { id: randomUUID(), ...zone } as unknown as Zone; this._zones.push(z); return Promise.resolve(z) }
  async updateZone(id: string, updates: Partial<InsertZone>){ const z=this._zones.find(z=>z.id===id)!; Object.assign(z, updates); return z }
  async deleteZone(id: string){ this._zones = this._zones.filter(z=>z.id!==id) }
  async getZonesByFacility(fid: string){ return this._zones.filter(z=>z.facilityId===fid) }

  async getEquipmentType(id: string){ return this._equipmentTypes.find(t=>t.id===id) }
  async createEquipmentType(et: InsertEquipmentType){ const e = { id: randomUUID(), ...et } as unknown as EquipmentType; this._equipmentTypes.push(e); return Promise.resolve(e) }
  async listEquipmentTypes(){ return [...this._equipmentTypes].sort((a,b)=> (a.category.localeCompare(b.category)) || a.name.localeCompare(b.name)) }

  async getEquipmentInstance(id: string){ return this._equipmentInstances.find(e=>e.id===id) }
  async createEquipmentInstance(inst: InsertEquipmentInstance){ const e = { id: randomUUID(), lastModified:new Date(), ...inst } as unknown as EquipmentInstance; this._equipmentInstances.push(e); return Promise.resolve(e) }
  async updateEquipmentInstance(id: string, updates: Partial<InsertEquipmentInstance>){ const e=this._equipmentInstances.find(e=>e.id===id)!; Object.assign(e, updates, {lastModified:new Date()}); return e }
  async deleteEquipmentInstance(id: string){ this._equipmentInstances = this._equipmentInstances.filter(e=>e.id!==id) }
  async getEquipmentInstancesByFacility(fid: string){ return this._equipmentInstances.filter(e=>e.facilityId===fid) }

  async createCommand(cmd: InsertCommand){ const c = { id: randomUUID(), executedAt: new Date(), ...cmd } as unknown as Command; this._commands.push(c); return Promise.resolve(c) }
  async updateCommand(id: string, updates: Partial<InsertCommand>){ const c=this._commands.find(c=>c.id===id)!; Object.assign(c, updates); return c }
  async getCommandsByProject(pid: string){ return this._commands.filter(c=>c.projectId===pid).sort((a,b)=> +new Date(b.executedAt) - +new Date(a.executedAt)) }
}


export const storage = (process.env.STORAGE_TYPE === "memory" || process.env.NODE_ENV === "test") ? new MemoryStorage() : new DatabaseStorage();

