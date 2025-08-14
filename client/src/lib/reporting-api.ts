import { apiRequest } from "@/lib/queryClient";

export interface ReportGenerationRequest {
  templateId: string;
  facilityId: string;
  parameters?: Record<string, any>;
}

export interface GeneratedReport {
  id: string;
  facilityId: string;
  templateId: string;
  generatedAt: string;
  status: string;
  downloadUrl: string;
  parameters: Record<string, any>;
}

export interface ExternalSystemConfig {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  authType: string;
  credentials: Record<string, any>;
  dataMapping: Record<string, string>;
  isActive: boolean;
}

export interface ConnectionTestResult {
  systemId: string;
  connected: boolean;
  latency: number;
  lastTested: string;
  status: string;
}

export interface ReportSendResult {
  reportId: string;
  systemId: string;
  sent: boolean;
  sentAt: string;
  externalId: string;
  status: string;
}

export interface ReportingAnalytics {
  facilityId: string;
  timeframe: string;
  generatedAt: string;
  metrics: {
    totalReports: number;
    successRate: number;
    averageGenerationTime: number;
    popularTemplates: Array<{ name: string; count: number }>;
    externalSystemUsage: Array<{ systemName: string; reports: number }>;
  };
}

export class ReportingAPI {
  static async generateReport(request: ReportGenerationRequest): Promise<GeneratedReport> {
    const response = await apiRequest('POST', '/api/reports/generate', request);
    return response.json();
  }

  static async downloadReport(reportId: string, format: string = 'pdf'): Promise<Blob> {
    const response = await fetch(`/api/reports/download/${reportId}?format=${format}`);
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    return response.blob();
  }

  static async configureExternalSystem(config: ExternalSystemConfig): Promise<{ success: boolean; systemId: string }> {
    const response = await apiRequest('POST', '/api/external-systems', config);
    return response.json();
  }

  static async testConnection(systemId: string): Promise<ConnectionTestResult> {
    const response = await apiRequest('POST', `/api/external-systems/${systemId}/test`);
    return response.json();
  }

  static async sendReportToExternalSystem(reportId: string, systemId: string): Promise<ReportSendResult> {
    const response = await apiRequest('POST', `/api/reports/${reportId}/send/${systemId}`);
    return response.json();
  }

  static async getAnalytics(facilityId: string, timeframe: string = '30d'): Promise<ReportingAnalytics> {
    const response = await apiRequest('GET', `/api/reports/analytics?facilityId=${facilityId}&timeframe=${timeframe}`);
    return response.json();
  }

  static async scheduleReport(templateId: string, facilityId: string, schedule: {
    frequency: string;
    time?: string;
    recipients: string[];
  }): Promise<{ success: boolean; scheduleId: string }> {
    const response = await apiRequest('POST', '/api/reports/schedule', {
      templateId,
      facilityId,
      schedule
    });
    return response.json();
  }

  static async getScheduledReports(facilityId: string): Promise<Array<{
    id: string;
    templateId: string;
    schedule: any;
    nextRun: string;
    isActive: boolean;
  }>> {
    const response = await apiRequest('GET', `/api/reports/scheduled?facilityId=${facilityId}`);
    return response.json();
  }
}

export default ReportingAPI;