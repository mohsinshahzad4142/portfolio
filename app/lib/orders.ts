// File Path: app/lib/orders.ts

import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createNewOrder(data: any) {
  try {
    const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Fallbacks to capture whatever naming convention the admin panel uses
    const clientName = data.clientName || data.fullName || data.name || 'Unnamed Client';
    const clientEmail = data.clientEmail || data.email || data.contact || 'N/A';
    const serviceTitle = data.serviceTitle || data.service || data.projectTitle || 'Custom Development Request';
    const priceValue = Number(data.totalPrice) || Number(data.packagePrice) || Number(data.total) || Number(data.amount) || Number(data.price) || 0;

    const orderPayload = {
      orderId: generatedOrderId,
      createdAt: serverTimestamp(),
      
      // --- All Possible Flat Field Variants for Admin Dashboards ---
      name: clientName,
      fullName: clientName,
      clientName: clientName,
      customerName: clientName,
      
      email: clientEmail,
      clientEmail: clientEmail,
      contact: clientEmail,
      
      service: serviceTitle,
      serviceTitle: serviceTitle,
      
      total: priceValue,
      totalAmount: priceValue,
      amount: priceValue,
      price: priceValue,
      
      status: 'Pending', // Capital P for filter matching

      // --- Nested Objects & Additional Details ---
      client: {
        fullName: clientName,
        email: clientEmail,
        company: data.clientCompany || '',
        country: data.clientCountry || (data.clientType === 'international' ? 'International' : 'PK'),
      },
      packageSelected: data.packageName || 'Standard',
      packagePrice: Number(data.packagePrice) || 0,
      selectedAddons: data.selectedAddons || [],
      currency: data.clientType === 'international' ? 'USD' : 'PKR',
      
      projectDetails: {
        title: data.projectTitle || '',
        description: data.projectDesc || '',
      },
      
      payment: {
        method: data.paymentMethod || 'bank',
        status: 'pending_verification',
        trxId: data.trxId || '',
      },
    };

    const docRef = await addDoc(collection(db, 'orders'), orderPayload);
    return { success: true, id: docRef.id, orderId: generatedOrderId };

  } catch (error) {
    console.error("Error creating order in Firestore:", error);
    return { success: false, error };
  }
}