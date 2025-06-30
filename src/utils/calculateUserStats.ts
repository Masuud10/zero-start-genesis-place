
interface UserData {
  id: string;
  role: string;
  school_id?: string | null;
  created_at: string;
}

interface UserStats {
  totalUsers: number;
  usersWithSchools: number;
  usersWithoutSchools: number;
  roleBreakdown: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

export const calculateUserStats = (usersData: UserData[]): UserStats => {
  if (!Array.isArray(usersData) || usersData.length === 0) {
    return {
      totalUsers: 0,
      usersWithSchools: 0,
      usersWithoutSchools: 0,
      roleBreakdown: []
    };
  }

  const totalUsers = usersData.length;
  const usersWithSchools = usersData.filter(user => user.school_id).length;
  const usersWithoutSchools = totalUsers - usersWithSchools;

  // Calculate role breakdown
  const roleCounts: Record<string, number> = {};
  usersData.forEach(user => {
    const role = user.role || 'unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const roleBreakdown = Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
    percentage: Math.round((count / totalUsers) * 100)
  })).sort((a, b) => b.count - a.count);

  return {
    totalUsers,
    usersWithSchools,
    usersWithoutSchools,
    roleBreakdown
  };
};
