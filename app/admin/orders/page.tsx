'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Order {
  id: string;
  client?: {
    fullName?: string;
    email?: string;
    company?: string;
    country?: string;
  };
  customerName?: string;
  email?: string;
  serviceTitle?: string;
  service?: string;
  status?: string;
  totalAmount?: number;
  total?: number;
  payment?: {
    method?: string;
    status?: string;
    trxId?: string;
  };
  projectDetails?: {
    title?: string;
    description?: string;
  };
  notes?: string;
  createdAt?: any;
  [key: string]: any;
}

export default function AdminOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Modals State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // AI Assistant State
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<{ [key: string]: { type: string; text: string } }>({});

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_auth') === 'true';
    setIsAuthenticated(sessionAuth);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Order[];
          setOrders(fetchedOrders);
        },
        (error) => {
          console.error("Error listening to orders:", error);
        }
      );

      return () => unsubscribeSnapshot();
    } catch (error) {
      console.error("Firestore setup error:", error);
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentVerification = async (order: Order, verifyStatus: 'verified' | 'rejected') => {
    setUpdatingId(order.id);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        'payment.status': verifyStatus,
        status: verifyStatus === 'verified' ? 'In Progress' : 'Pending',
      });

      if (verifyStatus === 'verified') {
        const clientEmail = order.client?.email || order.email;
        const clientName = order.client?.fullName || order.customerName || 'Client';
        const serviceTitle = order.serviceTitle || order.service || 'Web Development Service';
        const totalAmount = order.totalAmount ?? order.total ?? 0;

        if (clientEmail) {
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clientEmail,
                clientName,
                serviceTitle,
                totalAmount,
                orderId: order.id,
              }),
            });
          } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
          }
        }
      }

      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    setUpdatingId(id);
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAIAssistant = async (order: Order, action: 'summarize' | 'reply') => {
    setAiLoadingId(order.id);
    try {
      const clientName = order.client?.fullName || order.customerName || 'Client';
      const serviceTitle = order.serviceTitle || order.service || 'Web Development';
      const projectDetails = order.projectDetails?.description || order.notes || 'No project details provided.';

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, clientName, serviceTitle, projectDetails }),
      });

      const data = await res.json();
      if (data.success) {
        setAiOutput((prev) => ({
          ...prev,
          [order.id]: { type: action === 'summarize' ? 'Scope Summary' : 'AI Reply Draft', text: data.result },
        }));
      } else {
        alert(data.error || 'AI generation failed');
      }
    } catch (error) {
      console.error('AI assistant request error:', error);
      alert('Failed to connect with AI assistant.');
    } finally {
      setAiLoadingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusStyle = (status: string = 'pending') => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (s === 'in progress' || s === 'in_progress') return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (s === 'cancelled') return 'bg-red-500/15 text-red-400 border-red-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-emerald-400 animate-pulse font-medium">Loading orders dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-400">Access Restricted</h1>
          <p className="text-gray-400 mb-6 text-sm">Please log in through the primary admin panel first.</p>
          <Link
            href="/admin"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const name = order.client?.fullName || order.customerName || '';
    const email = order.client?.email || order.email || '';
    const service = order.serviceTitle || order.service || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toLowerCase().includes(searchTerm.toLowerCase());

    const orderStatus = (order.status || 'pending').toLowerCase();
    const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount ?? curr.total ?? 0), 0);
  const pendingCount = orders.filter((o) => {
    const s = (o.status || 'pending').toLowerCase();
    return s === 'pending' || s === 'pending_verification';
  }).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">📦 Client Orders & AI Assistant</h1>
            <p className="text-gray-400 text-sm mt-1">Manage orders, verify payments, generate AI insights, and send replies.</p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60">
            <span className="text-xs text-gray-400 font-medium">Total Orders</span>
            <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
          </div>
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60">
            <span className="text-xs text-amber-400 font-medium">Pending Review</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60">
            <span className="text-xs text-emerald-400 font-medium">Completed</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {orders.filter((o) => (o.status || '').toLowerCase() === 'completed').length}
            </p>
          </div>
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60">
            <span className="text-xs text-gray-400 font-medium">Total Pipeline Value</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <input
            type="text"
            placeholder="Search by client, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-gray-500"
          />

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-gray-400 uppercase font-semibold whitespace-nowrap">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 w-full sm:w-auto cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center bg-gray-800/40 p-12 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-base">No orders matched your active criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const clientName = order.client?.fullName || order.customerName || 'Unnamed Client';
              const clientEmail = order.client?.email || order.email || '';
              const serviceName = order.serviceTitle || order.service || 'Custom Development Request';
              const orderTotal = order.totalAmount ?? order.total ?? 0;
              const projectDesc = order.projectDetails?.description || order.notes;
              const payStatus = order.payment?.status || 'pending_verification';
              const currentAi = aiOutput[order.id];

              return (
                <div
                  key={order.id}
                  className={`bg-gray-800 p-6 rounded-2xl border transition-all ${
                    updatingId === order.id ? 'opacity-50 pointer-events-none border-gray-600' : 'border-gray-700 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-white">{clientName}</h2>
                        
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold border cursor-pointer focus:outline-none transition-colors ${getStatusStyle(order.status)}`}
                        >
                          <option value="pending" className="bg-gray-900 text-amber-400">🟡 Pending</option>
                          <option value="in progress" className="bg-gray-900 text-blue-400">🔵 In Progress</option>
                          <option value="completed" className="bg-gray-900 text-emerald-400">🟢 Completed</option>
                          <option value="cancelled" className="bg-gray-900 text-red-400">🔴 Cancelled</option>
                        </select>

                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                          payStatus === 'verified' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : payStatus === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          Payment: {payStatus.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-emerald-400 font-medium">{serviceName}</p>
                      {order.client?.company && (
                        <p className="text-xs text-gray-400">Company: {order.client.company}</p>
                      )}
                      <p className="text-xs text-gray-500">Submitted: {formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-emerald-400 bg-gray-900/80 px-4 py-1.5 rounded-xl border border-gray-700">
                        ${orderTotal}
                      </span>
                      
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-gray-600"
                        title="View / Download Invoice"
                      >
                        📄 Invoice
                      </button>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-md"
                      >
                        Verify 💳
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete order"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-xl text-sm transition-colors cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Details Box */}
                  <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 text-sm space-y-3">
                    <p className="text-gray-300">
                      <span className="text-gray-500 font-medium">Contact:</span>{' '}
                      {clientEmail ? (
                        <a href={`mailto:${clientEmail}`} className="text-blue-400 hover:underline">
                          {clientEmail}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                    {projectDesc && (
                      <p className="text-gray-300">
                        <span className="text-gray-500 font-medium">Project Details:</span> {projectDesc}
                      </p>
                    )}

                    {/* AI Action Buttons */}
                    <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-purple-400 font-bold flex items-center gap-1">✨ Groq AI Assistant:</span>
                      
                      <button
                        onClick={() => handleAIAssistant(order, 'summarize')}
                        disabled={aiLoadingId === order.id}
                        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {aiLoadingId === order.id ? 'Thinking...' : '⚡ Generate Scope Summary'}
                      </button>

                      <button
                        onClick={() => handleAIAssistant(order, 'reply')}
                        disabled={aiLoadingId === order.id}
                        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {aiLoadingId === order.id ? 'Thinking...' : '💬 Draft AI Reply'}
                      </button>
                    </div>

                    {/* AI Output Display Box */}
                    {currentAi && (
                      <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl mt-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">🤖 {currentAi.type}</span>
                          <button
                            onClick={() => setAiOutput((prev) => { const copy = {...prev}; delete copy[order.id]; return copy; })}
                            className="text-xs text-gray-500 hover:text-gray-300"
                          >
                            ✕ Clear
                          </button>
                        </div>
                        <p className="text-gray-200 text-xs whitespace-pre-line leading-relaxed pt-1">{currentAi.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Payment Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                💳 Payment Verification & Email Alert
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/60 space-y-2">
                <p><span className="text-gray-400">Client Name:</span> <strong className="text-white">{selectedOrder.client?.fullName || selectedOrder.customerName}</strong></p>
                <p><span className="text-gray-400">Service:</span> <strong className="text-emerald-400">{selectedOrder.serviceTitle || selectedOrder.service}</strong></p>
                <p><span className="text-gray-400">Total Amount:</span> <strong className="text-emerald-400">${selectedOrder.totalAmount ?? selectedOrder.total}</strong></p>
              </div>

              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-2">
                <p><span className="text-gray-400">Payment Method:</span> <strong className="uppercase text-blue-400">{selectedOrder.payment?.method || 'Bank / Online'}</strong></p>
                <p><span className="text-gray-400">Transaction ID (TRX ID):</span> <code className="bg-gray-800 px-2 py-1 rounded text-amber-300 font-mono text-xs">{selectedOrder.payment?.trxId || 'No TRX ID provided'}</code></p>
                <p className="text-xs text-gray-400 pt-2">ℹ️ Verifying this payment will automatically email the client using Resend.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handlePaymentVerification(selectedOrder, 'verified')}
                disabled={updatingId === selectedOrder.id}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm shadow-lg shadow-emerald-600/20"
              >
                ✓ Verify & Email Client
              </button>
              <button
                onClick={() => handlePaymentVerification(selectedOrder, 'rejected')}
                disabled={updatingId === selectedOrder.id}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                ✕ Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setInvoiceOrder(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-gray-900">INVOICE</h2>
                <p className="text-xs text-gray-500">Order ID: {invoiceOrder.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">Mohsin Shahzad</p>
                <p className="text-xs text-gray-500">Full Stack Developer</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Billed To:</p>
                <p className="font-bold text-gray-800 mt-1">{invoiceOrder.client?.fullName || invoiceOrder.customerName}</p>
                <p className="text-gray-600 text-xs">{invoiceOrder.client?.company || 'Independent Client'}</p>
                <p className="text-gray-600 text-xs">{invoiceOrder.client?.email || invoiceOrder.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Date:</p>
                <p className="text-gray-800 text-sm mt-1">{formatDate(invoiceOrder.createdAt)}</p>
                <p className="text-xs text-emerald-600 font-bold mt-2">Status: PAID & VERIFIED</p>
              </div>
            </div>

            <table className="w-full text-left text-sm mt-4 border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium text-gray-800">{invoiceOrder.serviceTitle || invoiceOrder.service}</td>
                  <td className="p-3 text-right font-bold text-gray-900">${invoiceOrder.totalAmount ?? invoiceOrder.total}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-gray-500">Thank you for your business!</p>
              <div className="text-right">
                <span className="text-xs text-gray-500">Total: </span>
                <span className="text-xl font-bold text-emerald-600">${invoiceOrder.totalAmount ?? invoiceOrder.total}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Print / Save as PDF 🖨️
              </button>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}