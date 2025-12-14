import { Invoice } from "@/models/interfaces/Invoice";
import axiosClient from "@/utils/axios-client";

export class InvoiceService {
  static async getInvoicesByGym(gymId: number): Promise<Invoice[]> {
    const res = await axiosClient.get(`/invoices/gym/${gymId}`);
    return res.data;
  }

  static async getInvoicesByMember(memberId: number): Promise<Invoice[]> {
    const res = await axiosClient.get(`/invoices/member/${memberId}`);
    return res.data;
  }

  static async getInvoiceById(id: number): Promise<Invoice> {
    const res = await axiosClient.get(`/invoices/${id}`);
    return res.data;
  }

  static async createInvoice(data: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">): Promise<Invoice> {
    const res = await axiosClient.post(`/invoices`, data);
    return res.data;
  }

  static async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice> {
    const res = await axiosClient.put(`/invoices/${id}`, updates);
    return res.data;
  }

  static async markInvoiceAsPaid(id: number, paymentMethod: string): Promise<Invoice> {
    const res = await axiosClient.patch(`/invoices/mark-paid/${id}`, paymentMethod, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  }

  static async cancelInvoice(id: number): Promise<Invoice> {
    const res = await axiosClient.patch(`/invoices/cancel/${id}`);
    return res.data;
  }

  static async updateOverdueInvoices(gymId: number): Promise<void> {
    await axiosClient.patch(`/invoices/update-overdue/${gymId}`);
  }
}
