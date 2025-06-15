
export function calculateUserStats(usersData: any[]) {
  try {
    if (!Array.isArray(usersData)) {
      console.warn('👥 EduFamAdmin: Invalid users data format:', typeof usersData);
      return {
        totalUsers: 0,
        usersWithSchools: 0,
        usersWithoutSchools: 0,
        roleBreakdown: {}
      };
    }
    const validUsers = usersData.filter(user => user && typeof user === 'object' && user.id);

    const stats = {
      totalUsers: validUsers.length,
      usersWithSchools: validUsers.filter(u => u.school_id).length,
      usersWithoutSchools: validUsers.filter(u => !u.school_id).length,
      roleBreakdown: validUsers.reduce((acc: Record<string, number>, user) => {
        const role = user.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {})
    };

    console.log('📊 EduFamAdmin: User stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('📊 EduFamAdmin: Error calculating user stats:', error);
    return {
      totalUsers: 0,
      usersWithSchools: 0,
      usersWithoutSchools: 0,
      roleBreakdown: {}
    };
  }
}
