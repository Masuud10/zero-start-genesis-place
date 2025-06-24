
// Data debugging utilities for report generation
export const debugDataSources = async (supabase: any) => {
  console.log('🔍 Starting comprehensive data debugging...');
  
  const dataSources = [
    'schools',
    'profiles', 
    'students',
    'teachers',
    'grades',
    'attendance',
    'fees',
    'financial_transactions',
    'company_details',
    'company_metrics',
    'comprehensive_report_data'
  ];
  
  const debugResults: Record<string, any> = {};
  
  for (const table of dataSources) {
    try {
      console.log(`🔍 Checking table: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error.message);
        debugResults[table] = { error: error.message, count: 0 };
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
        debugResults[table] = { count: count || 0, accessible: true };
      }
    } catch (err) {
      console.error(`❌ Exception accessing ${table}:`, err);
      debugResults[table] = { error: 'Access exception', count: 0 };
    }
  }
  
  console.log('📊 Data source summary:', debugResults);
  return debugResults;
};

export const validateReportData = (data: any, reportType: string) => {
  console.log(`🔍 Validating data for ${reportType} report...`);
  
  if (!data) {
    console.warn('⚠️ No data provided for validation');
    return false;
  }
  
  if (Array.isArray(data) && data.length === 0) {
    console.warn('⚠️ Data array is empty');
    return false;
  }
  
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    console.warn('⚠️ Data object is empty');
    return false;
  }
  
  console.log('✅ Data validation passed');
  return true;
};
