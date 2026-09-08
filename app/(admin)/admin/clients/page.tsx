'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Plus,
  Phone,
  Mail,
  User,
  X,
  Clock,
  BookOpen,
  Edit2,
  Lock,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Avatar } from '@/components/ui/Avatar'
import { AdminDateFilter, DEFAULT_DATE_PRESETS } from '@/components/admin/AdminDateFilter'
import { SortableHeader } from '@/components/admin/SortableHeader'
import { matchesDateRange, sortItems } from '@/lib/admin/filterUtils'
import { useAdminMock } from '@/context/AdminMockContext'
import { AdminClient } from '@/lib/admin/mockData'
import { useToast } from '@/components/ui/ToastContext'

export default function AdminClientsPage() {
  const {
    clients,
    addClient,
    updateClient,
    updateClientStatus,
    currentUserId,
    currentUserEmail,
    bookings,
  } = useAdminMock()
  const { showToast } = useToast()

  // Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Date Range Filter State (Registration Date)
  const [datePreset, setDatePreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Column Sorting State
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Selected Client Dossier Drawer
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null)
  const [dossierOpen, setDossierOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Edit Client Modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<AdminClient | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    role: 'client' as AdminClient['role'],
    status: 'active' as AdminClient['status'],
    avatar_url: '',
    ban_reason: '',
  })

  // Ban Reason Form Modal
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banReasonText, setBanReasonText] = useState('')

  // Invite Client Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'client' as AdminClient['role'],
  })

  // Global Escape key listener to dismiss any active drawer or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDossierOpen(false)
        setEditModalOpen(false)
        setBanModalOpen(false)
        setInviteModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Helper to check if a client row is the current authenticated user
  const checkIsSelf = (client: AdminClient) => {
    if (currentUserId && client.id === currentUserId) return true
    if (currentUserEmail && client.email.toLowerCase() === currentUserEmail.toLowerCase()) return true
    return false
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      if (['total_spent', 'total_bookings', 'created_at'].includes(field)) {
        setSortDirection('desc')
      } else {
        setSortDirection('asc')
      }
    }
  }

  // Filter & Sort Clients
  const processedClients = useMemo(() => {
    const filtered = clients.filter((client) => {
      const matchesRole = roleFilter === 'all' || client.role === roleFilter
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      const matchesSearch =
        client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)

      const matchesDate = matchesDateRange(client.created_at, datePreset, startDate, endDate)

      return matchesRole && matchesStatus && matchesSearch && matchesDate
    })

    return sortItems<AdminClient>(filtered, sortField, sortDirection)
  }, [clients, roleFilter, statusFilter, searchQuery, datePreset, startDate, endDate, sortField, sortDirection])

  const openDossier = (client: AdminClient) => {
    setSelectedClient(client)
    setDossierOpen(true)
  }

  const openEditClient = (client: AdminClient) => {
    setEditingClient(client)
    setEditForm({
      full_name: client.full_name,
      phone: client.phone === 'Not provided' ? '' : client.phone,
      role: client.role,
      status: client.status,
      avatar_url: client.avatar_url || '',
      ban_reason: client.ban_reason || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEditClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient || !editForm.full_name.trim()) return

    const isSelf = checkIsSelf(editingClient)
    if (isSelf && (editForm.status === 'banned' || editForm.status === 'rejected')) {
      showToast('Action prohibited: You cannot ban, suspend, or reject your own account.', 'error')
      return
    }

    const updatedData: Partial<AdminClient> = {
      full_name: editForm.full_name.trim(),
      phone: editForm.phone.trim() || 'Not provided',
      role: editForm.role,
      status: editForm.status,
      avatar_url: editForm.avatar_url.trim() || null,
      ban_reason: editForm.status === 'banned' ? editForm.ban_reason.trim() || 'Administrative suspension' : null,
    }

    await updateClient(editingClient.id, updatedData)

    // Update selectedClient state if open
    if (selectedClient && selectedClient.id === editingClient.id) {
      setSelectedClient((prev) =>
        prev
          ? {
              ...prev,
              ...updatedData,
            }
          : null
      )
    }

    setEditModalOpen(false)
  }

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(true)
      showToast('Client UUID copied to clipboard.', 'info')
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      showToast('Failed to copy ID.', 'error')
    }
  }

  const handleBanClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    if (checkIsSelf(selectedClient)) {
      showToast('Action prohibited: You cannot ban or suspend your own account.', 'error')
      setBanModalOpen(false)
      return
    }

    updateClientStatus(selectedClient.id, 'banned', banReasonText.trim() || 'Administrative suspension')
    setSelectedClient((prev) =>
      prev
        ? {
            ...prev,
            status: 'banned',
            ban_reason: banReasonText.trim() || 'Administrative suspension',
          }
        : null
    )
    setBanModalOpen(false)
    setBanReasonText('')
  }

  const handleRestoreClient = () => {
    if (!selectedClient) return
    updateClientStatus(selectedClient.id, 'active', null)
    setSelectedClient((prev) => (prev ? { ...prev, status: 'active', ban_reason: null } : null))
  }

  const handleInviteClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.full_name.trim() || !inviteForm.email.trim()) return

    addClient({
      full_name: inviteForm.full_name.trim(),
      email: inviteForm.email.trim(),
      phone: inviteForm.phone.trim() || 'Not provided',
      avatar_url: null,
      role: inviteForm.role,
      status: 'active',
      ban_reason: null,
    })

    setInviteModalOpen(false)
    setInviteForm({ full_name: '', email: '', phone: '', role: 'client' })
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
    setDatePreset('all')
    setStartDate('')
    setEndDate('')
  }

  // Bookings for selected client
  const clientBookings = selectedClient
    ? bookings.filter((b) => b.user_id === selectedClient.id || b.client_email === selectedClient.email)
    : []

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Admin Header */}
      <AdminHeader
        breadcrumbs={[
          { label: 'Admin Console', href: '/admin/dashboard' },
          { label: 'Client Directory' },
        ]}
        title="Client Directory &amp; Moderation"
        subtitle="Manage member accounts, filter by registration date, sort by metrics, edit dossiers, and moderate access."
        actionButton={{
          label: 'Invite Client',
          onClick: () => setInviteModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Main Content Area */}
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Search & Multi-Filters Control Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px]">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="client">Clients (VIP)</option>
                  <option value="user">Standard Members</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned / Restricted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date Range Filter Bar */}
          <div className="pt-3 border-t border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <AdminDateFilter
              preset={datePreset}
              onPresetChange={setDatePreset}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onReset={() => {
                setDatePreset('all')
                setStartDate('')
                setEndDate('')
              }}
              label="Registration Date"
            />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-[11px]">
                Showing <strong className="text-foreground">{processedClients.length}</strong> of{' '}
                <strong className="text-foreground">{clients.length}</strong> accounts
              </span>
              {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || datePreset !== 'all' || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Client Roster Table with Click-to-Sort Headers */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                  <SortableHeader
                    field="full_name"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Member Identity
                  </SortableHeader>

                  <SortableHeader
                    field="created_at"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Contact &amp; Join Date
                  </SortableHeader>

                  <SortableHeader
                    field="role"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Role Tier
                  </SortableHeader>

                  <SortableHeader
                    field="status"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Account Standing
                  </SortableHeader>

                  <SortableHeader
                    field="total_spent"
                    currentSortField={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Lifetime Activity
                  </SortableHeader>

                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {processedClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No client accounts found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  processedClients.map((client) => {
                    const isSelf = checkIsSelf(client)
                    return (
                      <tr
                        key={client.id}
                        onClick={() => openDossier(client)}
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                          isSelf ? 'bg-primary/5' : ''
                        }`}
                      >
                        {/* Identity with Self Badge */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={client.avatar_url}
                              name={client.full_name || client.email}
                              size="md"
                              className={`w-10 h-10 ring-1 ${
                                isSelf ? 'ring-primary' : 'ring-border'
                              }`}
                            />
                            <div>
                              <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                <span>{client.full_name}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1 shrink-0 shadow-2xs">
                                    ✦ You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Join Date */}
                        <td className="py-4 px-4 space-y-0.5">
                          <div className="font-semibold text-foreground text-[11px]">
                            {client.phone}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-accent" />
                            <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Role Tier */}
                        <td className="py-4 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              client.role === 'admin'
                                ? 'bg-accent/15 text-accent border-accent/30'
                                : client.role === 'client'
                                ? 'bg-primary/10 text-primary border-primary/25'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {client.role === 'client' ? 'VIP Client' : client.role}
                          </span>
                        </td>

                        {/* Standing Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit ${
                              client.status === 'active'
                                ? 'bg-[#3e6b48]/10 text-[#3e6b48] border-[#3e6b48]/25'
                                : client.status === 'banned'
                                ? 'bg-destructive/10 text-destructive border-destructive/25'
                                : 'bg-accent/10 text-accent border-accent/25'
                            }`}
                          >
                            {client.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                            {client.status === 'banned' && <AlertCircle className="w-3 h-3" />}
                            {client.status === 'rejected' && <AlertTriangle className="w-3 h-3" />}
                            <span>{client.status}</span>
                          </span>
                        </td>

                        {/* Lifetime metrics */}
                        <td className="py-4 px-4 space-y-0.5">
                          <div className="font-bold text-foreground">
                            ${client.total_spent.toLocaleString()} CAD
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {client.total_bookings} appointments • Active {client.last_active}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditClient(client)
                              }}
                              title="Edit Client Profile"
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDossier(client)
                              }}
                              className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-primary transition-colors cursor-pointer shadow-2xs"
                            >
                              View Dossier
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CLIENT DOSSIER SLIDE-OVER DRAWER */}
      {dossierOpen && selectedClient && (
        <div
          onClick={() => setDossierOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between cursor-default"
          >
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedClient.avatar_url}
                    name={selectedClient.full_name || selectedClient.email}
                    size="lg"
                    className="w-14 h-14 ring-2 ring-primary/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-xl text-foreground">
                        {selectedClient.full_name}
                      </h3>
                      {checkIsSelf(selectedClient) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1 shadow-2xs">
                          ✦ You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditClient(selectedClient)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-primary" />
                    <span>Edit Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierOpen(false)}
                    aria-label="Close dossier"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {selectedClient.status === 'banned' ? (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Account Suspended / Banned</span>
                  </div>
                  <p className="text-[11px] pl-5 leading-relaxed text-foreground/80">
                    Reason: &ldquo;{selectedClient.ban_reason}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#3e6b48]/10 border border-[#3e6b48]/20 text-[#3e6b48] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Account Active &amp; Verified</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#3e6b48] bg-[#3e6b48]/10 px-2 py-0.5 rounded">
                    Good Standing
                  </span>
                </div>
              )}

              {/* Account UUID Box */}
              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  User Account UUID (Supabase Primary Key)
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-foreground truncate select-all">
                    {selectedClient.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(selectedClient.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-[#3e6b48]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lifetime Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Lifetime Spend
                  </span>
                  <div className="font-display text-xl font-bold text-foreground">
                    ${selectedClient.total_spent.toLocaleString()} CAD
                  </div>
                  <span className="text-[10px] text-[#3e6b48] font-semibold">100% Settled</span>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Appointments
                  </span>
                  <div className="font-display text-xl font-bold text-foreground">
                    {selectedClient.total_bookings} Bookings
                  </div>
                  <span className="text-[10px] text-muted-foreground">Historical attendance</span>
                </div>
              </div>

              {/* Client Appointment Ledger */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Reservation History</span>
                </h4>

                <div className="space-y-2">
                  {clientBookings.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground bg-background rounded-xl border border-border">
                      No previous appointment history recorded.
                    </div>
                  ) : (
                    clientBookings.map((bk) => (
                      <div
                        key={bk.id}
                        className="p-3 rounded-xl border border-border bg-background flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-primary">
                            {bk.booking_number}
                          </span>
                          <div className="font-semibold text-foreground">{bk.session_title}</div>
                          <div className="text-[10px] text-muted-foreground">{bk.session_date}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-foreground">
                            ${bk.total_price} {bk.currency}
                          </div>
                          <span className="text-[10px] text-[#3e6b48] capitalize">
                            {bk.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Administrative Governance / Moderation Controls with Self Protection */}
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="font-display font-bold text-sm text-foreground">
                  Administrative Governance
                </h4>

                {checkIsSelf(selectedClient) ? (
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-foreground flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] leading-relaxed">
                      This is your active authenticated administrator profile. Self-moderation actions (banning, suspending, or deleting self) are restricted to prevent administrative lockout.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.status === 'active' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setBanModalOpen(true)}
                          className="px-4 py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                        >
                          Ban / Suspend Account
                        </button>
                        <button
                          type="button"
                          onClick={() => updateClientStatus(selectedClient.id, 'rejected')}
                          className="px-4 py-2 rounded-xl border border-border bg-background text-muted-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                        >
                          Reject Application
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRestoreClient}
                        className="px-4 py-2 rounded-xl bg-[#3e6b48] text-[#fffaf3] text-xs font-bold uppercase tracking-wider hover:bg-[#3e6b48]/90 transition-all cursor-pointer shadow-xs"
                      >
                        Restore to Active Standing
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {editModalOpen && editingClient && (
        <div
          onClick={() => setEditModalOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">
                  Edit Member Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Email (Read-only for auth integrity) */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address (Primary Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingClient.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/60 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Role Tier & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Role Tier
                  </label>
                  <select
                    value={editForm.role}
                    disabled={checkIsSelf(editingClient)}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as AdminClient['role'] })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                  >
                    <option value="client">VIP Client</option>
                    <option value="user">Standard Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {checkIsSelf(editingClient) && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Lock className="w-2.5 h-2.5" /> Self-demotion restricted
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Account Standing
                  </label>
                  <select
                    value={editForm.status}
                    disabled={checkIsSelf(editingClient)}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AdminClient['status'] })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                  >
                    <option value="active">Active</option>
                    <option value="banned">Banned / Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {checkIsSelf(editingClient) && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Lock className="w-2.5 h-2.5" /> Self-suspension restricted
                    </p>
                  )}
                </div>
              </div>

              {/* Ban reason if banned */}
              {editForm.status === 'banned' && (
                <div className="space-y-1 animate-in fade-in">
                  <label className="text-xs font-bold uppercase tracking-wider text-destructive">
                    Reason for Suspension
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.ban_reason}
                    onChange={(e) => setEditForm({ ...editForm, ban_reason: e.target.value })}
                    placeholder="Reason recorded on member account..."
                    className="w-full px-3.5 py-2 rounded-xl border border-destructive/40 bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BAN CLIENT REASON MODAL */}
      {banModalOpen && selectedClient && (
        <div
          onClick={() => setBanModalOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-destructive/40 rounded-2xl p-6 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center gap-2 text-destructive font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Suspend Client Account</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Banning <span className="font-bold text-foreground">{selectedClient.full_name}</span> will restrict them from placing new atelier reservations.
            </p>

            <form onSubmit={handleBanClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Reason for Suspension (Recorded in Profile)
                </label>
                <textarea
                  rows={3}
                  required
                  value={banReasonText}
                  onChange={(e) => setBanReasonText(e.target.value)}
                  placeholder="e.g. Repeated no-show violations, breach of atelier etiquette..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider hover:bg-destructive/90 transition-all cursor-pointer shadow-xs"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE CLIENT MODAL */}
      {inviteModalOpen && (
        <div
          onClick={() => setInviteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display font-bold text-lg text-foreground">
                Register New Client Profile
              </h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  placeholder="e.g. Charlotte de Valois"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="charlotte@atelier.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Initial Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value as AdminClient['role'] })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="client">Verified Atelier Client</option>
                  <option value="user">Standard Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
