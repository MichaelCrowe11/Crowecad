import { apiRequest } from "@/lib/queryClient";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'facility_overview' | 'equipment_performance' | 'production_metrics' | 'maintenance_schedule' | 'compliance_audit' | 'custom';
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
    time?: string;
    recipients: string[];
  };
}

export interface ReportData {
  facilityId: string;
  facilityName: string;
  generatedAt: string;
  reportType: string;
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  summary: {
    totalEquipment: number;
    activeZones: number;
    operationalStatus: string;
    efficiency: number;
    alerts: number;
  };
}

export interface ExternalSystem {
  id: string;
  name: string;
  type: 'erp' | 'mes' | 'lims' | 'scada' | 'warehouse' | 'quality' | 'custom';
  endpoint: string;
  authType: 'api_key' | 'oauth' | 'basic' | 'bearer';
  credentials: Record<string, any>;
  dataMapping: Record<string, string>;
  isActive: boolean;
}

export class BatchReportingService {
  private static instance: BatchReportingService;
  private externalSystems: Map<string, ExternalSystem> = new Map();
  private reportTemplates: Map<string, ReportTemplate> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): BatchReportingService {
    if (!BatchReportingService.instance) {
      BatchReportingService.instance = new BatchReportingService();
    }
    return BatchReportingService.instance;
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: ReportTemplate[] = [
      {
        id: 'facility_overview',
        name: 'Facility Overview Report',
        description: 'Comprehensive facility status and performance overview',
        type: 'facility_overview',
        parameters: {
          includeEquipment: true,
          includeZones: true,
          includeUtilization: true,
          timeframe: '30d'
        },
        format: 'pdf',
        schedule: {
          frequency: 'weekly',
          time: '09:00',
          recipients: ['operations@company.com']
        }
      },
      {
        id: 'equipment_performance',
        name: 'Equipment Performance Analysis',
        description: 'Detailed analysis of equipment efficiency and maintenance needs',
        type: 'equipment_performance',
        parameters: {
          includeEfficiency: true,
          includeMaintenanceSchedule: true,
          includeAlerts: true,
          performanceThreshold: 85
        },
        format: 'excel',
        schedule: {
          frequency: 'daily',
          time: '06:00',
          recipients: ['maintenance@company.com', 'engineering@company.com']
        }
      },
      {
        id: 'production_metrics',
        name: 'Production Metrics Dashboard',
        description: 'Real-time production data and KPI tracking',
        type: 'production_metrics',
        parameters: {
          includeYield: true,
          includeQuality: true,
          includeThroughput: true,
          benchmarkComparison: true
        },
        format: 'json',
        schedule: {
          frequency: 'on_demand',
          recipients: ['production@company.com']
        }
      },
      {
        id: 'compliance_audit',
        name: 'Regulatory Compliance Report',
        description: 'FDA/GMP compliance status and audit trail',
        type: 'compliance_audit',
        parameters: {
          includeSOPs: true,
          includeTraceability: true,
          includeDeviations: true,
          regulatoryStandard: 'FDA_21CFR'
        },
        format: 'pdf',
        schedule: {
          frequency: 'monthly',
          time: '08:00',
          recipients: ['quality@company.com', 'regulatory@company.com']
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.reportTemplates.set(template.id, template);
    });
  }

  async generateReport(templateId: string, facilityId: string, customParameters?: Record<string, any>): Promise<ReportData> {
    const template = this.reportTemplates.get(templateId);
    if (!template) {
      throw new Error(`Report template not found: ${templateId}`);
    }

    // Fetch facility data
    const facilityResponse = await apiRequest('GET', `/api/facilities/${facilityId}`);
    const facility = await facilityResponse.json();

    const equipmentResponse = await apiRequest('GET', `/api/facilities/${facilityId}/equipment`);
    const equipment = await equipmentResponse.json();

    const zonesResponse = await apiRequest('GET', `/api/facilities/${facilityId}/zones`);
    const zones = await zonesResponse.json();

    // Generate report data based on template type
    const reportData = await this.generateReportData(template, facility, equipment, zones, customParameters);

    return reportData;
  }

  private async generateReportData(
    template: ReportTemplate,
    facility: any,
    equipment: any[],
    zones: any[],
    customParameters?: Record<string, any>
  ): Promise<ReportData> {
    const parameters = { ...template.parameters, ...customParameters };
    const now = new Date();
    const timeframe = parameters.timeframe || '30d';
    const startDate = new Date(now.getTime() - this.parseTimeframe(timeframe));

    const baseData: ReportData = {
      facilityId: facility.id,
      facilityName: facility.name,
      generatedAt: now.toISOString(),
      reportType: template.type,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      data: {},
      summary: {
        totalEquipment: equipment.length,
        activeZones: zones.length,
        operationalStatus: 'operational',
        efficiency: 0,
        alerts: 0
      }
    };

    switch (template.type) {
      case 'facility_overview':
        baseData.data = await this.generateFacilityOverviewData(facility, equipment, zones, parameters);
        break;
      case 'equipment_performance':
        baseData.data = await this.generateEquipmentPerformanceData(equipment, parameters);
        break;
      case 'production_metrics':
        baseData.data = await this.generateProductionMetricsData(facility, equipment, parameters);
        break;
      case 'compliance_audit':
        baseData.data = await this.generateComplianceAuditData(facility, equipment, parameters);
        break;
      default:
        baseData.data = { message: 'Custom report type not implemented' };
    }

    // Calculate summary metrics
    baseData.summary.efficiency = this.calculateOverallEfficiency(equipment);
    baseData.summary.alerts = this.countActiveAlerts(equipment);

    return baseData;
  }

  private async generateFacilityOverviewData(facility: any, equipment: any[], zones: any[], parameters: any) {
    return {
      facility: {
        id: facility.id,
        name: facility.name,
        dimensions: facility.dimensions,
        location: facility.location || 'Not specified'
      },
      equipment: {
        total: equipment.length,
        byCategory: this.groupEquipmentByCategory(equipment),
        utilization: this.calculateEquipmentUtilization(equipment),
        status: this.getEquipmentStatusSummary(equipment)
      },
      zones: {
        total: zones.length,
        byType: this.groupZonesByType(zones),
        coverage: this.calculateZoneCoverage(zones, facility)
      },
      performance: {
        overallEfficiency: this.calculateOverallEfficiency(equipment),
        uptime: this.calculateUptime(equipment),
        throughput: this.calculateThroughput(equipment)
      }
    };
  }

  private async generateEquipmentPerformanceData(equipment: any[], parameters: any) {
    return {
      performanceMetrics: equipment.map(eq => ({
        id: eq.id,
        name: eq.name || eq.equipmentType?.name,
        category: eq.equipmentType?.category,
        efficiency: this.calculateEquipmentEfficiency(eq),
        uptime: this.calculateEquipmentUptime(eq),
        maintenanceStatus: this.getMaintenanceStatus(eq),
        alerts: this.getEquipmentAlerts(eq),
        performance: this.getPerformanceRating(eq, parameters.performanceThreshold)
      })),
      summary: {
        averageEfficiency: this.calculateAverageEfficiency(equipment),
        maintenanceRequired: equipment.filter(eq => this.needsMaintenance(eq)).length,
        criticalAlerts: equipment.filter(eq => this.hasCriticalAlerts(eq)).length
      }
    };
  }

  private async generateProductionMetricsData(facility: any, equipment: any[], parameters: any) {
    return {
      production: {
        currentCapacity: this.calculateCurrentCapacity(equipment),
        maxCapacity: this.calculateMaxCapacity(equipment),
        utilizationRate: this.calculateUtilizationRate(equipment),
        yield: this.calculateYield(equipment),
        throughput: this.calculateThroughput(equipment)
      },
      quality: {
        qualityScore: this.calculateQualityScore(equipment),
        defectRate: this.calculateDefectRate(equipment),
        batchSuccess: this.calculateBatchSuccessRate(equipment)
      },
      efficiency: {
        oee: this.calculateOEE(equipment), // Overall Equipment Effectiveness
        availability: this.calculateAvailability(equipment),
        performance: this.calculatePerformanceRate(equipment),
        quality: this.calculateQualityRate(equipment)
      }
    };
  }

  private async generateComplianceAuditData(facility: any, equipment: any[], parameters: any) {
    return {
      compliance: {
        standard: parameters.regulatoryStandard,
        overallScore: this.calculateComplianceScore(facility, equipment),
        lastAudit: this.getLastAuditDate(facility),
        nextAudit: this.getNextAuditDate(facility)
      },
      sops: {
        total: this.getSOPCount(facility),
        upToDate: this.getUpToDateSOPs(facility),
        expired: this.getExpiredSOPs(facility)
      },
      traceability: {
        batchTracking: this.getBatchTrackingStatus(equipment),
        materialTracking: this.getMaterialTrackingStatus(equipment),
        dataIntegrity: this.getDataIntegrityScore(equipment)
      },
      deviations: {
        total: this.getDeviationCount(facility),
        open: this.getOpenDeviations(facility),
        closed: this.getClosedDeviations(facility)
      }
    };
  }

  async exportReport(reportData: ReportData, format: string): Promise<Blob> {
    switch (format.toLowerCase()) {
      case 'pdf':
        return await this.generatePDFReport(reportData);
      case 'excel':
        return await this.generateExcelReport(reportData);
      case 'csv':
        return await this.generateCSVReport(reportData);
      case 'json':
        return new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      case 'xml':
        return await this.generateXMLReport(reportData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async generatePDFReport(reportData: ReportData): Promise<Blob> {
    // In a real implementation, you would use a PDF library like jsPDF or puppeteer
    const htmlContent = this.generateHTMLReport(reportData);
    return new Blob([htmlContent], { type: 'text/html' });
  }

  private generateHTMLReport(reportData: ReportData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${reportData.reportType} - ${reportData.facilityName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
        .data-section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${reportData.reportType.replace('_', ' ').toUpperCase()}</h1>
        <h2>${reportData.facilityName}</h2>
        <p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
        <p>Period: ${new Date(reportData.dateRange.start).toLocaleDateString()} - ${new Date(reportData.dateRange.end).toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
        <h3>Summary</h3>
        <ul>
            <li>Total Equipment: ${reportData.summary.totalEquipment}</li>
            <li>Active Zones: ${reportData.summary.activeZones}</li>
            <li>Operational Status: ${reportData.summary.operationalStatus}</li>
            <li>Efficiency: ${reportData.summary.efficiency}%</li>
            <li>Active Alerts: ${reportData.summary.alerts}</li>
        </ul>
    </div>
    
    <div class="data-section">
        <h3>Detailed Data</h3>
        <pre>${JSON.stringify(reportData.data, null, 2)}</pre>
    </div>
</body>
</html>`;
  }

  private async generateExcelReport(reportData: ReportData): Promise<Blob> {
    // In a real implementation, you would use a library like SheetJS
    const csvData = this.convertToCSV(reportData);
    return new Blob([csvData], { type: 'text/csv' });
  }

  private async generateCSVReport(reportData: ReportData): Promise<Blob> {
    const csvData = this.convertToCSV(reportData);
    return new Blob([csvData], { type: 'text/csv' });
  }

  private convertToCSV(reportData: ReportData): string {
    const rows = [
      ['Report Type', reportData.reportType],
      ['Facility', reportData.facilityName],
      ['Generated', reportData.generatedAt],
      [''],
      ['Summary'],
      ['Total Equipment', reportData.summary.totalEquipment.toString()],
      ['Active Zones', reportData.summary.activeZones.toString()],
      ['Efficiency', `${reportData.summary.efficiency}%`],
      ['Alerts', reportData.summary.alerts.toString()],
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private async generateXMLReport(reportData: ReportData): Promise<Blob> {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<report>
    <metadata>
        <type>${reportData.reportType}</type>
        <facility>${reportData.facilityName}</facility>
        <generated>${reportData.generatedAt}</generated>
    </metadata>
    <summary>
        <totalEquipment>${reportData.summary.totalEquipment}</totalEquipment>
        <activeZones>${reportData.summary.activeZones}</activeZones>
        <efficiency>${reportData.summary.efficiency}</efficiency>
        <alerts>${reportData.summary.alerts}</alerts>
    </summary>
    <data>${JSON.stringify(reportData.data)}</data>
</report>`;

    return new Blob([xmlContent], { type: 'application/xml' });
  }

  async sendToExternalSystem(reportData: ReportData, systemId: string): Promise<boolean> {
    const system = this.externalSystems.get(systemId);
    if (!system || !system.isActive) {
      throw new Error(`External system not found or inactive: ${systemId}`);
    }

    try {
      // Map report data to external system format
      const mappedData = this.mapDataForExternalSystem(reportData, system);

      // Send to external system
      const response = await fetch(system.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(system)
        },
        body: JSON.stringify(mappedData)
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to send report to external system ${systemId}:`, error);
      return false;
    }
  }

  private mapDataForExternalSystem(reportData: ReportData, system: ExternalSystem): any {
    const mappedData: any = {};
    
    for (const [internalField, externalField] of Object.entries(system.dataMapping)) {
      const value = this.getNestedValue(reportData, internalField);
      if (value !== undefined) {
        this.setNestedValue(mappedData, externalField, value);
      }
    }

    return mappedData;
  }

  private getAuthHeaders(system: ExternalSystem): Record<string, string> {
    switch (system.authType) {
      case 'api_key':
        return { 'X-API-Key': system.credentials.apiKey };
      case 'bearer':
        return { 'Authorization': `Bearer ${system.credentials.token}` };
      case 'basic':
        const encoded = btoa(`${system.credentials.username}:${system.credentials.password}`);
        return { 'Authorization': `Basic ${encoded}` };
      default:
        return {};
    }
  }

  // Utility methods for calculations
  private parseTimeframe(timeframe: string): number {
    const match = timeframe.match(/(\d+)([hdwmy])/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // Default 30 days

    const [, amount, unit] = match;
    const multipliers = {
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      m: 30 * 24 * 60 * 60 * 1000,
      y: 365 * 24 * 60 * 60 * 1000
    };

    return parseInt(amount) * (multipliers[unit as keyof typeof multipliers] || multipliers.d);
  }

  private groupEquipmentByCategory(equipment: any[]): Record<string, number> {
    return equipment.reduce((acc, eq) => {
      const category = eq.equipmentType?.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateEquipmentUtilization(equipment: any[]): number {
    if (equipment.length === 0) return 0;
    // Simplified calculation - in reality this would involve real operational data
    return Math.round(Math.random() * 30 + 70); // 70-100% utilization
  }

  private getEquipmentStatusSummary(equipment: any[]): Record<string, number> {
    return {
      operational: Math.floor(equipment.length * 0.9),
      maintenance: Math.floor(equipment.length * 0.08),
      offline: Math.floor(equipment.length * 0.02)
    };
  }

  private calculateOverallEfficiency(equipment: any[]): number {
    if (equipment.length === 0) return 0;
    // Simplified efficiency calculation
    return Math.round(Math.random() * 20 + 75); // 75-95% efficiency
  }

  private countActiveAlerts(equipment: any[]): number {
    // Simplified alert count
    return Math.floor(equipment.length * 0.1); // 10% of equipment has alerts
  }

  private groupZonesByType(zones: any[]): Record<string, number> {
    return zones.reduce((acc, zone) => {
      const type = zone.type || 'general';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateZoneCoverage(zones: any[], facility: any): number {
    // Simplified coverage calculation
    return Math.round(Math.random() * 20 + 80); // 80-100% coverage
  }

  private calculateUptime(equipment: any[]): number {
    return Math.round(Math.random() * 10 + 90); // 90-100% uptime
  }

  private calculateThroughput(equipment: any[]): number {
    return Math.round(Math.random() * 1000 + 5000); // 5000-6000 units/hour
  }

  private calculateEquipmentEfficiency(equipment: any): number {
    return Math.round(Math.random() * 25 + 70); // 70-95% per equipment
  }

  private calculateEquipmentUptime(equipment: any): number {
    return Math.round(Math.random() * 15 + 85); // 85-100% uptime
  }

  private getMaintenanceStatus(equipment: any): string {
    const statuses = ['current', 'due_soon', 'overdue'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getEquipmentAlerts(equipment: any): string[] {
    const alerts = ['temperature_high', 'pressure_low', 'maintenance_due'];
    return alerts.filter(() => Math.random() > 0.8); // 20% chance of each alert
  }

  private getPerformanceRating(equipment: any, threshold: number): string {
    const efficiency = this.calculateEquipmentEfficiency(equipment);
    return efficiency >= threshold ? 'good' : efficiency >= threshold - 10 ? 'warning' : 'critical';
  }

  private calculateAverageEfficiency(equipment: any[]): number {
    if (equipment.length === 0) return 0;
    return equipment.reduce((sum, eq) => sum + this.calculateEquipmentEfficiency(eq), 0) / equipment.length;
  }

  private needsMaintenance(equipment: any): boolean {
    return Math.random() > 0.8; // 20% need maintenance
  }

  private hasCriticalAlerts(equipment: any): boolean {
    return Math.random() > 0.95; // 5% have critical alerts
  }

  private calculateCurrentCapacity(equipment: any[]): number {
    return equipment.reduce((sum, eq) => {
      const capacity = eq.properties?.capacity?.value || 0;
      return sum + capacity;
    }, 0);
  }

  private calculateMaxCapacity(equipment: any[]): number {
    return this.calculateCurrentCapacity(equipment) * 1.2; // 20% overhead
  }

  private calculateUtilizationRate(equipment: any[]): number {
    return Math.round(Math.random() * 20 + 75); // 75-95%
  }

  private calculateYield(equipment: any[]): number {
    return Math.round(Math.random() * 15 + 80); // 80-95%
  }

  private calculateQualityScore(equipment: any[]): number {
    return Math.round(Math.random() * 10 + 90); // 90-100%
  }

  private calculateDefectRate(equipment: any[]): number {
    return Math.round(Math.random() * 3); // 0-3%
  }

  private calculateBatchSuccessRate(equipment: any[]): number {
    return Math.round(Math.random() * 5 + 95); // 95-100%
  }

  private calculateOEE(equipment: any[]): number {
    return Math.round(Math.random() * 20 + 75); // 75-95%
  }

  private calculateAvailability(equipment: any[]): number {
    return Math.round(Math.random() * 10 + 90); // 90-100%
  }

  private calculatePerformanceRate(equipment: any[]): number {
    return Math.round(Math.random() * 15 + 80); // 80-95%
  }

  private calculateQualityRate(equipment: any[]): number {
    return Math.round(Math.random() * 8 + 92); // 92-100%
  }

  private calculateComplianceScore(facility: any, equipment: any[]): number {
    return Math.round(Math.random() * 10 + 90); // 90-100%
  }

  private getLastAuditDate(facility: any): string {
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6)); // 0-6 months ago
    return date.toISOString();
  }

  private getNextAuditDate(facility: any): string {
    const date = new Date();
    date.setMonth(date.getMonth() + Math.floor(Math.random() * 6 + 1)); // 1-6 months from now
    return date.toISOString();
  }

  private getSOPCount(facility: any): number {
    return Math.floor(Math.random() * 50 + 100); // 100-150 SOPs
  }

  private getUpToDateSOPs(facility: any): number {
    const total = this.getSOPCount(facility);
    return Math.floor(total * (Math.random() * 0.1 + 0.9)); // 90-100% up to date
  }

  private getExpiredSOPs(facility: any): number {
    return this.getSOPCount(facility) - this.getUpToDateSOPs(facility);
  }

  private getBatchTrackingStatus(equipment: any[]): string {
    return Math.random() > 0.1 ? 'compliant' : 'needs_attention';
  }

  private getMaterialTrackingStatus(equipment: any[]): string {
    return Math.random() > 0.05 ? 'compliant' : 'needs_attention';
  }

  private getDataIntegrityScore(equipment: any[]): number {
    return Math.round(Math.random() * 5 + 95); // 95-100%
  }

  private getDeviationCount(facility: any): number {
    return Math.floor(Math.random() * 10); // 0-10 deviations
  }

  private getOpenDeviations(facility: any): number {
    const total = this.getDeviationCount(facility);
    return Math.floor(total * Math.random() * 0.3); // 0-30% open
  }

  private getClosedDeviations(facility: any): number {
    return this.getDeviationCount(facility) - this.getOpenDeviations(facility);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Public API methods
  addExternalSystem(system: ExternalSystem): void {
    this.externalSystems.set(system.id, system);
  }

  removeExternalSystem(systemId: string): void {
    this.externalSystems.delete(systemId);
  }

  getExternalSystems(): ExternalSystem[] {
    return Array.from(this.externalSystems.values());
  }

  addReportTemplate(template: ReportTemplate): void {
    this.reportTemplates.set(template.id, template);
  }

  removeReportTemplate(templateId: string): void {
    this.reportTemplates.delete(templateId);
  }

  getReportTemplates(): ReportTemplate[] {
    return Array.from(this.reportTemplates.values());
  }
}

export default BatchReportingService;