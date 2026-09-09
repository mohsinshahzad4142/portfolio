export interface OrderData {
  orderId: string;          
  createdAt: any;           
  
  client: {
    fullName: string;
    email: string;
    phone?: string;
    country: string;        
  };

  serviceTitle: string;
  packageSelected: string;
  totalAmount: number;
  currency: 'PKR' | 'USD';

  payment: {
    method: 'bank' | 'jazzcash' | 'easypaisa' | 'stripe';
    status: 'pending_verification' | 'verified' | 'failed';
    trxId?: string;
    proofUrl?: string;     
  };

  status: 'pending' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
  notes?: string;
}