
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface BroadcastAnnouncementDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const BroadcastAnnouncementDialog: React.FC<BroadcastAnnouncementDialogProps> = ({
  children,
  open,
  onOpenChange,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: [] as string[],
    priority: 'medium',
    delivery_channels: ['web'],
    region: '',
    school_type: '',
    tags: [] as string[],
    expiry_date: '',
    auto_archive_date: undefined as Date | undefined
  });

  const [currentTag, setCurrentTag] = useState('');

  const targetAudienceOptions = [
    { value: 'school_owners', label: 'School Owners' },
    { value: 'principals', label: 'Principals' },
    { value: 'teachers', label: 'Teachers' },
    { value: 'parents', label: 'Parents' },
    { value: 'finance_officers', label: 'Finance Officers' }
  ];

  const deliveryChannelOptions = [
    { value: 'web', label: 'Web Dashboard' },
    { value: 'push', label: 'Push Notifications' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' }
  ];

  const regionOptions = [
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'central', label: 'Central Kenya' },
    { value: 'coast', label: 'Coast' },
    { value: 'eastern', label: 'Eastern' },
    { value: 'north_eastern', label: 'North Eastern' },
    { value: 'nyanza', label: 'Nyanza' },
    { value: 'rift_valley', label: 'Rift Valley' },
    { value: 'western', label: 'Western' }
  ];

  const schoolTypeOptions = [
    { value: 'primary', label: 'Primary Schools' },
    { value: 'secondary', label: 'Secondary Schools' },
    { value: 'mixed', label: 'Mixed Schools' },
    { value: 'private', label: 'Private Schools' },
    { value: 'public', label: 'Public Schools' }
  ];

  const handleAudienceChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        target_audience: [...prev.target_audience, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        target_audience: prev.target_audience.filter(item => item !== value)
      }));
    }
  };

  const handleDeliveryChannelChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        delivery_channels: [...prev.delivery_channels, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        delivery_channels: prev.delivery_channels.filter(item => item !== value)
      }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content || formData.target_audience.length === 0) {
      return;
    }

    const submitData = {
      ...formData,
      auto_archive_date: formData.auto_archive_date 
        ? format(formData.auto_archive_date, 'yyyy-MM-dd')
        : null
    };

    onSubmit(submitData);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      target_audience: [],
      priority: 'medium',
      delivery_channels: ['web'],
      region: '',
      school_type: '',
      tags: [],
      expiry_date: '',
      auto_archive_date: undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Broadcast Announcement</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title"
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content"
                rows={6}
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X className="w-3 h-3 ml-1" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label>Target Audience *</Label>
              <div className="space-y-2 mt-2">
                {targetAudienceOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.target_audience.includes(option.value)}
                      onCheckedChange={(checked) => handleAudienceChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Delivery Channels</Label>
              <div className="space-y-2 mt-2">
                {deliveryChannelOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${option.value}`}
                      checked={formData.delivery_channels.includes(option.value)}
                      onCheckedChange={(checked) => handleDeliveryChannelChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={`channel-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Region (Optional)</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>School Type (Optional)</Label>
              <Select 
                value={formData.school_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, school_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Auto Archive Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.auto_archive_date ? format(formData.auto_archive_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.auto_archive_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, auto_archive_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.content || formData.target_audience.length === 0}
          >
            Send Broadcast
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastAnnouncementDialog;
