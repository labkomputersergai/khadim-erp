import {
  ChartOfAccount,
  TravelPackage,
  DepartureKloter,
  Jamaah,
  JamaahRegistration,
  JamaahPaymentTransaction,
  JournalEntry,
  Vendor,
  VendorBill,
  VendorPayment,
  Mitra,
  MitraCommission,
  KloterProfitabilityReport
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'Terjadi kesalahan pada server REST API.';
    try {
      const errorData = await res.json();
      if (errorData && errorData.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  // --- HEALTH CHECK ---
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; service: string }>(res);
  },

  // --- JAMAAH ---
  async getJamaahList(): Promise<Jamaah[]> {
    const res = await fetch(`${API_BASE}/jamaah`);
    return handleResponse<Jamaah[]>(res);
  },

  async createJamaah(data: Partial<Jamaah>): Promise<Jamaah> {
    const res = await fetch(`${API_BASE}/jamaah`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Jamaah>(res);
  },

  async updateJamaah(id: string, data: Partial<Jamaah>): Promise<Jamaah> {
    const res = await fetch(`${API_BASE}/jamaah/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Jamaah>(res);
  },

  async deleteJamaah(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/jamaah/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string }>(res);
  },

  // --- TRANSACTIONS & PAYMENTS ---
  async getTransactions(): Promise<JamaahPaymentTransaction[]> {
    // Fetches registrations with populated payments
    const res = await fetch(`${API_BASE}/registrations`);
    const regList: JamaahRegistration[] = await handleResponse<JamaahRegistration[]>(res);
    const allPayments: JamaahPaymentTransaction[] = [];
    regList.forEach(reg => {
      if (reg.payments && Array.isArray(reg.payments)) {
        allPayments.push(...reg.payments);
      }
    });
    return allPayments;
  },

  async createTransaction(paymentData: {
    registrationId: string;
    installmentId?: string;
    amount: number;
    paymentMethod: string;
    bankAccountId: string;
    paymentDate?: string;
    notes?: string;
    createdBy?: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): Promise<{
    message: string;
    payment: JamaahPaymentTransaction;
    journalEntry: JournalEntry;
    registration: JamaahRegistration;
  }> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return handleResponse(res);
  },

  // --- CASH RECEIPTS (NON-JAMAAH) ---
  async createCashReceipt(receiptData: {
    receiptDate: string;
    category: 'RETAINED_EARNINGS' | 'OWNER_CAPITAL' | 'NON_OPERATIONAL_INCOME';
    bankAccountId: string;
    amount: number;
    notes?: string;
    createdBy?: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): Promise<{ message: string; journalEntry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/cash-receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    return handleResponse(res);
  },

  // --- JOURNAL ENTRIES & LEDGER ---
  async getJournalEntries(): Promise<JournalEntry[]> {
    const res = await fetch(`${API_BASE}/journals`);
    return handleResponse<JournalEntry[]>(res);
  },

  async createJournalEntry(entryData: {
    transactionDate: string;
    referenceType?: string;
    referenceId?: string;
    description: string;
    createdBy?: string;
    lines: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
      memo?: string;
      kloterId?: string;
    }>;
  }): Promise<{ message: string; journalEntry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/journals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });
    return handleResponse(res);
  },

  // --- CHART OF ACCOUNTS (COA) / ACCOUNTS ---
  async getAccounts(): Promise<ChartOfAccount[]> {
    const res = await fetch(`${API_BASE}/coa`);
    return handleResponse<ChartOfAccount[]>(res);
  },

  async createAccount(data: {
    code: string;
    name: string;
    category: string;
    currency?: string;
    description?: string;
  }): Promise<ChartOfAccount> {
    const res = await fetch(`${API_BASE}/coa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<ChartOfAccount>(res);
  },

  async updateAccount(id: string, data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const res = await fetch(`${API_BASE}/coa/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<ChartOfAccount>(res);
  },

  // --- REGISTRATIONS ---
  async getRegistrations(): Promise<JamaahRegistration[]> {
    const res = await fetch(`${API_BASE}/registrations`);
    return handleResponse<JamaahRegistration[]>(res);
  },

  async createRegistration(data: {
    jamaahId: string;
    packageId: string;
    kloterId: string;
    mitraId?: string;
    roomType?: string;
    discount?: number;
    addOnPrice?: number;
    notes?: string;
    customSchedules?: Array<{ title?: string; dueDate?: string; amount?: number }>;
  }): Promise<{ registration: JamaahRegistration }> {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async mutateRegistration(id: string, data: {
    newPackageId: string;
    newKloterId: string;
    newRoomType: string;
    reason?: string;
  }): Promise<{
    message: string;
    registration: JamaahRegistration;
  }> {
    const res = await fetch(`${API_BASE}/registrations/${id}/mutate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- PACKAGES ---
  async getPackages(): Promise<TravelPackage[]> {
    const res = await fetch(`${API_BASE}/packages`);
    return handleResponse<TravelPackage[]>(res);
  },

  async createPackage(data: Partial<TravelPackage>): Promise<TravelPackage> {
    const res = await fetch(`${API_BASE}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<TravelPackage>(res);
  },

  async updatePackage(id: string, data: Partial<TravelPackage>): Promise<TravelPackage> {
    const res = await fetch(`${API_BASE}/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<TravelPackage>(res);
  },

  async togglePackage(id: string): Promise<TravelPackage> {
    const res = await fetch(`${API_BASE}/packages/${id}/toggle`, {
      method: 'PATCH'
    });
    return handleResponse<TravelPackage>(res);
  },

  async deletePackage(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/packages/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string }>(res);
  },

  // --- KLOTERS ---
  async getKloters(): Promise<DepartureKloter[]> {
    const res = await fetch(`${API_BASE}/kloters`);
    return handleResponse<DepartureKloter[]>(res);
  },

  async createKloter(data: Partial<DepartureKloter>): Promise<DepartureKloter> {
    const res = await fetch(`${API_BASE}/kloters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<DepartureKloter>(res);
  },

  async recognizeRevenue(kloterId: string): Promise<{
    message: string;
    totalRecognized: number;
    journalEntry: JournalEntry;
    kloter: DepartureKloter;
  }> {
    const res = await fetch(`${API_BASE}/kloters/${kloterId}/recognize-revenue`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // --- VENDORS & BILLS ---
  async getVendors(): Promise<{ vendors: Vendor[]; bills: VendorBill[]; payments: VendorPayment[] }> {
    const res = await fetch(`${API_BASE}/vendors`);
    return handleResponse<{ vendors: Vendor[]; bills: VendorBill[]; payments: VendorPayment[] }>(res);
  },

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Vendor>(res);
  },

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Vendor>(res);
  },

  async toggleVendor(id: string): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${id}/toggle`, {
      method: 'PATCH'
    });
    return handleResponse<Vendor>(res);
  },

  async deleteVendor(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string }>(res);
  },

  async createVendorBill(data: {
    vendorId: string;
    kloterId: string;
    cogsAccountId: string;
    billDate: string;
    dueDate: string;
    totalAmount: number;
    description?: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): Promise<{ bill: VendorBill; journalEntry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/vendor-bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async createVendorPayment(data: {
    billId: string;
    paymentDate: string;
    amount: number;
    bankAccountId: string;
    referenceNo?: string;
    notes?: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): Promise<{
    message: string;
    payment: VendorPayment;
    bill: VendorBill;
    journalEntry: JournalEntry;
  }> {
    const res = await fetch(`${API_BASE}/vendor-payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- MITRA & COMMISSIONS ---
  async getMitraList(): Promise<Mitra[]> {
    const res = await fetch(`${API_BASE}/mitra`);
    return handleResponse<Mitra[]>(res);
  },

  async createMitra(data: Partial<Mitra>): Promise<Mitra> {
    const res = await fetch(`${API_BASE}/mitra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Mitra>(res);
  },

  async updateMitra(id: string, data: Partial<Mitra>): Promise<Mitra> {
    const res = await fetch(`${API_BASE}/mitra/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Mitra>(res);
  },

  async deleteMitra(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/mitra/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string }>(res);
  },

  async getCommissions(): Promise<MitraCommission[]> {
    const res = await fetch(`${API_BASE}/commissions`);
    return handleResponse<MitraCommission[]>(res);
  },

  async payoutCommission(id: string, data: {
    bankAccountId: string;
    paidDate: string;
    referenceNo?: string;
    notes?: string;
  }): Promise<{ message: string; commission: MitraCommission; journalEntry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/commissions/${id}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- REPORTS ---
  async getProfitabilityReport(): Promise<KloterProfitabilityReport[]> {
    const res = await fetch(`${API_BASE}/reports/profitability`);
    return handleResponse<KloterProfitabilityReport[]>(res);
  },

  // --- BACKUP & RESTORE ---
  async getBackup(): Promise<any> {
    const res = await fetch(`${API_BASE}/backup`);
    return handleResponse<any>(res);
  },

  async restoreBackup(backupData: any): Promise<{ message: string; stats: any }> {
    const res = await fetch(`${API_BASE}/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData)
    });
    return handleResponse(res);
  }
};
