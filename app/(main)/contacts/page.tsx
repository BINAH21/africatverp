'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  Plus,
  Filter,
  Download,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Calendar,
  DollarSign,
  Package,
  User,
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  MapPin,
  Building,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  message: string;
  date: string;
  time: string;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  type: 'contact' | 'order';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'phone' | 'email' | 'social';
  assignedTo?: string;
  notes?: string;
  orderItems?: OrderItem[];
  totalAmount?: number;
  tags?: string[];
}

const mockContacts: Contact[] = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+251 911 234 567',
    company: 'Hassan Advertising',
    address: 'Addis Ababa, Ethiopia',
    message: 'Interested in advertising on your channel. Looking for prime time slots.',
    date: '2024-01-15',
    time: '14:30',
    status: 'pending',
    type: 'contact',
    priority: 'high',
    source: 'website',
    tags: ['advertising', 'prime-time'],
  },
  {
    id: 2,
    name: 'Sarah Mohammed',
    email: 'sarah@example.com',
    phone: '+251 922 345 678',
    company: 'Media Solutions Ltd',
    message: 'Order for 10 commercial spots',
    date: '2024-01-14',
    time: '10:15',
    status: 'processed',
    type: 'order',
    priority: 'medium',
    source: 'website',
    assignedTo: 'John Doe',
    orderItems: [
      { id: 1, name: '30-second Commercial Spot', quantity: 10, price: 5000, total: 50000 },
      { id: 2, name: 'Production Services', quantity: 1, price: 15000, total: 15000 },
    ],
    totalAmount: 65000,
    tags: ['commercial', 'production'],
  },
  {
    id: 3,
    name: 'Yonas Tekle',
    email: 'yonas@example.com',
    phone: '+251 933 456 789',
    message: 'Request for interview scheduling with CEO',
    date: '2024-01-13',
    time: '09:00',
    status: 'completed',
    type: 'contact',
    priority: 'high',
    source: 'email',
    assignedTo: 'Jane Smith',
    notes: 'Interview scheduled for next week',
    tags: ['interview', 'ceo'],
  },
  {
    id: 4,
    name: 'Mariam Ali',
    email: 'mariam@example.com',
    phone: '+251 944 567 890',
    company: 'Tech Innovations',
    message: 'Partnership proposal for tech segment',
    date: '2024-01-12',
    time: '16:45',
    status: 'pending',
    type: 'contact',
    priority: 'medium',
    source: 'website',
    tags: ['partnership', 'tech'],
  },
  {
    id: 5,
    name: 'David Kimani',
    email: 'david@example.com',
    phone: '+254 712 345 678',
    company: 'Event Management Co',
    message: 'Order for event coverage',
    date: '2024-01-11',
    time: '11:20',
    status: 'processed',
    type: 'order',
    priority: 'high',
    source: 'phone',
    assignedTo: 'Mike Johnson',
    orderItems: [
      { id: 1, name: 'Live Event Coverage', quantity: 1, price: 100000, total: 100000 },
      { id: 2, name: 'Post-Production Editing', quantity: 1, price: 25000, total: 25000 },
    ],
    totalAmount: 125000,
    tags: ['event', 'coverage'],
  },
];

