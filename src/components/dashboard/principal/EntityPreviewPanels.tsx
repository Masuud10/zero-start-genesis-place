
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PreviewPanelProps {
  title: string;
  items: any[];
  total: number;
  renderItem: (item: any) => React.ReactNode;
  loading: boolean;
  error: string | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  title, 
  items, 
  total, 
  renderItem, 
  loading, 
  error 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">{title}</CardTitle>
      <CardDescription>
        Total: {loading ? <span className="animate-pulse">…</span> : total}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="text-xs text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-xs text-red-600">{error}</div>
      ) : (
        <ul className="text-xs space-y-1">
          {items && items.length > 0
            ? items.slice(0, 5).map(renderItem)
            : <li>No items.</li>}
        </ul>
      )}
    </CardContent>
  </Card>
);

// Helper item rendering functions
export const renderClass = (cls: any) => (
  <li key={cls.id}>
    <span className="font-semibold">{cls.name}</span>{" "}
    <span className="text-gray-400 text-[10px]">{cls.id.slice(0, 6)}</span>
  </li>
);

export const renderSubject = (subj: any) => (
  <li key={subj.id}>
    <span>{subj.name}</span>{" "}
    <span className="text-gray-400 text-[10px]">{subj.code}</span>
  </li>
);

export const renderPerson = (person: any) => (
  <li key={person.id}>
    <span>{person.name}</span>{" "}
    <span className="text-gray-400 text-[10px]">{person.email}</span>
  </li>
);

interface EntityPreviewPanelsProps {
  classList: any[];
  subjectList: any[];
  teacherList: any[];
  parentList: any[];
  stats: {
    totalClasses: number;
    totalSubjects: number;
    totalTeachers: number;
  };
  loading: boolean;
  error: string | null;
}

const EntityPreviewPanels: React.FC<EntityPreviewPanelsProps> = ({
  classList,
  subjectList,
  teacherList,
  parentList,
  stats,
  loading,
  error,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <PreviewPanel
      title="Classes"
      items={classList}
      total={stats.totalClasses}
      renderItem={renderClass}
      loading={loading}
      error={error}
    />
    <PreviewPanel
      title="Subjects"
      items={subjectList}
      total={stats.totalSubjects}
      renderItem={renderSubject}
      loading={loading}
      error={error}
    />
    <PreviewPanel
      title="Teachers"
      items={teacherList}
      total={stats.totalTeachers}
      renderItem={renderPerson}
      loading={loading}
      error={error}
    />
    <PreviewPanel
      title="Parents"
      items={parentList}
      total={parentList.length}
      renderItem={renderPerson}
      loading={loading}
      error={error}
    />
  </div>
);

export default EntityPreviewPanels;
