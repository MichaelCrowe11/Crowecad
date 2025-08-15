import { db } from "./db";
import { equipmentTypes } from "@shared/schema";
import { eq } from "drizzle-orm";
import { fileURLToPath } from "url";

const mycologyEquipmentTypes = [
  // Bioreactors
  {
    name: "Stirred Tank Bioreactor",
    category: "bioreactor",
    icon: "fas fa-flask",
    defaultProperties: {
      capacity: "500L",
      temperatureRange: "25-35°C",
      agitationSpeed: "150 RPM",
      sterileDesign: true,
      phControl: true,
      dissolvedOxygenControl: true
    },
    svgTemplate: `
      <rect x="-25" y="-25" width="50" height="50" fill="#E3F2FD" stroke="#1976D2" stroke-width="2" rx="5"/>
      <circle cx="0" cy="0" r="15" fill="#1976D2" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-primary">STR</text>
    `
  },
  {
    name: "Wave Reactor",
    category: "bioreactor",
    icon: "fas fa-flask",
    defaultProperties: {
      capacity: "200L",
      temperatureRange: "20-30°C",
      waveFrequency: "20-40 rpm",
      disposableBag: true,
      sterileDesign: true
    },
    svgTemplate: `
      <rect x="-25" y="-25" width="50" height="50" fill="#E3F2FD" stroke="#1976D2" stroke-width="2" rx="5"/>
      <path d="M-15,-10 Q0,-20 15,-10 Q0,0 -15,-10" fill="#1976D2" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-primary">WR</text>
    `
  },
  {
    name: "Fixed Bed Bioreactor",
    category: "bioreactor",
    icon: "fas fa-flask",
    defaultProperties: {
      capacity: "1000L",
      temperatureRange: "25-30°C",
      flowRate: "1-5 L/min",
      packingMaterial: "ceramic",
      sterileDesign: true
    },
    svgTemplate: `
      <rect x="-30" y="-30" width="60" height="60" fill="#E3F2FD" stroke="#1976D2" stroke-width="2" rx="5"/>
      <rect x="-20" y="-20" width="40" height="40" fill="#1976D2" opacity="0.2"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-primary">FB</text>
    `
  },

  // Environmental Controls
  {
    name: "HVAC System",
    category: "environmental",
    icon: "fas fa-wind",
    defaultProperties: {
      airflow: "1000 CFM",
      filtration: "HEPA",
      temperatureControl: "±1°C",
      humidityControl: "±5%",
      pressurization: "positive"
    },
    svgTemplate: `
      <rect x="-30" y="-20" width="60" height="40" fill="#F3E5F5" stroke="#9C27B0" stroke-width="2" rx="5"/>
      <path d="M-20,-5 L-10,-10 L0,-5 L10,-10 L20,-5" stroke="#9C27B0" stroke-width="2" fill="none"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium" fill="#9C27B0">HVAC</text>
    `
  },
  {
    name: "Incubator",
    category: "environmental",
    icon: "fas fa-thermometer-half",
    defaultProperties: {
      temperatureRange: "20-40°C",
      humidityRange: "60-90%",
      capacity: "100L",
      shelfCount: 4,
      uniformity: "±0.5°C"
    },
    svgTemplate: `
      <rect x="-25" y="-25" width="50" height="50" fill="#F3E5F5" stroke="#9C27B0" stroke-width="2" rx="5"/>
      <circle cx="0" cy="0" r="10" fill="#9C27B0" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium" fill="#9C27B0">INC</text>
    `
  },
  {
    name: "Laminar Flow Hood",
    category: "environmental",
    icon: "fas fa-shield-alt",
    defaultProperties: {
      classification: "Class II Type A2",
      airflow: "100 FPM",
      workSurface: "304 stainless steel",
      uvLamp: true,
      hepaFilter: true
    },
    svgTemplate: `
      <rect x="-35" y="-20" width="70" height="40" fill="#F3E5F5" stroke="#9C27B0" stroke-width="2" rx="5"/>
      <rect x="-30" y="-15" width="60" height="30" fill="#9C27B0" opacity="0.1"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium" fill="#9C27B0">LFH</text>
    `
  },

  // Processing Equipment
  {
    name: "Centrifuge",
    category: "processing",
    icon: "fas fa-cog",
    defaultProperties: {
      capacity: "4L",
      maxSpeed: "15000 RPM",
      temperatureControl: "4-40°C",
      rotorType: "fixed angle",
      gForce: "25000 x g"
    },
    svgTemplate: `
      <circle cx="0" cy="0" r="25" fill="#FFF3E0" stroke="#FF9800" stroke-width="2"/>
      <circle cx="0" cy="0" r="15" fill="#FF9800" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-warning">CFG</text>
    `
  },
  {
    name: "Homogenizer",
    category: "processing",
    icon: "fas fa-cogs",
    defaultProperties: {
      pressure: "1500 bar",
      flowRate: "10-50 L/h",
      passCount: "1-3",
      temperatureControl: true,
      sanitaryDesign: true
    },
    svgTemplate: `
      <rect x="-30" y="-20" width="60" height="40" fill="#FFF3E0" stroke="#FF9800" stroke-width="2" rx="5"/>
      <circle cx="-10" cy="0" r="8" fill="#FF9800" opacity="0.3"/>
      <circle cx="10" cy="0" r="8" fill="#FF9800" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-warning">HOM</text>
    `
  },
  {
    name: "Filtration Unit",
    category: "processing",
    icon: "fas fa-filter",
    defaultProperties: {
      membraneType: "0.22 µm",
      filterArea: "1 m²",
      maxPressure: "3 bar",
      flowRate: "100 L/h",
      sanitaryConnections: true
    },
    svgTemplate: `
      <rect x="-25" y="-25" width="50" height="50" fill="#FFF3E0" stroke="#FF9800" stroke-width="2" rx="5"/>
      <path d="M-15,-15 L15,-15 M-15,-5 L15,-5 M-15,5 L15,5 M-15,15 L15,15" stroke="#FF9800" stroke-width="1"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-warning">FLT</text>
    `
  },

  // Storage Equipment
  {
    name: "Cold Storage Unit",
    category: "storage",
    icon: "fas fa-snowflake",
    defaultProperties: {
      temperature: "2-8°C",
      capacity: "1000L",
      shelving: "adjustable",
      alarmSystem: true,
      dataLogging: true
    },
    svgTemplate: `
      <rect x="-25" y="-30" width="50" height="60" fill="#E8F5E8" stroke="#4CAF50" stroke-width="2" rx="5"/>
      <path d="M-10,-15 L0,-5 L10,-15 M-10,5 L0,15 L10,5" stroke="#4CAF50" stroke-width="2" fill="none"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-success">COLD</text>
    `
  },
  {
    name: "Cryogenic Storage",
    category: "storage",
    icon: "fas fa-warehouse",
    defaultProperties: {
      temperature: "-80°C",
      capacity: "500L",
      rackSystem: "automated",
      backupSystem: "LN2",
      monitoringSystem: true
    },
    svgTemplate: `
      <rect x="-25" y="-30" width="50" height="60" fill="#E8F5E8" stroke="#4CAF50" stroke-width="2" rx="5"/>
      <circle cx="0" cy="-10" r="5" fill="#4CAF50" opacity="0.3"/>
      <circle cx="0" cy="10" r="5" fill="#4CAF50" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-success">CRYO</text>
    `
  },
  {
    name: "Buffer Tank",
    category: "storage",
    icon: "fas fa-warehouse",
    defaultProperties: {
      capacity: "2000L",
      material: "316L stainless steel",
      agitation: "optional",
      temperatureJacket: true,
      cip: true
    },
    svgTemplate: `
      <rect x="-30" y="-35" width="60" height="70" fill="#E8F5E8" stroke="#4CAF50" stroke-width="2" rx="5"/>
      <ellipse cx="0" cy="-30" rx="25" ry="8" fill="#4CAF50" opacity="0.3"/>
      <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-success">TANK</text>
    `
  }
];

export async function seedEquipmentTypes() {
  try {
    console.log("Seeding equipment types...");

    for (const equipmentType of mycologyEquipmentTypes) {
      const existing = await db.query.equipmentTypes.findFirst({
        where: eq(equipmentTypes.name, equipmentType.name),
      });

      if (!existing) {
        await db.insert(equipmentTypes).values(equipmentType);
      }
    }

    console.log("Equipment types seed complete.");
  } catch (error) {
    console.error("Error seeding equipment types:", error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedEquipmentTypes()
    .then(() => {
      console.log("Seed run finished");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
