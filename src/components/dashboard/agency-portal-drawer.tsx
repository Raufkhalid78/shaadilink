"use client";

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Crown,
  Sparkles,
  CreditCard,
  Building2,
  Users,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Download,
  Shield,
  Palette,
  Eye,
  Check,
  Phone,
  Globe,
  Instagram,
  X,
  Clock,
  Send,
  Zap,
  Pencil,
  Trash2,
  Calendar,
  UserPlus,
  Link as LinkIcon,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollableMenu } from "@/components/ui/scrollable-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export interface AgencyProfile {
  agencyName: string;
  agencyLogoUrl: string;
  tagline: string;
  contactPhone: string;
  instagramHandle: string;
  websiteUrl: string;
  accentColor: string;
  whiteLabelEnabled: boolean;
  creditsBalance: number;
}

export interface AgencyClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  invitationId?: string;
  packagePrice: number;
  status: "draft" | "review" | "approved" | "completed";
  eventDate?: string;
  notes?: string;
  createdAt: string;
}

interface InvitationSummary {
  id: string;
  partner1_name: string;
  partner2_name: string;
  plan: string;
  is_active: boolean;
  slug?: string;
  client_approval_status?: string;
  client_approval_notes?: string;
  client_approved_at?: string;
}

interface AgencyPortalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: InvitationSummary[];
  onActivateWithCredit?: (invitationId: string) => Promise<void>;
}

const DEFAULT_AGENCY_PROFILE: AgencyProfile = {
  agencyName: "Royale Moments Events",
  agencyLogoUrl: "",
  tagline: "Bespoke Weddings & Signature Celebrations",
  contactPhone: "+92 300 1234567",
  instagramHandle: "@royalemoments.pk",
  websiteUrl: "https://instagram.com/royalemoments.pk",
  accentColor: "#C9A84C",
  whiteLabelEnabled: true,
  creditsBalance: 8,
};

