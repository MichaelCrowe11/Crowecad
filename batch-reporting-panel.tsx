import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Send, 
  Settings, 
  Calendar, 
  BarChart3, 
  Shield, 
  Cog, 
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BatchReportingService, { ReportTemplate, ExternalSystem, ReportData } from "@/lib/batch-reporting";
import ReportingAPI from "@/lib/reporting-api";

interface BatchReportingPanelProps {
  facilityId: string;
  onReportGenerated?: (reportData: ReportData) => void;
}

export function BatchReportingPanel({ facilityId, onReportGenerated }: BatchReportingPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [externalSystems, setExternalSystems] = useState<ExternalSystem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customParameters, setCustomParameters] = useState<Record<string, any>>({});
  const [generatedReports, setGeneratedReports] = useState<ReportData[]>([]);
  const [showSystemDialog, setShowSystemDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  const { toast } = useToast();
  const reportingService = BatchReportingService.getInstance();

  useEffect(() => {
    loadTemplatesAndSystems();
  }, []);

  const loadTemplatesAndSystems = () => {
    setReportTemplates(reportingService.getReportTemplates());
    setExternalSystems(reportingService.getExternalSystems());
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a report template first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate report using both local service and API
      const localReportData = await reportingService.generateReport(selectedTemplate, facilityId, customParameters);
      
      // Also call the backend API for integration
      const apiReport = await ReportingAPI.generateReport({
        templateId: selectedTemplate,
        facilityId,
        parameters: customParameters
      });

      // Combine both results
      const combinedReportData = {
        ...localReportData,
        apiId: apiReport.id,
        downloadUrl: apiReport.downloadUrl
      };

      setGeneratedReports(prev => [combinedReportData, ...prev]);
      onReportGenerated?.(combinedReportData);
      
      toast({
        title: "Report Generated",
        description: `${localReportData.reportType} report generated successfully`,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (reportData: ReportData, format: string) => {
    try {
      let blob: Blob;
      
      // Use API download if available, otherwise fall back to local generation
      if (reportData.apiId) {
        blob = await ReportingAPI.downloadReport(reportData.apiId, format);
      } else {
        blob = await reportingService.exportReport(reportData, format);
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.reportType}_${reportData.facilityName}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendToExternalSystem = async (reportData: ReportData, systemId: string) => {
    try {
      // Try API first, then fall back to local service
      let success = false;
      let result;
      
      if (reportData.apiId) {
        result = await ReportingAPI.sendReportToExternalSystem(reportData.apiId, systemId);
        success = result.sent;
      } else {
        success = await reportingService.sendToExternalSystem(reportData, systemId);
      }
      
      if (success) {
        toast({
          title: "Report Sent",
          description: result?.externalId 
            ? `Report sent successfully. External ID: ${result.externalId}`
            : "Report successfully sent to external system",
        });
      } else {
        throw new Error("Failed to send report");
      }
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send report to external system",
        variant: "destructive"
      });
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'facility_overview': return <BarChart3 className="w-4 h-4" />;
      case 'equipment_performance': return <Cog className="w-4 h-4" />;
      case 'production_metrics': return <FileText className="w-4 h-4" />;
      case 'compliance_audit': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSystemStatusBadge = (system: ExternalSystem) => {
    return system.isActive ? (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white text-sm">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span>Batch Reporting System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="generate" className="text-xs">Generate</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
              <TabsTrigger value="systems" className="text-xs">Systems</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-300 text-xs">Report Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {reportTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id} className="text-white">
                          <div className="flex items-center space-x-2">
                            {getTemplateIcon(template.type)}
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    <h4 className="text-xs font-medium text-gray-300 mb-2">Template Settings</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Label className="text-gray-400">Format</Label>
                        <Select defaultValue="pdf">
                          <SelectTrigger className="h-8 bg-gray-800 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-400">Timeframe</Label>
                        <Select defaultValue="30d">
                          <SelectTrigger className="h-8 bg-gray-800 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1d">Last Day</SelectItem>
                            <SelectItem value="7d">Last Week</SelectItem>
                            <SelectItem value="30d">Last Month</SelectItem>
                            <SelectItem value="90d">Last Quarter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedTemplate || isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Generated Reports</h4>
                <Badge variant="secondary" className="text-xs">
                  {generatedReports.length} Reports
                </Badge>
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {generatedReports.map((report, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTemplateIcon(report.reportType)}
                            <span className="text-sm font-medium text-white">
                              {report.reportType.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(report.generatedAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            {report.summary.totalEquipment} Equipment • {report.summary.efficiency}% Efficiency
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-xs"
                              onClick={() => handleExportReport(report, 'pdf')}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            {externalSystems.filter(s => s.isActive).length > 0 && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-2 text-xs"
                                onClick={() => handleSendToExternalSystem(report, externalSystems[0].id)}
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {generatedReports.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No reports generated yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="systems" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">External Systems</h4>
                <Dialog open={showSystemDialog} onOpenChange={setShowSystemDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add System
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-600">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add External System</DialogTitle>
                    </DialogHeader>
                    <ExternalSystemForm onSubmit={loadTemplatesAndSystems} onClose={() => setShowSystemDialog(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {externalSystems.map(system => (
                  <Card key={system.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">{system.name}</span>
                        </div>
                        {getSystemStatusBadge(system)}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{system.type.toUpperCase()}</span>
                        <span className="text-gray-400">{system.endpoint}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {externalSystems.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No external systems configured</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Report Templates</h4>
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-600">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Report Template</DialogTitle>
                    </DialogHeader>
                    <ReportTemplateForm onSubmit={loadTemplatesAndSystems} onClose={() => setShowTemplateDialog(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {reportTemplates.map(template => (
                  <Card key={template.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTemplateIcon(template.type)}
                          <span className="text-sm font-medium text-white">{template.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.format.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                      {template.schedule && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{template.schedule.frequency}</span>
                          {template.schedule.time && <span>at {template.schedule.time}</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ExternalSystemForm({ onSubmit, onClose }: { onSubmit: () => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'erp' as const,
    endpoint: '',
    authType: 'api_key' as const,
    apiKey: '',
    username: '',
    password: '',
    token: ''
  });

  const handleSubmit = async () => {
    const system: ExternalSystem = {
      id: `system_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      endpoint: formData.endpoint,
      authType: formData.authType,
      credentials: 
        formData.authType === 'api_key' ? { apiKey: formData.apiKey } :
        formData.authType === 'basic' ? { username: formData.username, password: formData.password } :
        { token: formData.token },
      dataMapping: {},
      isActive: true
    };

    try {
      // Configure system both locally and via API
      BatchReportingService.getInstance().addExternalSystem(system);
      await ReportingAPI.configureExternalSystem(system);
      
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to configure external system:', error);
      // Still add locally even if API fails
      BatchReportingService.getInstance().addExternalSystem(system);
      onSubmit();
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-300">System Name</Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div>
        <Label className="text-gray-300">System Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="erp">ERP System</SelectItem>
            <SelectItem value="mes">MES System</SelectItem>
            <SelectItem value="lims">LIMS</SelectItem>
            <SelectItem value="scada">SCADA</SelectItem>
            <SelectItem value="warehouse">Warehouse Management</SelectItem>
            <SelectItem value="quality">Quality Management</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-gray-300">API Endpoint</Label>
        <Input 
          value={formData.endpoint}
          onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
          placeholder="https://api.example.com/reports"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div>
        <Label className="text-gray-300">Authentication</Label>
        <Select value={formData.authType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, authType: value }))}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api_key">API Key</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.authType === 'api_key' && (
        <div>
          <Label className="text-gray-300">API Key</Label>
          <Input 
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      )}
      {formData.authType === 'basic' && (
        <>
          <div>
            <Label className="text-gray-300">Username</Label>
            <Input 
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Password</Label>
            <Input 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </>
      )}
      {formData.authType === 'bearer' && (
        <div>
          <Label className="text-gray-300">Bearer Token</Label>
          <Input 
            type="password"
            value={formData.token}
            onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      )}
      <div className="flex space-x-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
          Add System
        </Button>
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ReportTemplateForm({ onSubmit, onClose }: { onSubmit: () => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as const,
    format: 'pdf' as const
  });

  const handleSubmit = () => {
    const template: ReportTemplate = {
      id: `template_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      parameters: {},
      format: formData.format
    };

    BatchReportingService.getInstance().addReportTemplate(template);
    onSubmit();
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-300">Template Name</Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div>
        <Label className="text-gray-300">Description</Label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-gray-700 border-gray-600 text-white"
          rows={3}
        />
      </div>
      <div>
        <Label className="text-gray-300">Report Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="facility_overview">Facility Overview</SelectItem>
            <SelectItem value="equipment_performance">Equipment Performance</SelectItem>
            <SelectItem value="production_metrics">Production Metrics</SelectItem>
            <SelectItem value="compliance_audit">Compliance Audit</SelectItem>
            <SelectItem value="custom">Custom Report</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-gray-300">Output Format</Label>
        <Select value={formData.format} onValueChange={(value: any) => setFormData(prev => ({ ...prev, format: value }))}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex space-x-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
          Add Template
        </Button>
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default BatchReportingPanel;