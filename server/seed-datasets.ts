import { db } from "./db";
import { cadDatasets, cadCategories, cadPrompts } from "@shared/schema";

const datasets = [
  {
    name: "ABC Dataset",
    source: "abc",
    description: "1 million+ high-quality CAD models from Onshape with ground truth annotations for geometric deep learning",
    url: "https://deep-geometry.github.io/abc-dataset/",
    modelCount: 1000000,
    license: "Onshape Terms of Use",
    formats: ["STEP", "STL", "OBJ", "Parasolid"],
    industries: ["mechanical", "consumer", "electronics", "general"],
    metadata: {
      github: "https://github.com/deep-geometry/abc-dataset",
      paper: "CVPR 2019",
      features: ["surface normals", "patch segmentation", "geometric features"]
    }
  },
  {
    name: "Mechanical Components Benchmark (MCB)",
    source: "mcb",
    description: "58,696 mechanical components across 68 ISO-classified categories from TraceParts",
    url: "https://engineering.purdue.edu/cdesign/wp/mcb",
    modelCount: 58696,
    license: "Research Use",
    formats: ["STEP", "STL", "IGES"],
    industries: ["mechanical", "automotive", "aerospace"],
    metadata: {
      github: "https://github.com/stnoah1/mcb",
      categories: 68,
      source: "TraceParts API"
    }
  },
  {
    name: "FreeCAD Library",
    source: "freecad",
    description: "Official FreeCAD parts library with hundreds of parametric models",
    url: "https://github.com/FreeCAD/FreeCAD-library",
    modelCount: 1000,
    license: "CC-BY 3.0",
    formats: ["FCStd", "STEP", "STL"],
    industries: ["mechanical", "electronics", "architecture"],
    metadata: {
      github: "https://github.com/FreeCAD/FreeCAD-library",
      parametric: true
    }
  },
  {
    name: "OpenSCAD MCAD",
    source: "openscad",
    description: "Official OpenSCAD parametric CAD library with motors, servos, gears, bearings",
    url: "https://github.com/openscad/MCAD",
    modelCount: 500,
    license: "LGPL 2.1",
    formats: ["SCAD", "STL"],
    industries: ["mechanical", "robotics", "3d-printing"],
    metadata: {
      github: "https://github.com/openscad/MCAD",
      parametric: true
    }
  },
  {
    name: "GrabCAD Community Library",
    source: "grabcad",
    description: "3.18+ million free CAD models from the world's largest CAD community",
    url: "https://grabcad.com/library",
    modelCount: 3180000,
    license: "Various (check individual models)",
    formats: ["STEP", "IGES", "STL", "OBJ", "DWG", "DXF", "SLDPRT"],
    industries: ["all"],
    metadata: {
      community: "5.3M+ engineers",
      registration: "required"
    }
  },
  {
    name: "Thingiverse Customizable",
    source: "thingiverse",
    description: "Thousands of OpenSCAD parametric models for 3D printing",
    url: "https://www.thingiverse.com/tag:openscad",
    modelCount: 50000,
    license: "Creative Commons",
    formats: ["SCAD", "STL"],
    industries: ["consumer", "3d-printing", "hobby"],
    metadata: {
      customizable: true,
      parametric: true
    }
  },
  {
    name: "TraceParts",
    source: "traceparts",
    description: "100+ million CAD models from 900+ manufacturer catalogs",
    url: "https://www.traceparts.com",
    modelCount: 100000000,
    license: "Manufacturer specific",
    formats: ["STEP", "IGES", "STL", "DWG", "DXF"],
    industries: ["all"],
    metadata: {
      api: "available",
      manufacturers: 900
    }
  },
  {
    name: "NIST CAD Models with PMI",
    source: "nist",
    description: "Government dataset with STEP files including Product Manufacturing Information",
    url: "https://www.nist.gov/services-resources/software/step-file-analyzer-and-viewer",
    modelCount: 500,
    license: "Public Domain",
    formats: ["STEP"],
    industries: ["mechanical", "manufacturing"],
    metadata: {
      pmi: true,
      gdt: true,
      validation: true
    }
  },
  {
    name: "ModelNet40 (Kaggle)",
    source: "kaggle",
    description: "Princeton's 3D object classification dataset with 12,311 models in 40 categories",
    url: "https://www.kaggle.com/datasets/balraj98/modelnet40-princeton-3d-object-dataset",
    modelCount: 12311,
    license: "Research Use",
    formats: ["OFF", "STL"],
    industries: ["general", "research"],
    metadata: {
      categories: 40,
      princeton: true
    }
  }
];

