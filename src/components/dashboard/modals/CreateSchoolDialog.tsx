import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CreateSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchoolCreated?: () => void;
}

const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({
  open,
  onOpenChange,
  onSchoolCreated,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    school_type: "primary",
    motto: "",
    slogan: "",
    registration_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.from("schools").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        school_type: formData.school_type,
        motto: formData.motto || null,
        slogan: formData.slogan || null,
        registration_number: formData.registration_number || null,
        status: "active",
        subscription_plan: "basic",
      });

      if (error) throw error;

      toast({
        title: "School Created",
        description: `${formData.name} has been created successfully.`,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        school_type: "primary",
        motto: "",
        slogan: "",
        registration_number: "",
      });
      onOpenChange(false);
      onSchoolCreated?.();
    } catch (error) {
      console.error("Error creating school:", error);
      toast({
        title: "Error",
        description: "Failed to create school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New School</DialogTitle>
          <DialogDescription>
            Add a new school to the EduFam platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">School Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter school name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter school address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school_type">School Type</Label>
            <Select
              value={formData.school_type}
              onValueChange={(value) =>
                setFormData({ ...formData, school_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select school type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary School</SelectItem>
                <SelectItem value="secondary">Secondary School</SelectItem>
                <SelectItem value="mixed">Primary & Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input
              id="registration_number"
              value={formData.registration_number}
              onChange={(e) =>
                setFormData({ ...formData, registration_number: e.target.value })
              }
              placeholder="Enter registration number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motto">School Motto</Label>
            <Input
              id="motto"
              value={formData.motto}
              onChange={(e) =>
                setFormData({ ...formData, motto: e.target.value })
              }
              placeholder="Enter school motto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slogan">School Slogan</Label>
            <Input
              id="slogan"
              value={formData.slogan}
              onChange={(e) =>
                setFormData({ ...formData, slogan: e.target.value })
              }
              placeholder="Enter school slogan"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create School
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;