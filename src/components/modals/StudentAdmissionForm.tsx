
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface StudentAdmissionFormProps {
  formData: any;
  classes: { id: string; name: string }[];
  parents: { id: string; name: string; email: string }[];
  loadingParents: boolean;
  isSubmitting: boolean;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const StudentAdmissionForm: React.FC<StudentAdmissionFormProps> = ({
  formData,
  classes,
  parents,
  loadingParents,
  isSubmitting,
  handleInputChange,
  handleSubmit,
  onClose
}) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="admission_number">Admission Number *</Label>
        <Input
          id="admission_number"
          value={formData.admission_number}
          onChange={(e) => handleInputChange("admission_number", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="roll_number">Roll Number</Label>
        <Input
          id="roll_number"
          value={formData.roll_number}
          onChange={(e) => handleInputChange("roll_number", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="date_of_birth">Date of Birth *</Label>
        <Input
          id="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="gender">Gender *</Label>
        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="class_id">Class *</Label>
        <Select value={formData.class_id} onValueChange={value => handleInputChange("class_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="parent_id">Parent *</Label>
        <Select
          value={formData.parent_id}
          onValueChange={value => handleInputChange("parent_id", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingParents ? "Loading parents..." : parents.length === 0 ? "No parents found" : "Select parent"} />
          </SelectTrigger>
          <SelectContent>
            {parents.map(parent => (
              <SelectItem value={parent.id} key={parent.id}>
                {parent.name} ({parent.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loadingParents && (
          <div className="text-xs text-muted-foreground mt-1">Loading parents...</div>
        )}
        {!loadingParents && parents.length === 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            No parents found. Please add a parent first.
          </div>
        )}
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="parent_name">Parent/Guardian Name *</Label>
        <Input
          id="parent_name"
          value={formData.parent_name}
          onChange={(e) => handleInputChange("parent_name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="parent_contact">Parent Contact *</Label>
        <Input
          id="parent_contact"
          value={formData.parent_contact}
          onChange={(e) => handleInputChange("parent_contact", e.target.value)}
          required
        />
      </div>
    </div>
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Admitting..." : "Admit Student"}
      </Button>
    </div>
  </form>
);

export default StudentAdmissionForm;