const categories = [
  // Mechanical Engineering
  { name: "Gears & Transmissions", industry: "mechanical", icon: "⚙️", sortOrder: 1 },
  { name: "Bearings & Bushings", industry: "mechanical", icon: "🔄", sortOrder: 2 },
  { name: "Fasteners", industry: "mechanical", icon: "🔩", sortOrder: 3 },
  { name: "Springs", industry: "mechanical", icon: "🌀", sortOrder: 4 },
  { name: "Shafts & Couplings", industry: "mechanical", icon: "🔧", sortOrder: 5 },
  { name: "Brackets & Mounts", industry: "mechanical", icon: "🗜️", sortOrder: 6 },
  { name: "Valves & Fittings", industry: "mechanical", icon: "🚰", sortOrder: 7 },
  { name: "Pulleys & Belts", industry: "mechanical", icon: "⚙️", sortOrder: 8 },
  
  // Electronics
  { name: "PCB Components", industry: "electronics", icon: "🔌", sortOrder: 10 },
  { name: "Enclosures", industry: "electronics", icon: "📦", sortOrder: 11 },
  { name: "Connectors", industry: "electronics", icon: "🔗", sortOrder: 12 },
  { name: "Heat Sinks", industry: "electronics", icon: "🌡️", sortOrder: 13 },
  { name: "Displays", industry: "electronics", icon: "📺", sortOrder: 14 },
  
  // Architecture
  { name: "Structural Elements", industry: "architecture", icon: "🏗️", sortOrder: 20 },
  { name: "Doors & Windows", industry: "architecture", icon: "🚪", sortOrder: 21 },
  { name: "Furniture", industry: "architecture", icon: "🪑", sortOrder: 22 },
  { name: "Fixtures", industry: "architecture", icon: "💡", sortOrder: 23 },
  { name: "HVAC Components", industry: "architecture", icon: "❄️", sortOrder: 24 },
  
  // Automotive
  { name: "Engine Parts", industry: "automotive", icon: "🚗", sortOrder: 30 },
  { name: "Chassis Components", industry: "automotive", icon: "🏎️", sortOrder: 31 },
  { name: "Suspension", industry: "automotive", icon: "🛞", sortOrder: 32 },
  { name: "Brakes", industry: "automotive", icon: "🛑", sortOrder: 33 },
  { name: "Electrical Systems", industry: "automotive", icon: "🔋", sortOrder: 34 },
  
  // Aerospace
  { name: "Airfoils", industry: "aerospace", icon: "✈️", sortOrder: 40 },
  { name: "Turbines", industry: "aerospace", icon: "🌪️", sortOrder: 41 },
  { name: "Structural Components", industry: "aerospace", icon: "🚀", sortOrder: 42 },
  { name: "Landing Gear", industry: "aerospace", icon: "🛬", sortOrder: 43 },
  
  // Medical
  { name: "Implants", industry: "medical", icon: "🏥", sortOrder: 50 },
  { name: "Surgical Tools", industry: "medical", icon: "🔬", sortOrder: 51 },
  { name: "Prosthetics", industry: "medical", icon: "🦿", sortOrder: 52 },
  { name: "Medical Devices", industry: "medical", icon: "💊", sortOrder: 53 },
  
  // Consumer Products
  { name: "Household Items", industry: "consumer", icon: "🏠", sortOrder: 60 },
  { name: "Tools", industry: "consumer", icon: "🔨", sortOrder: 61 },
  { name: "Toys", industry: "consumer", icon: "🎮", sortOrder: 62 },
  { name: "Sports Equipment", industry: "consumer", icon: "⚽", sortOrder: 63 },
  { name: "Kitchen Appliances", industry: "consumer", icon: "🍳", sortOrder: 64 },
];

