"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Settings, User, Building2, Bell, Shield, Link2, CreditCard, Save, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "salon",         label: "Salon Info",     icon: Building2 },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "integrations",  label: "Integrations",   icon: Link2 },
  { id: "billing",       label: "Billing",        icon: CreditCard },
];

function Field({ label, placeholder, type = "text", defaultValue = "" }: { label: string; placeholder: string; type?: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-text-secondary">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full h-10 px-3.5 rounded-xl bg-black/[0.03] border border-black/[0.07] text-[13px] font-medium text-text-primary placeholder:text-text-muted focus:bg-white focus:border-lavender/40 focus:ring-4 focus:ring-lavender/10 outline-none transition-all"
      />
    </div>
  );
}

function Toggle({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-black/[0.04] last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-text-primary">{label}</p>
        {description && <p className="text-[11px] text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        aria-pressed={on}
        className={cn("relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0", on ? "bg-lavender" : "bg-black/[0.12]")}
      >
        <span className={cn("absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200", on ? "translate-x-4.5" : "translate-x-0")} />
      </button>
    </div>
  );
}

const INTEGRATION_LIST = [
  { name: "Stripe Payments",    status: "Connected",     logo: "💳" },
  { name: "Google Calendar",    status: "Connected",     logo: "📅" },
  { name: "Twilio SMS",         status: "Not connected", logo: "💬" },
  { name: "Mailchimp",          status: "Not connected", logo: "📧" },
  { name: "Zapier",             status: "Connected",     logo: "⚡" },
];

function ProfileTab({ user }: { user: any }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender to-blush flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          {(user?.user_metadata?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-text-primary">{user?.user_metadata?.full_name || "Your Name"}</p>
          <p className="text-[12px] text-text-muted">{user?.email}</p>
          <button className="mt-1.5 text-[11px] font-semibold text-lavender hover:underline">Change avatar</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name"  placeholder="Your full name"  defaultValue={user?.user_metadata?.full_name || ""} />
        <Field label="Job Title"  placeholder="e.g. Chief Operations Officer" />
        <Field label="Email"      placeholder="your@email.com"  type="email" defaultValue={user?.email || ""} />
        <Field label="Phone"      placeholder="+1 555 000 0000" type="tel" />
      </div>
    </div>
  );
}

function SalonTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Salon Name"    placeholder="e.g. NeuroStrom Soho" defaultValue="NeuroStrom Flagship" />
      <Field label="Business Type" placeholder="e.g. Hair & Beauty" />
      <Field label="Address Line 1" placeholder="123 Main Street" />
      <Field label="City"          placeholder="New York" />
      <Field label="ZIP / Postcode" placeholder="10001" />
      <Field label="Country"       placeholder="United States" />
      <div className="sm:col-span-2">
        <Field label="Website"     placeholder="https://yoursalon.com" type="url" />
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-0">
      <Toggle label="Appointment reminders"     description="Send SMS/email 24h before"           defaultChecked={true}  />
      <Toggle label="AI scan alerts"            description="Notify when Beauty Passport completes" defaultChecked={true}  />
      <Toggle label="Staff performance reports" description="Weekly digest every Monday"            defaultChecked={false} />
      <Toggle label="Revenue milestones"        description="Alert when targets are hit"            defaultChecked={true}  />
      <Toggle label="System status updates"     description="Downtime and maintenance notices"      defaultChecked={true}  />
      <Toggle label="Marketing emails"          description="Promotions and product updates"        defaultChecked={false} />
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Current Password" placeholder="••••••••"     type="password" />
        <Field label="New Password"     placeholder="••••••••"     type="password" />
        <Field label="Confirm Password" placeholder="••••••••"     type="password" />
      </div>
      <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04] space-y-0">
        <Toggle label="Two-factor authentication" description="Require OTP on every login" defaultChecked={true} />
        <Toggle label="Active session alerts"     description="Email when new device signs in"  defaultChecked={true} />
        <Toggle label="Biometric login"           description="Use fingerprint / Face ID on mobile" />
      </div>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-2">
      {INTEGRATION_LIST.map((item, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-black/[0.05] hover:border-lavender/30 transition-all">
          <span className="text-2xl">{item.logo}</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-primary">{item.name}</p>
            <p className={cn("text-[11px] font-medium", item.status === "Connected" ? "text-sage-dark" : "text-text-muted")}>{item.status}</p>
          </div>
          <button className={cn("h-8 px-3.5 rounded-xl text-[12px] font-semibold transition-all", item.status === "Connected" ? "bg-black/[0.04] text-text-secondary hover:bg-black/[0.08]" : "bg-lavender/20 text-[#6b4fa0] hover:bg-lavender/30")}>
            {item.status === "Connected" ? "Manage" : "Connect"}
          </button>
        </div>
      ))}
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-lavender/20 to-blush/10 border border-lavender/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Current Plan</p>
            <p className="text-xl font-extrabold text-text-primary">Enterprise Pro</p>
            <p className="text-[12px] text-text-secondary mt-0.5">$299 / month · Renews Jun 1, 2026</p>
          </div>
          <span className="badge-success text-[10px] font-bold px-3 py-1 rounded-full">Active</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Cardholder Name"  placeholder="Name on card" />
        <Field label="Card Number"      placeholder="•••• •••• •••• ••••" />
        <Field label="Expiry"           placeholder="MM / YY" />
        <Field label="CVV"              placeholder="•••" />
      </div>
      <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
        <p className="text-[12px] font-semibold text-text-secondary mb-3">Recent Invoices</p>
        {["May 2026 — $299","Apr 2026 — $299","Mar 2026 — $299"].map((inv, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-0">
            <p className="text-[12px] font-medium text-text-primary">{inv}</p>
            <button className="text-[11px] font-semibold text-lavender hover:underline">Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<string, (user: any) => React.ReactNode> = {
  profile:       (u) => <ProfileTab user={u} />,
  salon:         ()  => <SalonTab />,
  notifications: ()  => <NotificationsTab />,
  security:      ()  => <SecurityTab />,
  integrations:  ()  => <IntegrationsTab />,
  billing:       ()  => <BillingTab />,
};

export default function CoreSettingsPage() {
  const [active, setActive] = useState("profile");
  const { user } = useAuth();

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="section-label mb-1">System</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Core Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account, salon, and platform preferences.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="lg:w-52 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                  active === tab.id
                    ? "nav-pill-active text-text-primary"
                    : "text-text-secondary hover:bg-black/[0.04] hover:text-text-primary"
                )}
              >
                <tab.icon className={cn("w-4 h-4 shrink-0", active === tab.id ? "text-lavender" : "text-text-muted")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card p-6 space-y-5"
          >
            <h2 className="text-base font-bold text-text-primary border-b border-black/[0.05] pb-4">
              {TABS.find(t => t.id === active)?.label}
            </h2>
            {TAB_CONTENT[active]?.(user)}
            <div className="pt-2 flex justify-end">
              <button className="h-10 px-5 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-md hover:bg-text-primary/90 transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
