
import { BillingRecordsService } from './billingRecordsService';
import { BillingStatsService } from './billingStatsService';
import { SchoolsService } from './schoolsService';
import { FeeCreationService } from './feeCreationService';
import { BillingRecord, BillingStats, School, CreateFeeRecordData, BillingFilters } from './types';

// Re-export types for backward compatibility
export type { BillingRecord, BillingStats, School, CreateFeeRecordData, BillingFilters };

export class BillingManagementService {
  // Billing Records Methods
  static async getAllBillingRecords(filters?: BillingFilters) {
    return BillingRecordsService.getAllBillingRecords(filters);
  }

  static async getSchoolBillingRecords(schoolId: string) {
    return BillingRecordsService.getSchoolBillingRecords(schoolId);
  }

  static async updateBillingStatus(recordId: string, status: string, paymentMethod?: string) {
    return BillingRecordsService.updateBillingStatus(recordId, status, paymentMethod);
  }

  static async updateBillingRecord(recordId: string, updates: any) {
    return BillingRecordsService.updateBillingRecord(recordId, updates);
  }

  // Statistics Methods
  static async getBillingStats() {
    return BillingStatsService.getBillingStats();
  }

  // Schools Methods
  static async getAllSchools() {
    return SchoolsService.getAllSchools();
  }

  static async getSchoolBillingSummaries() {
    return SchoolsService.getSchoolBillingSummaries();
  }

  // Fee Creation Methods
  static async createSetupFee(schoolId: string) {
    return FeeCreationService.createSetupFee(schoolId);
  }

  static async createMonthlySubscriptions() {
    return FeeCreationService.createMonthlySubscriptions();
  }

  static async createManualFeeRecord(data: CreateFeeRecordData) {
    return FeeCreationService.createManualFeeRecord(data);
  }

  static async calculateSubscriptionFee(schoolId: string) {
    return FeeCreationService.calculateSubscriptionFee(schoolId);
  }

  // Placeholder methods for additional functionality
  static async getPaymentHistory(schoolId?: string) {
    console.log('📊 BillingManagementService: getPaymentHistory not yet implemented');
    return { data: [], error: null };
  }

  static async generateInvoiceData(recordId: string) {
    console.log('📊 BillingManagementService: generateInvoiceData not yet implemented');
    return { data: null, error: 'Not implemented' };
  }
}
