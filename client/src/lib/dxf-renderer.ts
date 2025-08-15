import DxfParser from 'dxf-parser';
import { DxfWriter, point3d } from '@tarikjabiri/dxf';
import * as THREE from 'three';
import type { SVGEquipment, SVGZone, Point } from './svg-utils';

interface DxfEntity {
  type: string;
  vertices?: any[];
  center?: any;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  text?: string;
  layer?: string;
  color?: number;
  lineType?: string;
}

interface DxfLayer {
  name: string;
  color: number;
  lineType: string;
  visible: boolean;
}

export class DxfRenderer {
  private parser: DxfParser;
  private scene: THREE.Scene;
  private materials: Map<number, THREE.LineBasicMaterial>;

  constructor() {
    this.parser = new DxfParser();
    this.scene = new THREE.Scene();
    this.materials = new Map();
    this.initializeMaterials();
  }

  private initializeMaterials() {
    // AutoCAD color index to RGB mapping (simplified)
    const aciColors = [
      0x000000, 0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF,
      0x0000FF, 0xFF00FF, 0xFFFFFF, 0x808080, 0xC0C0C0
    ];

    aciColors.forEach((color, index) => {
      this.materials.set(index, new THREE.LineBasicMaterial({ color }));
    });
  }

  /**
   * Parse DXF file content and return parsed structure
   */
  parseDxf(dxfContent: string): any {
    try {
      const dxf = this.parser.parseSync(dxfContent);
      return dxf;
    } catch (error) {
      console.error('Error parsing DXF file:', error);
      throw new Error('Failed to parse DXF file');
    }
  }

  /**
   * Convert DXF entities to Three.js objects for rendering
   */
  dxfToThreeJS(dxfData: any): THREE.Group {
    const group = new THREE.Group();

    if (dxfData.entities) {
      dxfData.entities.forEach((entity: DxfEntity) => {
        const object = this.convertEntityToThreeJS(entity);
        if (object) {
          group.add(object);
        }
      });
    }

    return group;
  }

  private convertEntityToThreeJS(entity: DxfEntity): THREE.Object3D | null {
    const material = this.materials.get(entity.color || 7) || this.materials.get(7)!;

    switch (entity.type) {
      case 'LINE':
        return this.createLine(entity, material);
      
      case 'CIRCLE':
        return this.createCircle(entity, material);
      
      case 'ARC':
        return this.createArc(entity, material);
      
      case 'POLYLINE':
      case 'LWPOLYLINE':
        return this.createPolyline(entity, material);
      
      case 'TEXT':
      case 'MTEXT':
        // Text rendering would require additional libraries
        return null;
      
      default:
        console.warn(`Unsupported DXF entity type: ${entity.type}`);
        return null;
    }
  }

  private createLine(entity: any, material: THREE.LineBasicMaterial): THREE.Line {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      entity.vertices[0].x, entity.vertices[0].y, entity.vertices[0].z || 0,
      entity.vertices[1].x, entity.vertices[1].y, entity.vertices[1].z || 0
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return new THREE.Line(geometry, material);
  }

