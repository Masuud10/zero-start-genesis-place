
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, X, AlertCircle, Users, Globe, Target, Send } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const targetAudienceOptions = [
    { value: 'school_owners', label: 'School Owners', icon: Users, description: 'School management and owners' },
    { value: 'principals', label: 'Principals', icon: Target, description: 'School principals and head teachers' },
    { value: 'teachers', label: 'Teachers', icon: Users, description: 'Teaching staff' },
    { value: 'parents', label: 'Parents', icon: Users, description: 'Student parents and guardians' },
    { value: 'finance_officers', label: 'Finance Officers', icon: Target, description: 'Financial management staff' }
  ];

  const deliveryChannelOptions = [
    { value: 'web', label: 'Web Dashboard', description: 'Show in user dashboards' },
    { value: 'push', label: 'Push Notifications', description: 'Mobile app notifications' },
    { value: 'email', label: 'Email', description: 'Send via email' },
    { value: 'sms', label: 'SMS', description: 'Text message alerts' }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.target_audience.length === 0) {
      newErrors.target_audience = 'Please select at least one target audience';
    }

    if (formData.delivery_channels.length === 0) {
      newErrors.delivery_channels = 'Please select at least one delivery channel';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    
    // Clear error if user selects an audience
    if (checked && errors.target_audience) {
      setErrors(prev => ({ ...prev, target_audience: '' }));
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
    if (!validateForm()) {
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
    setErrors({});
  };

  const estimatedRecipients = formData.target_audience.length * 100; // Mock calculation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Create Broadcast Announcement
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Announcement Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="Enter a clear, descriptive title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, content: e.target.value }));
                  if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
                }}
                placeholder="Write your announcement message here..."
                rows={6}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {formData.content.length}/500 characters
              </p>
            </div>

            <div>
              <Label>Priority Level</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low - General information</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Important updates</SelectItem>
                  <SelectItem value="high">🟠 High - Action required</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent - Immediate attention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags (Optional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add descriptive tags"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm" variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
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
              {errors.target_audience && <p className="text-sm text-red-500 mb-2">{errors.target_audience}</p>}
              <div className="space-y-3 mt-2 max-h-48 overflow-y-auto">
                {targetAudienceOptions.map(option => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={option.value}
                      checked={formData.target_audience.includes(option.value)}
                      onCheckedChange={(checked) => handleAudienceChange(option.value, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Delivery Channels *</Label>
              <div className="space-y-2 mt-2">
                {deliveryChannelOptions.map(option => (
                  <div key={option.value} className="flex items-start space-x-3 p-2 border rounded hover:bg-gray-50">
                    <Checkbox
                      id={`channel-${option.value}`}
                      checked={formData.delivery_channels.includes(option.value)}
                      onCheckedChange={(checked) => handleDeliveryChannelChange(option.value, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`channel-${option.value}`} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Region (Optional)</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Regions</SelectItem>
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
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {schoolTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Auto Archive Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.auto_archive_date ? format(formData.auto_archive_date, "PPP") : "Select auto-archive date"}
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

            {/* Estimated Recipients */}
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Estimated Recipients:</strong> ~{estimatedRecipients.toLocaleString()} users
                <br />
                <span className="text-sm text-muted-foreground">
                  Based on selected audience and filters
                </span>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.content || formData.target_audience.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Broadcast
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastAnnouncementDialog;
