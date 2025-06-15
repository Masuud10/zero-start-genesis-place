
import React from 'react';
import { AuthUser } from '@/types/auth';
import { useParentDashboardStats } from '@/hooks/useParentDashboardStats';
import ParentStatCards from './parent/ParentStatCards';
import ParentActionButtons from './parent/ParentActionButtons';

interface ParentDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onModalOpen }) => {
  console.log('👨‍👩‍👧‍👦 ParentDashboard: Rendering for parent:', user.email);
  const { stats, loading } = useParentDashboardStats(user);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome {user.name || 'Parent'}! Stay connected with your child's education.
          </p>
        </div>
      </div>
      
      <ParentStatCards stats={stats} loading={loading} />

      <ParentActionButtons onModalOpen={onModalOpen} />
    </div>
  );
};

export default ParentDashboard;