const samplePrompts = [
  // Beginner
  { 
    prompt: "Create a simple gear with 20 teeth",
    category: "Gears & Transmissions",
    industry: "mechanical",
    complexity: "beginner",
    parameters: { teeth: 20, module: 2, thickness: 10 },
    tags: ["gear", "transmission", "mechanical"]
  },
  {
    prompt: "Design a box 100x50x30mm with rounded corners",
    category: "Enclosures",
    industry: "electronics",
    complexity: "beginner",
    parameters: { width: 100, height: 50, depth: 30, cornerRadius: 5 },
    tags: ["enclosure", "box", "container"]
  },
  {
    prompt: "Make a bracket with 4 mounting holes",
    category: "Brackets & Mounts",
    industry: "mechanical",
    complexity: "beginner",
    parameters: { holes: 4, holeDiameter: 5, width: 100, height: 50 },
    tags: ["bracket", "mount", "fastener"]
  },
  
  // Intermediate
  {
    prompt: "Generate a helical gear with 30 teeth, 20 degree helix angle",
    category: "Gears & Transmissions",
    industry: "mechanical",
    complexity: "intermediate",
    parameters: { teeth: 30, helixAngle: 20, module: 2.5, faceWidth: 20 },
    tags: ["helical gear", "transmission", "advanced"]
  },
  {
    prompt: "Create a phone stand that holds device at 45 degrees with cable management",
    category: "Household Items",
    industry: "consumer",
    complexity: "intermediate",
    parameters: { angle: 45, width: 80, cableSlot: true },
    tags: ["stand", "phone", "holder", "cable management"]
  },
  {
    prompt: "Design a PCB enclosure with ventilation slots and mounting posts",
    category: "Enclosures",
    industry: "electronics",
    complexity: "intermediate",
    parameters: { ventSlots: 8, mountingPosts: 4, pcbSize: "100x60" },
    tags: ["pcb", "enclosure", "ventilation", "electronics"]
  },
  
  // Advanced
  {
    prompt: "Build a turbine blade with NACA 4412 airfoil profile, 200mm chord",
    category: "Turbines",
    industry: "aerospace",
    complexity: "advanced",
    parameters: { airfoil: "NACA 4412", chord: 200, span: 300, twist: 15 },
    tags: ["turbine", "airfoil", "aerospace", "naca"]
  },
  {
    prompt: "Create a planetary gear system with sun gear 20 teeth, 3 planets",
    category: "Gears & Transmissions",
    industry: "mechanical",
    complexity: "advanced",
    parameters: { sunTeeth: 20, planets: 3, ratio: "4:1" },
    tags: ["planetary", "gear system", "transmission", "complex"]
  },
  {
    prompt: "Design a prosthetic hand joint with 3 degrees of freedom",
    category: "Prosthetics",
    industry: "medical",
    complexity: "advanced",
    parameters: { dof: 3, fingerLength: 80, jointType: "ball" },
    tags: ["prosthetic", "medical", "joint", "biomechanical"]
  },
  {
    prompt: "Generate a parametric honeycomb structure 200x200mm with variable cell size",
    category: "Structural Components",
    industry: "aerospace",
    complexity: "advanced",
    parameters: { size: 200, cellSizeMin: 5, cellSizeMax: 15, thickness: 2 },
    tags: ["honeycomb", "parametric", "structure", "lightweight"]
  }
];

export async function seedDatasets() {
  console.log("🌱 Seeding CAD datasets...");
  
  try {
    // Insert datasets
    console.log("📊 Inserting datasets...");
    const insertedDatasets = await db.insert(cadDatasets).values(datasets).returning();
    console.log(`✅ Inserted ${insertedDatasets.length} datasets`);
    
    // Insert categories
    console.log("📁 Inserting categories...");
    const insertedCategories = await db.insert(cadCategories).values(categories).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);
    
    // Insert sample prompts
    console.log("💬 Inserting sample prompts...");
    const insertedPrompts = await db.insert(cadPrompts).values(samplePrompts).returning();
    console.log(`✅ Inserted ${insertedPrompts.length} sample prompts`);
    
    console.log("🎉 Dataset seeding completed successfully!");
    
    // Summary
    console.log("\n📈 Summary:");
    console.log(`   - Datasets: ${insertedDatasets.length}`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - Sample Prompts: ${insertedPrompts.length}`);
    console.log(`   - Total Models Available: ${datasets.reduce((acc, d) => acc + (d.modelCount || 0), 0).toLocaleString()}`);
    
  } catch (error) {
    console.error("❌ Error seeding datasets:", error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatasets()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}