  private createCircle(entity: any, material: THREE.LineBasicMaterial): THREE.Line {
    const curve = new THREE.EllipseCurve(
      entity.center.x, entity.center.y,
      entity.radius, entity.radius,
      0, 2 * Math.PI,
      false,
      0
    );
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  private createArc(entity: any, material: THREE.LineBasicMaterial): THREE.Line {
    const curve = new THREE.EllipseCurve(
      entity.center.x, entity.center.y,
      entity.radius, entity.radius,
      entity.startAngle * Math.PI / 180,
      entity.endAngle * Math.PI / 180,
      false,
      0
    );
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  private createPolyline(entity: any, material: THREE.LineBasicMaterial): THREE.Line {
    const points: THREE.Vector3[] = [];
    entity.vertices.forEach((vertex: any) => {
      points.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z || 0));
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  /**
   * Convert DXF to SVG format for display in facility canvas
   */
  dxfToSvg(dxfData: any, width: number = 1200, height: number = 800): string {
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += '<g transform="scale(1, -1) translate(0, -800)">';

    if (dxfData.entities) {
      dxfData.entities.forEach((entity: DxfEntity) => {
        const svgElement = this.convertEntityToSvg(entity);
        if (svgElement) {
          svg += svgElement;
        }
      });
    }

    svg += '</g>';
    svg += '</svg>';
    return svg;
  }

  private convertEntityToSvg(entity: DxfEntity): string | null {
    const color = this.getColorHex(entity.color || 7);
    const strokeWidth = 1;

    switch (entity.type) {
      case 'LINE':
        if (entity.vertices && entity.vertices.length >= 2) {
          return `<line x1="${entity.vertices[0].x}" y1="${entity.vertices[0].y}" 
                        x2="${entity.vertices[1].x}" y2="${entity.vertices[1].y}" 
                        stroke="${color}" stroke-width="${strokeWidth}"/>`;
        }
        break;

      case 'CIRCLE':
        if (entity.center && entity.radius) {
          return `<circle cx="${entity.center.x}" cy="${entity.center.y}" 
                         r="${entity.radius}" 
                         fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
        }
        break;

      case 'ARC':
        if (entity.center && entity.radius && entity.startAngle !== undefined && entity.endAngle !== undefined) {
          const start = this.polarToCartesian(entity.center.x, entity.center.y, entity.radius, entity.endAngle);
          const end = this.polarToCartesian(entity.center.x, entity.center.y, entity.radius, entity.startAngle);
          const largeArcFlag = entity.endAngle - entity.startAngle <= 180 ? "0" : "1";
          
          return `<path d="M ${start.x} ${start.y} A ${entity.radius} ${entity.radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}"
                        fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
        }
        break;

      case 'POLYLINE':
      case 'LWPOLYLINE':
        if (entity.vertices && entity.vertices.length > 0) {
          let path = `M ${entity.vertices[0].x} ${entity.vertices[0].y}`;
          for (let i = 1; i < entity.vertices.length; i++) {
            path += ` L ${entity.vertices[i].x} ${entity.vertices[i].y}`;
          }
          return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
        }
        break;

      case 'TEXT':
      case 'MTEXT':
        if (entity.text && entity.vertices && entity.vertices.length > 0) {
          return `<text x="${entity.vertices[0].x}" y="${entity.vertices[0].y}" 
                       fill="${color}" font-size="12">${entity.text}</text>`;
        }
        break;
    }

    return null;
  }

  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  private getColorHex(aciColor: number): string {
    const colors = [
      '#000000', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF',
      '#0000FF', '#FF00FF', '#FFFFFF', '#808080', '#C0C0C0'
    ];
    return colors[aciColor] || '#FFFFFF';
  }

  /**
   * Export facility design to DXF format
   */
  exportToDxf(equipment: SVGEquipment[], zones: SVGZone[], facilityName: string = 'Mycology Facility'): string {
    const dxf = new DxfWriter();

    // Add layers with color codes (ACI color index)
    dxf.addLayer('Equipment', 5, 'CONTINUOUS'); // Blue
    dxf.addLayer('Zones', 3, 'DASHED'); // Green
    dxf.addLayer('Grid', 8, 'CONTINUOUS'); // Gray
    dxf.addLayer('Annotations', 1, 'CONTINUOUS'); // Red

    // Add title block
    dxf.currentLayer = 'Annotations';
    dxf.addText(point3d(10, 780, 0), 20, facilityName);
    dxf.addText(point3d(10, 750, 0), 12, `Generated: ${new Date().toLocaleDateString()}`);
    dxf.addText(point3d(10, 730, 0), 12, 'MycoCAD Pro v2.0');

    // Add grid
    dxf.currentLayer = 'Grid';
    for (let x = 0; x <= 1200; x += 100) {
      dxf.addLine(point3d(x, 0, 0), point3d(x, 800, 0));
    }
    for (let y = 0; y <= 800; y += 100) {
      dxf.addLine(point3d(0, y, 0), point3d(1200, y, 0));
    }

    // Add zones
    dxf.currentLayer = 'Zones';
    zones.forEach(zone => {
      // Draw zone rectangle
      const points = [
        point3d(zone.x, zone.y, 0),
        point3d(zone.x + zone.width, zone.y, 0),
        point3d(zone.x + zone.width, zone.y + zone.height, 0),
        point3d(zone.x, zone.y + zone.height, 0),
        point3d(zone.x, zone.y, 0) // Close the polyline
      ];
      dxf.addPolyline3D(points);

      // Add zone label
      dxf.addText(
        point3d(zone.x + zone.width / 2, zone.y + zone.height / 2, 0),
        10,
        zone.name
      );
    });

    // Add equipment
    dxf.currentLayer = 'Equipment';
    equipment.forEach(eq => {
      const x = eq.position.x;
      const y = eq.position.y;
      const size = 30 * eq.scale;

      switch (eq.type) {
        case 'bioreactor':
          // Draw as circle
          dxf.addCircle(point3d(x, y, 0), size / 2);
          dxf.addText(point3d(x, y, 0), 8, eq.properties.name || 'BR');
          break;

        case 'processing':
        case 'storage':
        case 'environmental':
        default:
          // Draw as rectangle
          const halfSize = size / 2;
          const rectPoints = [
            point3d(x - halfSize, y - halfSize, 0),
            point3d(x + halfSize, y - halfSize, 0),
            point3d(x + halfSize, y + halfSize, 0),
            point3d(x - halfSize, y + halfSize, 0),
            point3d(x - halfSize, y - halfSize, 0)
          ];
          dxf.addPolyline3D(rectPoints);
          
          // Add equipment label
          dxf.addText(point3d(x, y, 0), 8, eq.properties.name || eq.type.toUpperCase());
          break;
      }

      // Add equipment properties as attributes
      if (eq.properties.capacity) {
        dxf.addText(
          point3d(x, y - size / 2 - 10, 0),
          6,
          `Cap: ${eq.properties.capacity}`
        );
      }
    });

    // Generate DXF string
    return dxf.stringify();
  }

  /**
   * Import DXF and convert to facility equipment and zones
   */
  importFromDxf(dxfContent: string): { equipment: SVGEquipment[], zones: SVGZone[] } {
    const dxfData = this.parseDxf(dxfContent);
    const equipment: SVGEquipment[] = [];
    const zones: SVGZone[] = [];

    if (!dxfData || !dxfData.entities) {
      return { equipment, zones };
    }

    // Group entities by layer
    const layerGroups = new Map<string, any[]>();
    dxfData.entities.forEach((entity: any) => {
      const layer = entity.layer || 'default';
      if (!layerGroups.has(layer)) {
        layerGroups.set(layer, []);
      }
      layerGroups.get(layer)!.push(entity);
    });

    // Process equipment layer
    const equipmentEntities = layerGroups.get('Equipment') || [];
    equipmentEntities.forEach((entity, index) => {
      if (entity.type === 'CIRCLE') {
        equipment.push({
          id: `imported-eq-${index}`,
          type: 'bioreactor',
          position: { x: entity.center.x, y: entity.center.y },
          rotation: 0,
          scale: (entity.radius * 2) / 30,
          properties: { name: `Imported-${index}` }
        });
      } else if (entity.type === 'POLYLINE' || entity.type === 'LWPOLYLINE') {
        // Calculate center of polyline
        const center = this.calculateCenter(entity.vertices);
        equipment.push({
          id: `imported-eq-${index}`,
          type: 'processing',
          position: center,
          rotation: 0,
          scale: 1,
          properties: { name: `Imported-${index}` }
        });
      }
    });

    // Process zones layer
    const zoneEntities = layerGroups.get('Zones') || [];
    zoneEntities.forEach((entity, index) => {
      if ((entity.type === 'POLYLINE' || entity.type === 'LWPOLYLINE') && entity.vertices.length >= 4) {
        const bounds = this.calculateBounds(entity.vertices);
        zones.push({
          id: `imported-zone-${index}`,
          name: `Zone ${index + 1}`,
          type: 'processing',
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY,
          color: '#4CAF50'
        });
      }
    });

    return { equipment, zones };
  }

  private calculateCenter(vertices: any[]): Point {
    const sum = vertices.reduce((acc, v) => ({
      x: acc.x + v.x,
      y: acc.y + v.y
    }), { x: 0, y: 0 });

    return {
      x: sum.x / vertices.length,
      y: sum.y / vertices.length
    };
  }

  private calculateBounds(vertices: any[]) {
    const xs = vertices.map(v => v.x);
    const ys = vertices.map(v => v.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }
}

// Export singleton instance
export const dxfRenderer = new DxfRenderer();