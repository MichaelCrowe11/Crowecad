export interface Point {
  x: number;
  y: number;
}

export interface SVGEquipment {
  id: string;
  type: string;
  position: Point;
  rotation: number;
  scale: number;
  properties: Record<string, any>;
}

export interface SVGZone {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export function generateEquipmentSVG(equipment: SVGEquipment): string {
  const { position, rotation, scale, type, properties } = equipment;
  const transform = `translate(${position.x},${position.y}) rotate(${rotation}) scale(${scale})`;

  switch (type) {
    case 'bioreactor':
      return `
        <g class="equipment-svg" data-equipment-id="${equipment.id}" transform="${transform}">
          <rect x="-25" y="-25" width="50" height="50" fill="#E3F2FD" stroke="#1976D2" stroke-width="2" rx="5"/>
          <circle cx="0" cy="0" r="15" fill="#1976D2" opacity="0.3"/>
          <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-primary">${properties.name || 'BR'}</text>
        </g>
      `;
    
    case 'processing':
      return `
        <g class="equipment-svg" data-equipment-id="${equipment.id}" transform="${transform}">
          <rect x="-30" y="-20" width="60" height="40" fill="#FFF3E0" stroke="#FF9800" stroke-width="2" rx="5"/>
          <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-warning">${properties.name || 'PROC'}</text>
        </g>
      `;
    
    case 'storage':
      return `
        <g class="equipment-svg" data-equipment-id="${equipment.id}" transform="${transform}">
          <rect x="-25" y="-30" width="50" height="60" fill="#E8F5E8" stroke="#4CAF50" stroke-width="2" rx="5"/>
          <text x="0" y="4" text-anchor="middle" class="text-xs font-medium fill-success">${properties.name || 'STR'}</text>
        </g>
      `;
    
    case 'environmental':
      return `
        <g class="equipment-svg" data-equipment-id="${equipment.id}" transform="${transform}">
          <rect x="-20" y="-20" width="40" height="40" fill="#F3E5F5" stroke="#9C27B0" stroke-width="2" rx="5"/>
          <text x="0" y="4" text-anchor="middle" class="text-xs font-medium" fill="#9C27B0">${properties.name || 'ENV'}</text>
        </g>
      `;
    
    default:
      return `
        <g class="equipment-svg" data-equipment-id="${equipment.id}" transform="${transform}">
          <rect x="-20" y="-20" width="40" height="40" fill="#F5F5F5" stroke="#666" stroke-width="2" rx="5"/>
          <text x="0" y="4" text-anchor="middle" class="text-xs font-medium" fill="#666">${properties.name || 'EQ'}</text>
        </g>
      `;
  }
}

export function generateZoneSVG(zone: SVGZone): string {
  return `
    <g class="zone-group" data-zone-id="${zone.id}">
      <rect 
        x="${zone.x}" 
        y="${zone.y}" 
        width="${zone.width}" 
        height="${zone.height}" 
        class="zone-overlay" 
        fill="${zone.color}20" 
        stroke="${zone.color}" 
        stroke-width="2" 
        stroke-dasharray="5,5"
      />
      <text 
        x="${zone.x + zone.width / 2}" 
        y="${zone.y - 10}" 
        text-anchor="middle" 
        class="text-sm font-medium" 
        fill="${zone.color}"
      >
        ${zone.name}
      </text>
    </g>
  `;
}

export function generateConnectionSVG(from: Point, to: Point, id: string): string {
  return `
    <line 
      x1="${from.x}" 
      y1="${from.y}" 
      x2="${to.x}" 
      y2="${to.y}" 
      stroke="#666" 
      stroke-width="2" 
      stroke-dasharray="3,3" 
      opacity="0.5"
      data-connection-id="${id}"
    />
  `;
}

export function generateGridSVG(width: number, height: number, gridSize = 20): string {
  return `
    <defs>
      <pattern id="smallGrid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
        <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#E5E7EB" stroke-width="1"/>
      </pattern>
      <pattern id="grid" width="${gridSize * 5}" height="${gridSize * 5}" patternUnits="userSpaceOnUse">
        <rect width="${gridSize * 5}" height="${gridSize * 5}" fill="url(#smallGrid)"/>
        <path d="M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}" fill="none" stroke="#D1D5DB" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
  `;
}

export function snapToGrid(point: Point, gridSize = 20): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}

export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isPointInRect(point: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}
