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
  },
  
  // Software Development Datasets
  {
    name: "CodeSearchNet",
    source: "codesearchnet",
    description: "6 million functions from open source code with 2 million documented pairs for semantic code search",
    url: "https://github.com/github/CodeSearchNet",
    modelCount: 6000000,
    license: "Various OSS Licenses",
    formats: ["Python", "JavaScript", "Ruby", "Go", "Java", "PHP"],
    industries: ["software", "development", "ai"],
    metadata: {
      github: "https://github.com/github/CodeSearchNet",
      huggingface: "code-search-net/code_search_net",
      features: ["semantic search", "code documentation", "function analysis"]
    }
  },
  {
    name: "GitHub Public Dataset (BigQuery)",
    source: "github-bigquery",
    description: "2.8+ million open source repositories with complete version history and metadata",
    url: "https://cloud.google.com/bigquery/public-data/github",
    modelCount: 2800000,
    license: "Various OSS Licenses",
    formats: ["All Languages", "SQL Queryable"],
    industries: ["software", "development", "analytics"],
    metadata: {
      platform: "Google BigQuery",
      updateFrequency: "Weekly",
      features: ["commit history", "file contents", "language statistics"]
    }
  },
  {
    name: "Awesome Public Datasets",
    source: "awesome-datasets",
    description: "Topic-centric collection of 59,000+ high-quality open datasets for development",
    url: "https://github.com/awesomedata/awesome-public-datasets",
    modelCount: 59000,
    license: "Various",
    formats: ["CSV", "JSON", "API", "SQL"],
    industries: ["software", "data-science", "ai"],
    metadata: {
      github: "https://github.com/awesomedata/awesome-public-datasets",
      stars: 59000,
      categories: ["finance", "healthcare", "government", "social"]
    }
  },
  {
    name: "Hugging Face Datasets",
    source: "huggingface",
    description: "17,000+ ready-to-use datasets for machine learning and AI development",
    url: "https://huggingface.co/datasets",
    modelCount: 17000,
    license: "Various",
    formats: ["Python", "JSON", "Parquet", "Arrow"],
    industries: ["ai", "software", "research"],
    metadata: {
      platform: "Hugging Face Hub",
      features: ["streaming", "versioning", "data cards"],
      integration: ["PyTorch", "TensorFlow", "JAX"]
    }
  },
  {
    name: "500+ AI/ML Projects Collection",
    source: "ml-projects",
    description: "500 AI/ML/Computer Vision/NLP projects with complete source code",
    url: "https://github.com/ashishpatel26/500-AI-Machine-learning-Deep-learning-Computer-vision-NLP-Projects-with-code",
    modelCount: 500,
    license: "MIT",
    formats: ["Python", "Jupyter", "TensorFlow", "PyTorch"],
    industries: ["ai", "software", "education"],
    metadata: {
      github: "https://github.com/ashishpatel26/500-AI-Machine-learning-Deep-learning-Computer-vision-NLP-Projects-with-code",
      projectTypes: ["classification", "regression", "nlp", "computer-vision"]
    }
  },
  
  // UI/UX Component Libraries
  {
    name: "Shadcn UI Components",
    source: "shadcn",
    description: "Copy-paste React components built on Radix UI and Tailwind CSS",
    url: "https://ui.shadcn.com",
    modelCount: 50,
    license: "MIT",
    formats: ["React", "TypeScript", "Tailwind"],
    industries: ["frontend", "design", "software"],
    metadata: {
      type: "component-library",
      features: ["accessible", "customizable", "copy-paste"],
      dependencies: ["radix-ui", "tailwindcss"]
    }
  },
  {
    name: "Material UI (MUI)",
    source: "mui",
    description: "93k+ stars React components implementing Google's Material Design",
    url: "https://mui.com",
    modelCount: 100,
    license: "MIT",
    formats: ["React", "TypeScript", "JavaScript"],
    industries: ["frontend", "design", "enterprise"],
    metadata: {
      github: "https://github.com/mui/material-ui",
      stars: 93000,
      weeklyDownloads: "4M+"
    }
  },
  {
    name: "Ant Design",
    source: "antd",
    description: "Enterprise-grade React UI components with 92k+ GitHub stars",
    url: "https://ant.design",
    modelCount: 90,
    license: "MIT",
    formats: ["React", "TypeScript", "Less"],
    industries: ["frontend", "enterprise", "design"],
    metadata: {
      github: "https://github.com/ant-design/ant-design",
      stars: 92000,
      language: ["English", "Chinese"]
    }
  },
  {
    name: "UIverse Components",
    source: "uiverse",
    description: "Open-source UI elements library with CSS/Tailwind animations",
    url: "https://uiverse.io",
    modelCount: 5000,
    license: "MIT",
    formats: ["HTML", "CSS", "Tailwind"],
    industries: ["frontend", "design", "software"],
    metadata: {
      type: "community-driven",
      features: ["animations", "hover-effects", "copy-paste"]
    }
  },
  
  // Design Systems
  {
    name: "IBM Carbon Design System",
    source: "carbon",
    description: "Open-source design system with working code and design tools",
    url: "https://carbondesignsystem.com",
    modelCount: 200,
    license: "Apache 2.0",
    formats: ["React", "Vue", "Angular", "Web Components"],
    industries: ["enterprise", "design", "software"],
    metadata: {
      github: "https://github.com/carbon-design-system/carbon",
      company: "IBM",
      accessibility: "WCAG 2.1 AA"
    }
  },
  {
    name: "Shopify Polaris",
    source: "polaris",
    description: "E-commerce focused design system and React components",
    url: "https://polaris.shopify.com",
    modelCount: 70,
    license: "MIT",
    formats: ["React", "Figma", "Sketch"],
    industries: ["ecommerce", "design", "frontend"],
    metadata: {
      github: "https://github.com/Shopify/polaris",
      company: "Shopify",
      focus: "merchant-experience"
    }
  },
  
  // API Collections
  {
    name: "Public APIs Collection",
    source: "public-apis",
    description: "Collective list of 1400+ free APIs for development",
    url: "https://github.com/public-apis/public-apis",
    modelCount: 1400,
    license: "MIT",
    formats: ["REST", "GraphQL", "WebSocket"],
    industries: ["software", "api", "development"],
    metadata: {
      github: "https://github.com/public-apis/public-apis",
      categories: ["weather", "finance", "social", "data"],
      authentication: ["apiKey", "OAuth", "none"]
    }
  },
  {
    name: "RapidAPI Hub",
    source: "rapidapi",
    description: "World's largest API marketplace with 40,000+ APIs",
    url: "https://rapidapi.com/hub",
    modelCount: 40000,
    license: "Various",
    formats: ["REST", "GraphQL", "SOAP"],
    industries: ["software", "api", "enterprise"],
    metadata: {
      platform: "RapidAPI",
      features: ["unified-billing", "monitoring", "testing"],
      categories: ["ai", "data", "finance", "social-media"]
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
  
  // Software Development Categories
  { name: "Code Repositories", industry: "software", icon: "📚", sortOrder: 70 },
  { name: "Functions & Methods", industry: "software", icon: "⚡", sortOrder: 71 },
  { name: "API Endpoints", industry: "api", icon: "🔌", sortOrder: 72 },
  { name: "Data Models", industry: "software", icon: "📊", sortOrder: 73 },
  { name: "Algorithms", industry: "software", icon: "🧮", sortOrder: 74 },
  { name: "Machine Learning Models", industry: "ai", icon: "🤖", sortOrder: 75 },
  { name: "Neural Networks", industry: "ai", icon: "🧠", sortOrder: 76 },
  { name: "Computer Vision", industry: "ai", icon: "👁️", sortOrder: 77 },
  { name: "NLP Models", industry: "ai", icon: "💬", sortOrder: 78 },
  
  // Frontend/UI Categories
  { name: "React Components", industry: "frontend", icon: "⚛️", sortOrder: 80 },
  { name: "Vue Components", industry: "frontend", icon: "💚", sortOrder: 81 },
  { name: "UI Elements", industry: "frontend", icon: "🎨", sortOrder: 82 },
  { name: "Form Components", industry: "frontend", icon: "📝", sortOrder: 83 },
  { name: "Navigation", industry: "frontend", icon: "🧭", sortOrder: 84 },
  { name: "Data Visualization", industry: "frontend", icon: "📈", sortOrder: 85 },
  { name: "Animations", industry: "frontend", icon: "✨", sortOrder: 86 },
  
  // Design System Categories
  { name: "Design Tokens", industry: "design", icon: "🎨", sortOrder: 90 },
  { name: "Typography", industry: "design", icon: "📝", sortOrder: 91 },
  { name: "Color Systems", industry: "design", icon: "🌈", sortOrder: 92 },
  { name: "Icons", industry: "design", icon: "🎯", sortOrder: 93 },
  { name: "Layouts", industry: "design", icon: "📐", sortOrder: 94 },
  { name: "Patterns", industry: "design", icon: "🔷", sortOrder: 95 },
  
  // E-commerce Categories
  { name: "Product Cards", industry: "ecommerce", icon: "🛍️", sortOrder: 100 },
  { name: "Shopping Carts", industry: "ecommerce", icon: "🛒", sortOrder: 101 },
  { name: "Payment Forms", industry: "ecommerce", icon: "💳", sortOrder: 102 },
  { name: "Checkout Flows", industry: "ecommerce", icon: "✅", sortOrder: 103 },
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
  },
  
  // Software Development Prompts
  {
    prompt: "Create a REST API endpoint for user authentication",
    category: "API Endpoints",
    industry: "software",
    complexity: "beginner",
    parameters: { method: "POST", path: "/auth/login", auth: "JWT" },
    tags: ["api", "authentication", "rest"]
  },
  {
    prompt: "Generate a React component for a responsive navigation bar",
    category: "React Components",
    industry: "frontend",
    complexity: "beginner",
    parameters: { framework: "React", responsive: true, menuItems: 5 },
    tags: ["react", "navigation", "responsive"]
  },
  {
    prompt: "Build a Python function to sort an array using quicksort",
    category: "Algorithms",
    industry: "software",
    complexity: "intermediate",
    parameters: { language: "Python", algorithm: "quicksort", timeComplexity: "O(n log n)" },
    tags: ["algorithm", "sorting", "python"]
  },
  {
    prompt: "Create a machine learning model for image classification",
    category: "Computer Vision",
    industry: "ai",
    complexity: "advanced",
    parameters: { framework: "TensorFlow", architecture: "CNN", classes: 10 },
    tags: ["ml", "computer-vision", "classification"]
  },
  {
    prompt: "Design a card component with hover animations using Tailwind",
    category: "UI Elements",
    industry: "frontend",
    complexity: "intermediate",
    parameters: { framework: "Tailwind", animation: "hover", shadow: true },
    tags: ["ui", "tailwind", "animation"]
  },
  {
    prompt: "Implement a GraphQL resolver for fetching user data",
    category: "API Endpoints",
    industry: "api",
    complexity: "intermediate",
    parameters: { type: "GraphQL", operation: "query", schema: "User" },
    tags: ["graphql", "api", "resolver"]
  },
  {
    prompt: "Create a shopping cart component with state management",
    category: "Shopping Carts",
    industry: "ecommerce",
    complexity: "intermediate",
    parameters: { framework: "React", stateManager: "Redux", features: ["add", "remove", "quantity"] },
    tags: ["ecommerce", "cart", "state-management"]
  },
  {
    prompt: "Build a neural network for text sentiment analysis",
    category: "NLP Models",
    industry: "ai",
    complexity: "advanced",
    parameters: { type: "LSTM", framework: "PyTorch", vocabulary: 10000 },
    tags: ["nlp", "sentiment", "deep-learning"]
  },
  {
    prompt: "Generate a TypeScript interface for a user profile",
    category: "Data Models",
    industry: "software",
    complexity: "beginner",
    parameters: { language: "TypeScript", fields: ["id", "name", "email", "avatar"] },
    tags: ["typescript", "interface", "data-model"]
  },
  {
    prompt: "Create a CI/CD pipeline configuration for GitHub Actions",
    category: "Code Repositories",
    industry: "software",
    complexity: "intermediate",
    parameters: { platform: "GitHub Actions", stages: ["test", "build", "deploy"] },
    tags: ["cicd", "github", "automation"]
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