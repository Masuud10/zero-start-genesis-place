import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExaminationType {
  id: string;
  exam_type: string;
}

interface ExaminationTypesFilterProps {
  value?: string;
  onValueChange: (value: string) => void;
  schoolId: string;
}

const ExaminationTypesFilter: React.FC<ExaminationTypesFilterProps> = ({
  value,
  onValueChange,
  schoolId
}) => {
  const { data: examTypes = [], isLoading } = useQuery({
    queryKey: ['examination-types', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('exam_type')
        .eq('school_id', schoolId)
        .order('exam_type');
      
      if (error) throw error;
      
      // Get unique exam types
      const uniqueTypes = Array.from(new Set(data.map(item => item.exam_type)))
        .map(type => ({ id: type, exam_type: type }));
      
      return uniqueTypes;
    },
    enabled: !!schoolId
  });

  return (
    <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={isLoading ? "Loading types..." : "Select exam type"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Exam Types</SelectItem>
        {examTypes.map((type) => (
          <SelectItem key={type.id} value={type.exam_type}>
            {type.exam_type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ExaminationTypesFilter;