
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Megaphone, Send, Archive, Eye, Users, Bell, Filter, Search } from 'lucide-react';
import { useEnhancedAnnouncements, AnnouncementFilters } from '@/hooks/useEnhancedAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import BroadcastAnnouncementDialog from './communication/BroadcastAnnouncementDialog';
import AnnouncementFiltersComponent from './communication/AnnouncementFilters';
import AnnouncementsList from './communication/AnnouncementsList';
import AnnouncementMetrics from './communication/AnnouncementMetrics';

const CommunicationCenterModule = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AnnouncementFilters>({ is_archived: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { 
    announcements, 
    loading, 
    createBroadcastAnnouncement, 
    markAsRead,
    archiveAnnouncement 
  } = useEnhancedAnnouncements(filters);

  const canCreateBroadcast = user?.role && ['edufam_admin', 'elimisha_admin'].includes(user.role);

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateBroadcast = async (announcementData: any) => {
    const { error } = await createBroadcastAnnouncement(announcementData);

    if (!error) {
      toast({
        title: "Success",
        description: "Broadcast announcement sent successfully"
      });
      setIsCreateOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to send broadcast announcement",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading communication center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            EduFam Communication Center
          </h1>
          <p className="text-muted-foreground">
            Broadcast updates and manage communications across all schools
          </p>
        </div>

        {canCreateBroadcast && (
          <BroadcastAnnouncementDialog 
            open={isCreateOpen} 
            onOpenChange={setIsCreateOpen}
            onSubmit={handleCreateBroadcast}
          >
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Send className="w-4 h-4 mr-2" />
              Create Broadcast
            </Button>
          </BroadcastAnnouncementDialog>
        )}
      </div>

      {/* Metrics Overview */}
      <AnnouncementMetrics announcements={announcements} />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Active Communications
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archived
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <AnnouncementFiltersComponent 
              filters={filters} 
              onFiltersChange={(newFilters) => setFilters({ ...newFilters, is_archived: false })}
            />
          </div>

          <AnnouncementsList 
            announcements={filteredAnnouncements}
            onMarkAsRead={markAsRead}
            onArchive={archiveAnnouncement}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search archived announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <AnnouncementFiltersComponent 
              filters={filters} 
              onFiltersChange={(newFilters) => setFilters({ ...newFilters, is_archived: true })}
            />
          </div>

          <AnnouncementsList 
            announcements={filteredAnnouncements.filter(a => a.is_archived)}
            onMarkAsRead={markAsRead}
            onArchive={archiveAnnouncement}
            getPriorityColor={getPriorityColor}
            isArchived={true}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Communication Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {announcements.reduce((sum, a) => sum + a.total_recipients, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Recipients</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {announcements.reduce((sum, a) => sum + a.read_count, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Reads</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {announcements.length > 0 
                      ? Math.round((announcements.reduce((sum, a) => sum + a.read_count, 0) / announcements.reduce((sum, a) => sum + a.total_recipients, 0)) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg. Read Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenterModule;
