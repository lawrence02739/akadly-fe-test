export interface PaymentInstalment {
  no: number;
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  paidAt?: string;
  transactionId?: string;
}

export interface StudentPayment {
  planType: 'FULL' | 'INSTALLMENT';
  installmentMonths?: number;
  mode: 'ONLINE' | 'OFFLINE';
  type: string;
  transactionId?: string;
  paidBy: 'STUDENT' | 'TEACHER';
  receiptKey?: string;
  totalAmount: number;
  schedule: PaymentInstalment[];
  paidAmount: number;
  dueAmount: number;
  overallStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
}

export interface Student {
  id: string;
  tenantId: string;
  userId: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  city?: string;
  addressLine?: string;
  state?: string;
  pincode?: string;
  courseId: string;
  courseTitle: string;
  planName: string;
  planPrice: number;
  payment: StudentPayment;
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE';
  welcomeInviteSentAt?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Derived
  totalOrders?: number;
  lastOrderAt?: string;
}

export interface StudentOption {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  addressLine?: string;
  state?: string;
  pincode?: string;
}

export interface CreatePaymentDto {
  planType: 'FULL' | 'INSTALLMENT';
  installmentMonths?: number;
  mode: 'ONLINE' | 'OFFLINE';
  type: string;
  transactionId?: string;
  paidBy: 'STUDENT' | 'TEACHER';
  receiptKey?: string;
}

export interface CreateStudentDto {
  fullName: string;
  email: string;
  countryCode?: string;
  phone: string;
  city?: string;
  addressLine?: string;
  state?: string;
  pincode?: string;
  courseId: string;
  planName: string;
  sendWelcomeInvitation?: boolean;
  payment: CreatePaymentDto;
}

export interface UpdateStudentDto {
  fullName?: string;
  phone?: string;
  countryCode?: string;
  city?: string;
  addressLine?: string;
  state?: string;
  pincode?: string;
  status?: 'INVITED' | 'ACTIVE' | 'INACTIVE';
}

export interface ListStudentsParams {
  search?: string;
  courseId?: string;
  status?: 'INVITED' | 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface PaginatedStudentsResponse {
  items: Student[];
  total: number;
  page: number;
  limit: number;
}
