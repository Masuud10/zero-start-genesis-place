
export interface MpesaTransaction {
  id: string;
  transaction_id: string;
  phone_number: string;
  amount_paid: number;
  transaction_status: string;
  mpesa_receipt_number: string;
  transaction_date: string;
  student_id: string;
  fee_id: string;
  class_id: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export interface MpesaCredentials {
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  paybill_number: string;
}
