'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Avatar } from '@/components/ui/Avatar'
import { useAdminMock } from '@/context/AdminMockContext'
import { AdminClient } from '@/lib/admin/mockData'
import { useToast } from '@/components/ui/ToastContext'

export default function AdminClientsPage() {
  const { clients, addClient, updateClientStatus, bookings } = useAdminMock()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Selected Client Dossier Drawer
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null)
  const [dossierOpen, setDossierOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

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

  // Filtered Clients
  const filteredClients = clients.filter((client) => {
    const matchesRole = roleFilter === 'all' || client.role === roleFilter
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesSearch =
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    return matchesRole && matchesStatus && matchesSearch
  })

  const openDossier = (client: AdminClient) => {
    setSelectedClient(client)
    setDossierOpen(true)
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
        subtitle="Manage member accounts, review lifetime appointment histories, and enforce studio policies."
        actionButton={{
          label: 'Invite Client',
          onClick: () => setInviteModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Main Content Area */}
      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Search & Multi-Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
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

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold text-[11px]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="client">Clients (Verified)</option>
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
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="banned">Banned / Restricted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client Roster Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Member Identity</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Role Tier</th>
                  <th className="py-3.5 px-4">Account Standing</th>
                  <th className="py-3.5 px-4">Lifetime Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No client accounts found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => openDossier(client)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      {/* Identity */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={client.avatar_url}
                            name={client.full_name || client.email}
                            size="md"
                            className="w-10 h-10 ring-1 ring-border"
                          />
                          <div>
                            <div className="font-bold text-foreground text-sm">
                              {client.full_name}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground text-[11px]">
                          {client.phone}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Joined {new Date(client.created_at).toLocaleDateString()}
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
                      <td className="py-4 px-4">
                        <div className="font-bold text-foreground">
                          ${client.total_spent.toLocaleString()} CAD
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {client.total_bookings} appointments • Active {client.last_active}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CLIENT DOSSIER SLIDE-OVER DRAWER */}
      {dossierOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
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
                    <h3 className="font-display font-bold text-xl text-foreground">
                      {selectedClient.full_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDossierOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
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

              {/* Moderation Controls */}
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="font-display font-bold text-sm text-foreground">
                  Administrative Governance
                </h4>

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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BAN CLIENT REASON MODAL */}
      {banModalOpen && selectedClient && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-destructive/40 rounded-2xl p-6 shadow-2xl space-y-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
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