export default function ContactsPage() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [filter, setFilter] = useState<'all' | 'contact' | 'order'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Contact['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Contact['priority']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredContacts = contacts.filter((contact) => {
    const typeMatch = filter === 'all' || contact.type === filter;
    const statusMatch = statusFilter === 'all' || contact.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || contact.priority === priorityFilter;
    const searchMatch =
      searchQuery === '' ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && statusMatch && priorityMatch && searchMatch;
  });

  const updateStatus = (id: number, status: Contact['status']) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, status } : contact
      )
    );
  };

  const deleteContact = (id: number) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
    setShowModal(false);
  };

  const handleBulkAction = (action: 'delete' | 'status', value?: Contact['status']) => {
    if (action === 'delete') {
      setContacts((prev) => prev.filter((contact) => !selectedIds.includes(contact.id)));
      setSelectedIds([]);
    } else if (action === 'status' && value) {
      setContacts((prev) =>
        prev.map((contact) =>
          selectedIds.includes(contact.id) ? { ...contact, status: value } : contact
        )
      );
      setSelectedIds([]);
    }
  };

  const stats = {
    total: contacts.length,
    pending: contacts.filter((c) => c.status === 'pending').length,
    processed: contacts.filter((c) => c.status === 'processed').length,
    completed: contacts.filter((c) => c.status === 'completed').length,
    orders: contacts.filter((c) => c.type === 'order').length,
    totalRevenue: contacts
      .filter((c) => c.type === 'order' && c.totalAmount)
      .reduce((sum, c) => sum + (c.totalAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('contacts.title')}</h1>
          <p className="text-gray-500 mt-1">Manage website contacts and orders</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('contacts.newContact')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            {t('common.export')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Contacts', value: stats.total.toString(), icon: Mail, color: 'bg-blue-500' },
          { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'bg-yellow-500' },
          { label: 'Processed', value: stats.processed.toString(), icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-purple-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glossy-card rounded-2xl p-6 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glossy-card rounded-2xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search contacts, emails, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'contact', 'order'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : type === 'contact' ? 'Contacts' : 'Orders'}
              </button>
            ))}
            {(['all', 'pending', 'processed', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            {(['all', 'low', 'medium', 'high'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  priorityFilter === priority
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t flex items-center gap-2"
          >
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('status', 'processed')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Mark Processed
              </button>
              <button
                onClick={() => handleBulkAction('status', 'completed')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Contacts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glossy-card rounded-2xl p-6 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredContacts.map((c) => c.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('contacts.name')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('contacts.email')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('contacts.phone')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                <th className="text-left p-3 font-semibold text-gray-700">Priority</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('contacts.date')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('contacts.status')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowModal(true);
                    }}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, contact.id]);
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== contact.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          {contact.company && (
                            <p className="text-xs text-gray-500">{contact.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{contact.email}</td>
                    <td className="p-3 text-gray-600">{contact.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          contact.type === 'order'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {contact.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          contact.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : contact.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {contact.priority}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {contact.date} {contact.time}
                      </div>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={contact.status}
                        onChange={(e) =>
                          updateStatus(contact.id, e.target.value as Contact['status'])
                        }
                        className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${
                          contact.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : contact.status === 'processed'
                            ? 'bg-blue-100 text-blue-700'
                            : contact.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processed">Processed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Name</label>
                    <p className="text-lg font-medium text-gray-900">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Email</label>
                    <p className="text-lg text-gray-900">{selectedContact.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Phone</label>
                    <p className="text-lg text-gray-900">{selectedContact.phone}</p>
                  </div>
                  {selectedContact.company && (
                    <div>
                      <label className="text-sm font-semibold text-gray-500">Company</label>
                      <p className="text-lg text-gray-900">{selectedContact.company}</p>
                    </div>
                  )}
                  {selectedContact.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-500">Address</label>
                      <p className="text-lg text-gray-900">{selectedContact.address}</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-semibold text-gray-500">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedContact.message}</p>
                </div>

                {/* Order Items */}
                {selectedContact.type === 'order' && selectedContact.orderItems && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 mb-4 block">Order Items</label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 text-sm font-semibold">Item</th>
                            <th className="text-left p-3 text-sm font-semibold">Quantity</th>
                            <th className="text-left p-3 text-sm font-semibold">Price</th>
                            <th className="text-left p-3 text-sm font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedContact.orderItems.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-3">{item.name}</td>
                              <td className="p-3">{item.quantity}</td>
                              <td className="p-3">{formatCurrency(item.price)}</td>
                              <td className="p-3 font-semibold">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="p-3 text-right font-semibold">Total:</td>
                            <td className="p-3 font-bold text-lg">
                              {formatCurrency(selectedContact.totalAmount || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedContact.tags && selectedContact.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    <Send className="w-5 h-5" />
                    Send Response
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Edit className="w-5 h-5" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteContact(selectedContact.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