export function AgencyPortalDrawer({
  isOpen,
  onClose,
  invitations,
  onActivateWithCredit,
}: AgencyPortalDrawerProps) {
  const [activeTab, setActiveTab] = useState<"wallet" | "branding" | "clients" | "invoicing" | "review">("wallet");
  const [profile, setProfile] = useState<AgencyProfile>(DEFAULT_AGENCY_PROFILE);
  const [clients, setClients] = useState<AgencyClient[]>([
    {
      id: "client-1",
      name: "Ahmed & Fatima",
      phone: "+92 321 9876543",
      email: "ahmed.wedding@gmail.com",
      invitationId: invitations[0]?.id,
      packagePrice: 15000,
      status: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "client-2",
      name: "Zainab & Bilal Walima",
      phone: "+92 301 5554321",
      email: "zainab.events@gmail.com",
      invitationId: invitations[1]?.id,
      packagePrice: 18500,
      status: "review",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Invoice generator state
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${new Date().getFullYear()}-0082`);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(15000);
  const [invoiceNotes, setInvoiceNotes] = useState<string>("Payment via Bank Transfer (Meezan Bank) or JazzCash. Thank you for choosing Royale Moments!");
  const [isActivating, setIsActivating] = useState<string | null>(null);

  // Client Add/Edit Modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<AgencyClient | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    packagePrice: 15000,
    status: "draft" as AgencyClient["status"],
    invitationId: "",
    eventDate: "",
    notes: "",
  });

  // Delete Client Confirmation Modal state
  const [clientToDelete, setClientToDelete] = useState<AgencyClient | null>(null);

  // Review Tokens state
  const [reviewTokens, setReviewTokens] = useState<Record<string, { token: string; viewsCount: number; maxViews: number; isExpired: boolean; loading?: boolean }>>({});

  const fetchReviewToken = async (invId: string) => {
    try {
      setReviewTokens(prev => ({
        ...prev,
        [invId]: { ...prev[invId], loading: true, token: prev[invId]?.token || '', viewsCount: prev[invId]?.viewsCount || 0, maxViews: 7, isExpired: false }
      }));
      const res = await fetch(`/api/invitations/${invId}/review-token`);
      const data = await res.json();
      if (data.success) {
        setReviewTokens(prev => ({
          ...prev,
          [invId]: { token: data.token, viewsCount: data.viewsCount, maxViews: data.maxViews, isExpired: data.isExpired, loading: false }
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewTokens(prev => ({ ...prev, [invId]: { ...prev[invId], loading: false } }));
    }
  };

  const handleResetReviewToken = async (invId: string) => {
    try {
      const res = await fetch(`/api/invitations/${invId}/review-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      const data = await res.json();
      if (data.success) {
        setReviewTokens(prev => ({
          ...prev,
          [invId]: { token: data.token, viewsCount: 0, maxViews: data.maxViews, isExpired: false, loading: false }
        }));
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(data.reviewUrl);
        }
        toast.success(`✨ Fresh Review Link generated & copied! (0/7 views, old link revoked).`);
      }
    } catch (err) {
      toast.error('Failed to regenerate review link.');
    }
  };

  useEffect(() => {
    if (activeTab === "review" && invitations.length > 0) {
      invitations.forEach(inv => {
        if (!reviewTokens[inv.id]) {
          fetchReviewToken(inv.id);
        }
      });
    }
  }, [activeTab, invitations]);

  const saveProfile = (newProfile: AgencyProfile) => {
    setProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("smartinvites_agency_profile", JSON.stringify(newProfile));
    }
  };

  const saveClients = (newClients: AgencyClient[]) => {
    setClients(newClients);
    if (typeof window !== "undefined") {
      localStorage.setItem("smartinvites_agency_clients", JSON.stringify(newClients));
    }
  };

  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientForm({
      name: "",
      phone: "+92 3",
      email: "",
      packagePrice: 15000,
      status: "draft",
      invitationId: invitations[0]?.id || "",
      eventDate: "",
      notes: "",
    });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (client: AgencyClient) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      packagePrice: client.packagePrice,
      status: client.status,
      invitationId: client.invitationId || "",
      eventDate: client.eventDate || "",
      notes: client.notes || "",
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      toast.error("Client or Event name is required.");
      return;
    }
    if (!clientForm.phone.trim()) {
      toast.error("Contact WhatsApp / Phone is required.");
      return;
    }

    if (editingClient) {
      const updated = clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              name: clientForm.name.trim(),
              phone: clientForm.phone.trim(),
              email: clientForm.email.trim(),
              packagePrice: Number(clientForm.packagePrice) || 0,
              status: clientForm.status,
              invitationId: clientForm.invitationId || undefined,
              eventDate: clientForm.eventDate.trim() || undefined,
              notes: clientForm.notes.trim() || undefined,
            }
          : c
      );
      saveClients(updated);
      toast.success(`Client "${clientForm.name.trim()}" updated.`);
    } else {
      const newC: AgencyClient = {
        id: `client-${Date.now()}`,
        name: clientForm.name.trim(),
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        packagePrice: Number(clientForm.packagePrice) || 0,
        status: clientForm.status,
        invitationId: clientForm.invitationId || undefined,
        eventDate: clientForm.eventDate.trim() || undefined,
        notes: clientForm.notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      saveClients([...clients, newC]);
      toast.success(`Client "${clientForm.name.trim()}" added to your workspace!`);
    }

    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleConfirmDeleteClient = () => {
    if (!clientToDelete) return;
    const name = clientToDelete.name;
    const updated = clients.filter((c) => c.id !== clientToDelete.id);
    saveClients(updated);
    if (selectedClientId === clientToDelete.id) {
      setSelectedClientId(updated[0]?.id || "");
    }
    setClientToDelete(null);
    toast.success(`Client account "${name}" removed.`);
  };

  // Add bulk credits
  const handleAddCredits = (amount: number, packName: string) => {
    const updated = { ...profile, creditsBalance: profile.creditsBalance + amount };
    saveProfile(updated);
    toast.success(`🎉 Wholesale Top-up Successful! Added ${amount} Agency Credits (${packName}).`);
  };

  // 1-Click credit activation
  const handleUseCredit = async (invitationId: string) => {
    if (profile.creditsBalance < 1) {
      toast.error("Insufficient credits! Please top up your wholesale agency balance.");
      setActiveTab("wallet");
      return;
    }

    setIsActivating(invitationId);
    try {
      if (onActivateWithCredit) {
        await onActivateWithCredit(invitationId);
      }
      const updated = { ...profile, creditsBalance: profile.creditsBalance - 1 };
      saveProfile(updated);
      toast.success("✨ Invitation successfully activated with 1 Agency Credit! Ready for guest dispatch.");
    } catch {
      toast.error("Failed to activate invitation. Please try again.");
    } finally {
      setIsActivating(null);
    }
  };

  // Export PDF Client Invoice
  const handleDownloadInvoice = () => {
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark luxury theme banner
    doc.setFillColor(18, 24, 32);
    doc.rect(0, 0, 210, 45, "F");

    // Gold accent bar
    doc.setFillColor(201, 168, 76);
    doc.rect(0, 44, 210, 2, "F");

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(245, 230, 200);
    doc.text(profile.agencyName.toUpperCase(), 15, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(212, 184, 138);
    doc.text(profile.tagline, 15, 30);
    doc.text(`${profile.contactPhone} | ${profile.instagramHandle}`, 15, 37);

    // INVOICE label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(201, 168, 76);
    doc.text("INVOICE", 150, 26);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(245, 230, 200);
    doc.text(invoiceNumber, 150, 34);

    // Bill To Section
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("INVOICE TO:", 15, 60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(client ? client.name : "Valued Client", 15, 68);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Contact: ${client ? client.phone : "N/A"}`, 15, 75);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 15, 82);

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 95, 180, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text("DESCRIPTION / SERVICE", 20, 101.5);
    doc.text("AMOUNT (PKR)", 155, 101.5);

    // Line Items
    let currentY = 115;
    const items = [
      { name: "Digital Invitation Portal & Interactive RSVP Engine", price: Math.round(invoiceAmount * 0.6) },
      { name: "Personalized WhatsApp Direct RSVP & Guest Links", price: Math.round(invoiceAmount * 0.25) },
      { name: "Entrance QR Gate Passes & Verification Management", price: invoiceAmount - Math.round(invoiceAmount * 0.6) - Math.round(invoiceAmount * 0.25) },
    ];

    items.forEach((item, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(`${idx + 1}. ${item.name}`, 20, currentY);
      doc.text(`PKR ${item.price.toLocaleString()}`, 155, currentY);
      doc.setDrawColor(230, 230, 230);
      doc.line(15, currentY + 4, 195, currentY + 4);
      currentY += 12;
    });

    // Total box
    currentY += 10;
    doc.setFillColor(250, 248, 242);
    doc.rect(120, currentY, 75, 22, "F");
    doc.setDrawColor(201, 168, 76);
    doc.rect(120, currentY, 75, 22, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("TOTAL DUE:", 125, currentY + 9);

    doc.setFontSize(15);
    doc.setTextColor(180, 130, 20);
    doc.text(`PKR ${invoiceAmount.toLocaleString()}`, 125, currentY + 17);

    // Payment Notes
    currentY += 35;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("PAYMENT INSTRUCTIONS & TERMS:", 15, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    const splitNotes = doc.splitTextToSize(invoiceNotes, 180);
    doc.text(splitNotes, 15, currentY + 6);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business! Powered by Smart Invites White-Label Engine.", 15, 285);

    doc.save(`${profile.agencyName.replace(/\s+/g, "_")}_Invoice_${invoiceNumber}.pdf`);
    toast.success("📄 Branded Client Invoice PDF downloaded successfully!");
  };

  const handleShareWhatsAppInvoice = () => {
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    const phoneClean = client ? client.phone.replace(/[^0-9]/g, "") : "";
    const waPhone = phoneClean.startsWith("0") ? `92${phoneClean.slice(1)}` : phoneClean;
    const msg = encodeURIComponent(
      `Salam ${client?.name || "Client"}!\n\nHere is your event invoice from *${profile.agencyName}*:\n\n📄 *Invoice #:* ${invoiceNumber}\n💰 *Amount Due:* PKR ${invoiceAmount.toLocaleString()}\n\n📝 *Payment Instructions:*\n${invoiceNotes}\n\nPlease let us know once payment is processed. Thank you!`
    );
    const url = waPhone ? `https://wa.me/${waPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("💬 Opened WhatsApp with invoice details!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end">
      <m.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="w-full max-w-2xl bg-zinc-950 border-l border-amber-500/20 text-zinc-100 flex flex-col h-full shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Agency & Planner Workspace</h2>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] uppercase font-semibold">
                  Pro Partner
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                White-label branding, wholesale credits, multi-client folders & client invoicing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation with Corner Scroll Arrows */}
        <div className="border-b border-zinc-800 bg-zinc-900/30 px-3 py-1">
          <ScrollableMenu
            variant="amber"
            scrollDistance={220}
            className="w-full"
            contentClassName="gap-1 px-1"
          >
            {[
              { id: "wallet", label: "Credits & Wallet", icon: CreditCard },
              { id: "branding", label: "White-Label Branding", icon: Palette },
              { id: "clients", label: "Client Accounts", icon: Users },
              { id: "invoicing", label: "Client Invoicing", icon: FileText },
              { id: "review", label: "Client Review Links", icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 text-xs font-medium whitespace-nowrap transition-all rounded-t-lg ${
                    active
                      ? "border-amber-400 text-amber-400 bg-amber-400/10 font-semibold"
                      : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </ScrollableMenu>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: WALLET & CREDITS */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Crown className="w-32 h-32 text-amber-400" />
                </div>
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider text-amber-300/80 font-medium">
                    Wholesale Balance
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <h3 className="text-4xl font-extrabold text-white font-mono">{profile.creditsBalance}</h3>
                    <span className="text-sm text-zinc-400 font-medium">Agency Credits available</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-2 max-w-md">
                    Each credit instantly publishes any Classic or Royal invitation without individual credit card checkouts.
                  </p>
                </div>
              </div>

              {/* Instant Credit Activation on Draft Invitations */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>1-Click Publish with Agency Credit</span>
                </h4>
                <div className="space-y-2.5">
                  {invitations.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-500">
                      No invitations found in your account.
                    </div>
                  ) : (
                    invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {inv.partner1_name} & {inv.partner2_name}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                inv.is_active
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]"
                              }
                            >
                              {inv.is_active ? "Published" : "Draft / Unpaid"}
                            </Badge>
                          </div>
                          <span className="text-xs text-zinc-500 capitalize">{inv.plan} Plan</span>
                        </div>

                        {inv.is_active ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isActivating === inv.id}
                            onClick={() => handleUseCredit(inv.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-8 px-3 rounded-lg shadow-md"
                          >
                            {isActivating === inv.id ? "Activating..." : "Activate (1 Credit)"}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Wholesale Bundles */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                  Buy Wholesale Bulk Credits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Pack 1 */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <Badge className="bg-zinc-800 text-zinc-300 text-[10px] mb-2">Starter Pack</Badge>
                      <h5 className="text-xl font-bold text-white font-mono">5 Credits</h5>
                      <p className="text-xs text-amber-400 font-medium mt-1">PKR 2,799 / invite</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-through">PKR 3,499 retail</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCredits(5, "Starter Pack")}
                      className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs h-8"
                    >
                      Top Up (20% Off)
                    </Button>
                  </div>

                  {/* Pack 2 */}
                  <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/20 to-zinc-900 border border-amber-500/50 hover:border-amber-400 transition-all flex flex-col justify-between relative shadow-lg">
                    <div className="absolute -top-2.5 right-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[9px] uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                    <div>
                      <Badge className="bg-amber-500/20 text-amber-300 text-[10px] mb-2 border-amber-500/30">Growth Pack</Badge>
                      <h5 className="text-xl font-bold text-white font-mono">15 Credits</h5>
                      <p className="text-xs text-amber-400 font-medium mt-1">PKR 2,275 / invite</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-through">PKR 3,499 retail</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCredits(15, "Growth Pack")}
                      className="mt-4 w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-8"
                    >
                      Top Up (35% Off)
                    </Button>
                  </div>

                  {/* Pack 3 */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <Badge className="bg-zinc-800 text-zinc-300 text-[10px] mb-2">Enterprise Pack</Badge>
                      <h5 className="text-xl font-bold text-white font-mono">30 Credits</h5>
                      <p className="text-xs text-amber-400 font-medium mt-1">PKR 1,750 / invite</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-through">PKR 3,499 retail</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCredits(30, "Enterprise Pack")}
                      className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs h-8"
                    >
                      Top Up (50% Off)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHITE-LABEL BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 space-y-1">
                  <span className="font-semibold text-white">White-Label Client Presentation</span>
                  <p>
                    When enabled, invitations created under your account will showcase your agency crest and custom link
                    in the footer, masking the default platform branding to preserve your client exclusivity.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Agency / Studio Name</label>
                  <Input
                    value={profile.agencyName}
                    onChange={(e) => saveProfile({ ...profile, agencyName: e.target.value })}
                    placeholder="e.g. Royale Moments Events"
                    className="bg-zinc-900 border-zinc-800 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Agency Tagline / Slogan</label>
                  <Input
                    value={profile.tagline}
                    onChange={(e) => saveProfile({ ...profile, tagline: e.target.value })}
                    placeholder="e.g. Bespoke Luxury Weddings & Decor"
                    className="bg-zinc-900 border-zinc-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Contact WhatsApp / Phone</label>
                    <Input
                      value={profile.contactPhone}
                      onChange={(e) => saveProfile({ ...profile, contactPhone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="bg-zinc-900 border-zinc-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Instagram Handle</label>
                    <Input
                      value={profile.instagramHandle}
                      onChange={(e) => saveProfile({ ...profile, instagramHandle: e.target.value })}
                      placeholder="@royaleevents.pk"
                      className="bg-zinc-900 border-zinc-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Agency Portfolio / Website Link</label>
                  <Input
                    value={profile.websiteUrl}
                    onChange={(e) => saveProfile({ ...profile, websiteUrl: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                    className="bg-zinc-900 border-zinc-800 text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white block">Enable White-Label Footer Badge</span>
                    <span className="text-xs text-zinc-400">
                      Replaces platform footer with your agency branding on all client invites
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.whiteLabelEnabled}
                    onChange={(e) => saveProfile({ ...profile, whiteLabelEnabled: e.target.checked })}
                    className="w-5 h-5 rounded border-zinc-700 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Live Preview */}
                <div className="pt-4">
                  <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                    Live Footer Badge Preview
                  </span>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-amber-500/30 text-xs text-zinc-300 shadow-inner">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Curated with elegance by <strong className="text-white">{profile.agencyName}</strong>
                      </span>
                      <ExternalLink className="w-3 h-3 text-amber-400 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Explicit Save Action */}
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      saveProfile(profile);
                      toast.success("✨ Agency branding profile saved successfully!");
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Branding Profile</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT ACCOUNTS */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                    Managed Client Accounts ({clients.length})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Track events, package pricing, and generate branded invoices
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={handleOpenAddClient}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Client</span>
                </Button>
              </div>

              {clients.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">No Client Accounts Yet</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Add your couples or corporate clients to manage their invitation status, pricing, and invoices in one place.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleOpenAddClient}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add First Client
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => {
                    const linkedInv = invitations.find((i) => i.id === client.invitationId);
                    const phoneClean = client.phone.replace(/[^0-9]/g, "");
                    const waLink = phoneClean.startsWith("0") ? `92${phoneClean.slice(1)}` : phoneClean;

                    return (
                      <div
                        key={client.id}
                        className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white truncate">{client.name}</h4>
                              {linkedInv && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                                  <LinkIcon className="w-2.5 h-2.5 text-amber-400" />
                                  <span className="truncate max-w-[140px]">
                                    {linkedInv.partner1_name} &amp; {linkedInv.partner2_name}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                              <a
                                href={`tel:${client.phone}`}
                                className="hover:text-amber-300 transition-colors flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-zinc-500" />
                                <span>{client.phone}</span>
                              </a>
                              {client.email && (
                                <span className="truncate max-w-[200px] text-zinc-400">
                                  • {client.email}
                                </span>
                              )}
                              {client.eventDate && (
                                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                  <Calendar className="w-3 h-3 text-zinc-500" />
                                  <span>{client.eventDate}</span>
                                </span>
                              )}
                            </div>
                            {client.notes && (
                              <p className="text-[11px] text-zinc-400/80 italic line-clamp-1 mt-0.5">
                                "{client.notes}"
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              client.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] shrink-0"
                                : client.status === "review"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] shrink-0"
                                : client.status === "completed"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px] shrink-0"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] shrink-0"
                            }
                          >
                            {client.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 flex-wrap text-xs text-zinc-400">
                          <div>
                            <span>Package: </span>
                            <strong className="text-amber-400 font-mono text-sm">
                              PKR {client.packagePrice.toLocaleString()}
                            </strong>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* WhatsApp Direct */}
                            {waLink && (
                              <a
                                href={`https://wa.me/${waLink}?text=${encodeURIComponent(
                                  `Salam ${client.name}! Following up on your event invitation details with ${profile.agencyName}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat on WhatsApp"
                                className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Generate Bill */}
                            <button
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setInvoiceAmount(client.packagePrice);
                                setActiveTab("invoicing");
                              }}
                              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors"
                              title="Generate PDF Bill"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="hidden sm:inline">Bill</span>
                            </button>

                            {/* Edit Client */}
                            <button
                              onClick={() => handleOpenEditClient(client)}
                              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                              title="Edit Client Details"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Client */}
                            <button
                              onClick={() => setClientToDelete(client)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                              title="Delete Client Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLIENT INVOICING */}
          {activeTab === "invoicing" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Branded Client Invoice Generator</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">Select Client</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        setSelectedClientId(e.target.value);
                        const c = clients.find((x) => x.id === e.target.value);
                        if (c) setInvoiceAmount(c.packagePrice);
                      }}
                      className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white px-3"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">Invoice Number</label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Package Total (PKR)</label>
                  <Input
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                    className="bg-zinc-950 border-zinc-800 text-sm font-mono h-9"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Payment Instructions & Notes</label>
                  <Textarea
                    rows={3}
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    onClick={handleDownloadInvoice}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-10 rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Luxury PDF Invoice</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShareWhatsAppInvoice}
                    className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs h-9 rounded-xl flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>Send Invoice Summary on WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT REVIEW LINKS */}
          {activeTab === "review" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <span className="text-sm font-bold text-white block">Client Approval & Review Links</span>
                <p className="text-xs text-zinc-400">
                  Send your couples or corporate clients a direct approval link so they can review their invitation draft
                  before you send it to all guests.
                </p>

                <div className="space-y-3 pt-2">
                  {invitations.map((inv) => {
                    const tokenData = reviewTokens[inv.id];
                    const activeToken = tokenData?.token || (inv as any).review_token || "";
                    const views = tokenData?.viewsCount ?? (inv as any).review_views_count ?? 0;
                    const maxViews = tokenData?.maxViews ?? (inv as any).review_max_views ?? 7;
                    const isExpired = views >= maxViews;

                    const phoneParam = profile.contactPhone ? `&agencyPhone=${encodeURIComponent(profile.contactPhone)}` : "";
                    const tokenQuery = activeToken ? `?token=${activeToken}` : "?review=true";
                    const reviewUrl = typeof window !== "undefined"
                      ? `${window.location.origin}/inv/${inv.slug || inv.id}${tokenQuery}${phoneParam}`
                      : `/inv/${inv.slug || inv.id}${tokenQuery}${phoneParam}`;

                    const isApproved = inv.client_approval_status === "approved";
                    const isChanges = inv.client_approval_status === "changes_requested";

                    return (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-white">
                                {inv.partner1_name} & {inv.partner2_name}
                              </span>
                              <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/20 text-amber-300 border-0">
                                {inv.is_active ? "Live" : "Draft"}
                              </Badge>

                              {/* View Limit Badge */}
                              <Badge
                                className={`text-[9px] px-2 py-0.5 border gap-1 font-mono font-bold ${
                                  isExpired
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                    : views >= maxViews - 2
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                }`}
                                title={`${views} of ${maxViews} allowed review sessions consumed`}
                              >
                                <span>👁️</span>
                                <span>{isExpired ? `Expired (${views}/${maxViews})` : `${views}/${maxViews} Views`}</span>
                              </Badge>

                              {/* Client Approval Status Badge */}
                              {isApproved ? (
                                <Badge className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>Approved by Client</span>
                                  {inv.client_approved_at && (
                                    <span className="opacity-75 text-[8px]">
                                      ({new Date(inv.client_approved_at).toLocaleDateString()})
                                    </span>
                                  )}
                                </Badge>
                              ) : isChanges ? (
                                <Badge className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 gap-1">
                                  <MessageSquare className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Changes Requested</span>
                                </Badge>
                              ) : (
                                <Badge className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Pending Client Review</span>
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono truncate max-w-xs sm:max-w-md block">
                              {reviewUrl}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(reviewUrl, "_blank", "noopener,noreferrer")}
                              className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                              title="Open client preview in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const waMsg = encodeURIComponent(
                                  `Salam! 🎉 Here is your interactive invitation draft preview for ${inv.partner1_name} & ${inv.partner2_name}. You can test the door reveal, background music, schedule, and maps on your phone:\n\n${reviewUrl}`
                                );
                                window.open(`https://wa.me/?text=${waMsg}`, "_blank", "noopener,noreferrer");
                              }}
                              className="h-7 px-2 text-xs text-[#25D366] hover:bg-[#25D366]/10"
                              title="Share via WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(reviewUrl);
                                toast.success(`📋 Secure Client Review Link copied! (${views}/${maxViews} views used)`);
                              }}
                              className="h-7 text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-200 gap-1"
                              title="Copy Review Link"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetReviewToken(inv.id)}
                              className="h-7 px-2 text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-300 gap-1"
                              title="Generate fresh 8-char review token and reset views to 0/7 (revokes old link)"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span className="hidden sm:inline">Reset</span>
                            </Button>
                          </div>
                        </div>

                        {/* If client left specific change requests, display them */}
                        {isChanges && inv.client_approval_notes && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Client Change Requests:</span>
                            <p className="italic text-zinc-200">"{inv.client_approval_notes}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </m.div>

      {/* ADD / EDIT CLIENT MODAL WINDOW */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-amber-500/30 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    {editingClient ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      {editingClient ? "Edit Client Account" : "Add New Client Account"}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Manage client contact, package bill, and card linkage
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsClientModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveClient} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Client / Couple Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="e.g. Daniyal & Sarah Barat"
                    className="bg-zinc-900 border-zinc-800 text-sm h-9"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      WhatsApp / Phone <span className="text-red-400">*</span>
                    </label>
                    <Input
                      required
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="bg-zinc-900 border-zinc-800 text-sm h-9"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Email Address (Optional)
                    </label>
                    <Input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="client@gmail.com"
                      className="bg-zinc-900 border-zinc-800 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Package Bill (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-400 font-bold">
                        PKR
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="500"
                        value={clientForm.packagePrice}
                        onChange={(e) =>
                          setClientForm({ ...clientForm, packagePrice: Number(e.target.value) || 0 })
                        }
                        className="bg-zinc-900 border-zinc-800 text-sm h-9 pl-12 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Workflow Status
                    </label>
                    <select
                      value={clientForm.status}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          status: e.target.value as AgencyClient["status"],
                        })
                      }
                      className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white px-3 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="draft">Draft - Planning Stage</option>
                      <option value="review">In Review - Client Preview</option>
                      <option value="approved">Approved - Ready/Published</option>
                      <option value="completed">Completed - Event Finished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Link Created Invitation (Optional)
                    </label>
                    <select
                      value={clientForm.invitationId}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, invitationId: e.target.value })
                      }
                      className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white px-3 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">None / Custom Client</option>
                      {invitations.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.partner1_name} &amp; {inv.partner2_name} ({inv.plan.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Event Date / Venue
                    </label>
                    <Input
                      value={clientForm.eventDate}
                      onChange={(e) => setClientForm({ ...clientForm, eventDate: e.target.value })}
                      placeholder="e.g. Dec 25, 2026 • Pearl Continental"
                      className="bg-zinc-900 border-zinc-800 text-sm h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Internal Planner Notes (Optional)
                  </label>
                  <Textarea
                    rows={2}
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    placeholder="e.g. Stage decor by Decora, groom wants slow background flute music"
                    className="bg-zinc-900 border-zinc-800 text-xs resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsClientModalOpen(false);
                      setEditingClient(null);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-9 px-4 gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingClient ? "Save Changes" : "Create Client Account"}</span>
                  </Button>
                </div>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CLIENT CONFIRMATION MODAL */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm rounded-2xl bg-zinc-950 border border-red-500/30 p-5 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-white">
                  Delete Client Account?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Are you sure you want to remove <strong className="text-white">{clientToDelete.name}</strong> from your managed client accounts?
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setClientToDelete(null)}
                  className="flex-1 text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmDeleteClient}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs h-9 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Client</span>
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
