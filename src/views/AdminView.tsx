import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Flag, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Users, 
  Package, 
  ArrowLeftRight, 
  FileText,
  Search,
  ShieldAlert,
  Scale,
  Settings,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Ban,
  UserCheck,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Report, AdminAuditLog, User, Listing, Trade, Dispute } from '../types';
import { adminService, AdminMetrics } from '../services/adminService';
import { reportService } from '../services/reportService';
import { listingService } from '../services/listingService';
import { disputeService } from '../services/disputeService';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SAFE_EXCHANGE_SPOTS } from '../mocks/mockData';

type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'listings' 
  | 'reports' 
  | 'trades' 
  | 'disputes' 
  | 'audit-logs' 
  | 'settings';

interface AdminViewProps {
  initialTab?: AdminTab;
  initialSelectedId?: string;
}

export function AdminView({ initialTab = 'dashboard', initialSelectedId }: AdminViewProps) {
  const { currentUser, isAdmin } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState<string>('all');

  // Detail inspection state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Confirmation dialogs
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Action reason input
  const [actionReason, setActionReason] = useState<string>('');
  const [showReasonModal, setShowReasonModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [reasonModalTitle, setReasonModalTitle] = useState<string>('');

  // Prohibited testing
  const [testKeyword, setTestKeyword] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, u, l, r, t, d, al] = await Promise.all([
        adminService.getMetrics(),
        adminService.getUsers(),
        adminService.getListings(),
        reportService.getReports(),
        adminService.getTrades(),
        disputeService.getDisputes(),
        adminService.getAuditLogs(),
      ]);
      setMetrics(m);
      setUsers(u);
      setListings(l);
      setReports(r);
      setTrades(t);
      setDisputes(d);
      setLogs(al);

      if (initialSelectedId) {
        if (initialTab === 'users') {
          const found = u.find(item => item.id === initialSelectedId);
          if (found) setSelectedUser(found);
        } else if (initialTab === 'listings') {
          const found = l.find(item => item.id === initialSelectedId);
          if (found) setSelectedListing(found);
        } else if (initialTab === 'reports') {
          const found = r.find(item => item.id === initialSelectedId);
          if (found) setSelectedReport(found);
        } else if (initialTab === 'disputes') {
          const found = d.find(item => item.id === initialSelectedId);
          if (found) setSelectedDispute(found);
        }
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const triggerReasonAction = (title: string, action: (reason: string) => Promise<void>) => {
    setReasonModalTitle(title);
    setActionReason('');
    setPendingAction(() => async () => {
      await action(actionReason.trim() || 'Administrative moderation action');
      setShowReasonModal(false);
      fetchAllAdminData();
    });
    setShowReasonModal(true);
  };

  // User Actions
  const handleUpdateUserStatus = (user: User, status: 'active' | 'warned' | 'suspended' | 'banned') => {
    triggerReasonAction(`${status.toUpperCase()} User @${user.username}`, async (reason) => {
      await adminService.updateUserStatus(user.id, status, reason, currentUser?.name || 'Administrator');
      showToast('User Updated', `@${user.username} status set to ${status}.`, 'info');
      setSelectedUser(null);
    });
  };

  // Listing Actions
  const handleModerateListing = (listing: Listing, action: 'approve' | 'reject' | 'hide' | 'remove') => {
    triggerReasonAction(`${action.toUpperCase()} Listing "${listing.title}"`, async (reason) => {
      await adminService.moderateListing(listing.id, action, reason, currentUser?.name || 'Administrator');
      showToast('Listing Moderated', `Listing status updated (${action}).`, 'info');
      setSelectedListing(null);
    });
  };

  // Report Actions
  const handleResolveReport = (report: Report, resolution: 'resolved' | 'dismissed') => {
    triggerReasonAction(`${resolution === 'resolved' ? 'Resolve' : 'Dismiss'} Report #${report.id}`, async (reason) => {
      await reportService.resolveReport(report.id, resolution, reason);
      showToast('Report Handled', `Report #${report.id} marked as ${resolution}.`, 'info');
      setSelectedReport(null);
    });
  };

  // Dispute Actions
  const handleResolveDispute = (dispute: Dispute, status: 'resolved' | 'dismissed') => {
    triggerReasonAction(`${status === 'resolved' ? 'Resolve' : 'Dismiss'} Dispute #${dispute.id}`, async (reason) => {
      await disputeService.resolveDispute(dispute.id, status, reason, currentUser?.id || 'admin_1', currentUser?.name || 'Administrator');
      showToast('Dispute Resolved', `Dispute #${dispute.id} has been ${status}.`, 'success');
      setSelectedDispute(null);
    });
  };

  const handleCheckKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testKeyword.trim()) return;
    const lower = testKeyword.toLowerCase();
    const prohibitedKeywords = [
      'gun', 'firearm', 'ammo', 'weapon', 'replica', 'fake rolex', 'weed', 
      'cocaine', 'prescription', 'stolen', 'counterfeit', 'vape', 'explosive'
    ];
    const match = prohibitedKeywords.find(k => lower.includes(k));
    if (match) {
      setTestResult(`Violation detected: matched prohibited pattern "${match}". Listing would be rejected.`);
    } else {
      setTestResult('Clean: No prohibited goods rules triggered.');
    }
  };

  return (
    <div className="space-y-6 pb-20 text-neutral-900">
      {/* Operations Console Top Bar */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Operations & Moderation Console
              </span>
              <span className="text-neutral-500 text-xs">•</span>
              <span className="text-neutral-400 text-xs">REST API Ready (`/api/v1/admin`)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Barterly Operations Dashboard
            </h1>
            <p className="text-xs text-neutral-400">
              Logged in Operator: <strong className="text-white">{currentUser?.name || 'Admin User'}</strong> (Role: <span className="text-emerald-400 font-semibold">{currentUser?.role || 'admin'}</span>)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/app')}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Switch to User View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={fetchAllAdminData}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Refresh Console Data
            </button>
          </div>
        </div>

        {/* Console Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck, badge: null },
            { id: 'users', label: 'Users', icon: Users, badge: users.length },
            { id: 'listings', label: 'Listings', icon: Package, badge: metrics?.pendingListings || null },
            { id: 'reports', label: 'Reports', icon: Flag, badge: metrics?.openReports || null },
            { id: 'trades', label: 'Trades', icon: ArrowLeftRight, badge: metrics?.activeTrades || null },
            { id: 'disputes', label: 'Disputes', icon: Scale, badge: metrics?.openDisputes || null },
            { id: 'audit-logs', label: 'Audit Logs', icon: FileText, badge: null },
            { id: 'settings', label: 'Platform Policies', icon: Settings, badge: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setSelectedUser(null);
                  setSelectedListing(null);
                  setSelectedReport(null);
                  setSelectedDispute(null);
                }}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-neutral-900 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD METRICS & QUICK SUMMARY */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('users')}
              className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                <span>Total Traders</span>
                <Users className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">{metrics.totalUsers}</div>
              <p className="text-[11px] text-neutral-400 mt-1">{metrics.activeUsers} active accounts</p>
            </div>

            <div 
              onClick={() => setActiveTab('listings')}
              className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                <span>Published Items</span>
                <Package className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">{metrics.activeListings}</div>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">{metrics.pendingListings} pending reviews</p>
            </div>

            <div 
              onClick={() => setActiveTab('reports')}
              className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                <span>Open Reports</span>
                <Flag className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">{metrics.openReports}</div>
              <p className="text-[11px] text-neutral-400 mt-1">Requires safety review</p>
            </div>

            <div 
              onClick={() => setActiveTab('disputes')}
              className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
                <span>Active Disputes</span>
                <Scale className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-2">{metrics.openDisputes}</div>
              <p className="text-[11px] text-neutral-400 mt-1">Inspection checkoff conflicts</p>
            </div>
          </div>

          {/* Quick Action Queues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Reports Queue */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-sm text-neutral-900">Priority Safety Reports</h3>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all ({reports.length})
                </button>
              </div>

              <div className="space-y-2">
                {reports.slice(0, 3).map((rep) => (
                  <div key={rep.id} className="p-3 rounded-2xl border border-neutral-100 hover:border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {rep.targetTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold uppercase">
                          {rep.reason}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">{rep.details}</p>
                    </div>

                    <button
                      onClick={() => { setSelectedReport(rep); setActiveTab('reports'); }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold hover:bg-neutral-100 text-neutral-700 shrink-0 cursor-pointer"
                    >
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Log Stream */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <h3 className="font-bold text-sm text-neutral-900">Recent Operational Actions</h3>
                </div>
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Full audit stream
                </button>
              </div>

              <div className="space-y-2">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 text-xs space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                      <span>{log.adminName}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-bold text-neutral-900">{log.action}</p>
                    <p className="text-neutral-500 truncate">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search traders by name, username (@handle), or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 bg-white text-sm focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Traders</option>
                <option value="warned">Warned</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Trader Profile</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5">Rating & Trades</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users
                    .filter(u => {
                      const matchesSearch = !searchQuery || 
                        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-200"
                            />
                            <div>
                              <p className="font-bold text-neutral-900">{u.name}</p>
                              <p className="text-[11px] text-neutral-400">@{u.username} • {u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">{u.location?.city || 'Local'}, {u.location?.region || ''}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-neutral-900">★ {u.rating}</span>
                          <span className="text-neutral-400 text-[11px]"> ({u.completedTradesCount} trades)</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            u.status === 'warned' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketplace items by title, category, or desired barter..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 bg-white text-sm focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={listingStatusFilter}
                onChange={(e) => setListingStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                <option value="all">All States</option>
                <option value="pending_review">Pending Review</option>
                <option value="published">Published</option>
                <option value="reported">Reported</option>
                <option value="hidden">Hidden</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings
              .filter(l => {
                const matchesSearch = !searchQuery || 
                  l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  l.category.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = listingStatusFilter === 'all' || l.status === listingStatusFilter;
                return matchesSearch && matchesStatus;
              })
              .map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="relative h-40 rounded-xl overflow-hidden bg-neutral-100">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge value={listing.status} variant="status" />
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-neutral-900/70 text-white text-[10px] font-medium backdrop-blur-xs">
                        {listing.category}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{listing.title}</h4>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{listing.description}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Trader:</span>
                        <strong className="text-neutral-800">{listing.owner.name}</strong>
                      </div>
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>Desired:</span>
                        <span className="text-neutral-800 truncate max-w-[150px]">{listing.desiredExchange}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-1.5">
                      {listing.status === 'pending_review' && (
                        <button
                          onClick={() => handleModerateListing(listing, 'approve')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {listing.status !== 'removed' && (
                        <button
                          onClick={() => handleModerateListing(listing, 'remove')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer"
                        >
                          Delist
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-2xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                <option value="all">All Report Statuses</option>
                <option value="open">Open (Unreviewed)</option>
                <option value="investigating">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Report ID</th>
                    <th className="px-4 py-3.5">Reporter</th>
                    <th className="px-4 py-3.5">Target</th>
                    <th className="px-4 py-3.5">Violation Type</th>
                    <th className="px-4 py-3.5">Details</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {reports
                    .filter(r => reportStatusFilter === 'all' || r.status === reportStatusFilter)
                    .map((rep) => (
                      <tr key={rep.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-neutral-500">#{rep.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-neutral-900">{rep.reporterName}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-neutral-800">{rep.targetTitle}</span>
                          <span className="text-[10px] text-neutral-400 block uppercase">({rep.targetType})</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase text-[10px]">
                            {rep.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs truncate text-neutral-600">{rep.details}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rep.status === 'open' ? 'bg-amber-100 text-amber-800' :
                            rep.status === 'investigating' ? 'bg-sky-100 text-sky-800' :
                            rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedReport(rep)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DISPUTES RESOLUTION CENTER */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <select
              value={disputeStatusFilter}
              onChange={(e) => setDisputeStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer"
            >
              <option value="all">All Dispute States</option>
              <option value="opened">Opened (Pending Ruling)</option>
              <option value="under_review">Under Active Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disputes
              .filter(d => disputeStatusFilter === 'all' || d.status === disputeStatusFilter)
              .map((d) => (
                <div key={d.id} className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-500" />
                      <span className="font-mono text-xs text-neutral-400">#{d.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      d.status === 'opened' ? 'bg-amber-100 text-amber-800' :
                      d.status === 'under_review' ? 'bg-sky-100 text-sky-800' :
                      d.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-50 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Initiator:</span>
                      <strong className="text-neutral-900">{d.initiatorName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Respondent:</span>
                      <strong className="text-neutral-900">{d.respondentName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Reason:</span>
                      <span className="text-rose-700 font-semibold">{d.reason}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                    "{d.description}"
                  </p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      Opened {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveDispute(d, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveDispute(d, 'resolved')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Rule & Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 6: TRADES OVERSIGHT */}
      {activeTab === 'trades' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Trade ID</th>
                  <th className="px-4 py-3.5">Parties Involved</th>
                  <th className="px-4 py-3.5">Exchanged Items</th>
                  <th className="px-4 py-3.5">Scheduled Meeting</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-neutral-500">#{t.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-neutral-900">{t.owner?.name || 'Owner'}</p>
                      <p className="text-[11px] text-neutral-400">vs. {t.requester?.name || 'Requester'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-neutral-800">{t.exchangedItems?.fromOwner?.title || t.listing?.title || 'Trade item'}</span>
                      <span className="text-[11px] text-neutral-400 block">⇄ {t.exchangedItems?.fromRequester?.map(i => i.title).join(', ') || 'Barter items'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {t.meeting ? (
                        <div>
                          <p className="font-medium text-neutral-800">{t.meeting.locationName}</p>
                          <p className="text-[11px] text-neutral-400">{t.meeting.scheduledDate}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge value={t.status} variant="trade" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS STREAM */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Immutable Administrative Audit Log</strong>
              <span>
                Every moderation action, user status modification, listing delisting, and dispute resolution is recorded by the backend service. All actions are attributed to authenticated operators.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Administrator</th>
                    <th className="px-4 py-3.5">Action Executed</th>
                    <th className="px-4 py-3.5">Target Resource</th>
                    <th className="px-5 py-3.5">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3 text-neutral-400">
                        {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-sans font-bold text-neutral-900">{log.adminName}</td>
                      <td className="px-4 py-3 text-indigo-700 font-bold">{log.action}</td>
                      <td className="px-4 py-3 text-neutral-800">{log.targetResource}</td>
                      <td className="px-5 py-3 text-neutral-500 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: PLATFORM POLICIES & SAFE SPOTS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Prohibited Goods Testing Utility */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-base text-neutral-900">Prohibited Goods Keyword Validator</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Test listing descriptions against the platform's prohibited goods classifier before publishing:
            </p>

            <form onSubmit={handleCheckKeyword} className="flex gap-2">
              <input
                type="text"
                value={testKeyword}
                onChange={(e) => setTestKeyword(e.target.value)}
                placeholder="Type item title or description to test policy rules (e.g. 'Airsoft replica gun', 'Vape mod')..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Scan Text
              </button>
            </form>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                testResult.startsWith('Violation') ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Registered Safe Exchange Spots */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-neutral-900">Registered Public Safe Exchange Spots</h3>
              </div>
              <span className="text-xs text-neutral-400 font-medium">{SAFE_EXCHANGE_SPOTS.length} verified locations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAFE_EXCHANGE_SPOTS.map((spot) => (
                <div key={spot.id} className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-neutral-900">{spot.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase">
                      {spot.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{spot.address}</p>
                  <p className="text-[10px] text-neutral-400 pt-1">Recommended Hours: {spot.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL: USER DETAILS */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-5">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                alt={selectedUser.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-neutral-100"
              />
              <div>
                <h3 className="font-black text-lg text-neutral-900">{selectedUser.name}</h3>
                <p className="text-xs text-neutral-500">@{selectedUser.username} • {selectedUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 font-bold uppercase">
                    Status: {selectedUser.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase">
                    Role: {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 text-xs space-y-1.5 text-neutral-700">
              <p><strong>Bio:</strong> {selectedUser.bio}</p>
              <p><strong>Location:</strong> {selectedUser.location?.city || 'Local'}, {selectedUser.location?.region || ''}</p>
              <p><strong>Completed Trades:</strong> {selectedUser.completedTradesCount} (Rating: ★ {selectedUser.rating})</p>
              <p><strong>Joined:</strong> {selectedUser.joinedDate}</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Execute Moderation Action</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateUserStatus(selectedUser, 'warned')}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Issue Warning
                </button>
                <button
                  onClick={() => handleUpdateUserStatus(selectedUser, 'suspended')}
                  className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Suspend Account
                </button>
                <button
                  onClick={() => handleUpdateUserStatus(selectedUser, 'banned')}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Permanent Ban
                </button>
                <button
                  onClick={() => handleUpdateUserStatus(selectedUser, 'active')}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Restore to Active
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL: LISTING DETAILS */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge value={selectedListing.status} variant="status" />
                <span className="text-xs text-neutral-400">• Category: {selectedListing.category}</span>
              </div>
              <h3 className="font-black text-lg text-neutral-900">{selectedListing.title}</h3>
            </div>

            <div className="h-48 rounded-2xl overflow-hidden bg-neutral-100">
              <img
                src={selectedListing.images[0]}
                alt={selectedListing.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 text-xs space-y-1 text-neutral-700">
              <p><strong>Description:</strong> {selectedListing.description}</p>
              <p><strong>Condition:</strong> {selectedListing.condition}</p>
              <p><strong>Desired Exchange:</strong> {selectedListing.desiredExchange}</p>
              <p><strong>Owner:</strong> {selectedListing.owner.name} (@{selectedListing.owner.username})</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              {selectedListing.status !== 'published' && (
                <button
                  onClick={() => handleModerateListing(selectedListing, 'approve')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Approve Listing
                </button>
              )}
              {selectedListing.status !== 'removed' && (
                <button
                  onClick={() => handleModerateListing(selectedListing, 'remove')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Remove Listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL: REPORT DETAILS */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-4">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-xs text-rose-700 uppercase">Violation Report #{selectedReport.id}</span>
              </div>
              <h3 className="text-base font-black text-neutral-900 mt-1">Target: {selectedReport.targetTitle}</h3>
              <p className="text-xs text-neutral-500">Reported by {selectedReport.reporterName} on {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 text-xs space-y-2 text-neutral-700">
              <div className="flex justify-between">
                <span>Reason:</span>
                <strong className="text-rose-700 uppercase">{selectedReport.reason}</strong>
              </div>
              <div>
                <span className="block font-semibold mb-1">Details:</span>
                <p className="bg-white p-3 rounded-xl border border-neutral-200 leading-relaxed text-neutral-800">
                  {selectedReport.details}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
              <button
                onClick={() => handleResolveReport(selectedReport, 'dismissed')}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Dismiss (No Violation)
              </button>
              <button
                onClick={() => handleResolveReport(selectedReport, 'resolved')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Resolve & Moderate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASON PROMPT MODAL */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-black text-base text-neutral-900">{reasonModalTitle}</h3>
            <p className="text-xs text-neutral-500">
              Provide an administrative rationale for the audit record and user notification:
            </p>

            <textarea
              rows={3}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="e.g. Violation of community prohibited items policy (Section 4.2)..."
              className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:border-indigo-500 focus:outline-hidden"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingAction && pendingAction()}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog component */}
      <ConfirmDialog
        isOpen={confirmAction.isOpen}
        title={confirmAction.title}
        description={confirmAction.description}
        confirmLabel={confirmAction.confirmLabel}
        isDestructive={confirmAction.isDestructive}
        onConfirm={() => {
          confirmAction.onConfirm();
          setConfirmAction(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
