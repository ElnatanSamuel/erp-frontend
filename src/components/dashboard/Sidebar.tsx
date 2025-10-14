"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/staff", label: "Staff", icon: UsersIcon },
  { href: "/payment-voucher", label: "Payment Voucher", icon: VoucherIcon },
  { href: "/payroll", label: "Payroll", icon: PayrollIcon },
  { href: "/memos", label: "Memo", icon: MemoIcon },
  { href: "/circulars", label: "Circulars", icon: CircularsIcon },
  { href: "/maintenance", label: "Maintenance", icon: WrenchIcon },
  { href: "/logistics", label: "Logistics", icon: TruckIcon },
  { href: "/office-budget", label: "Office Budget", icon: BudgetIcon },
  { href: "/stocks-inventory", label: "Stocks and Inventory", icon: InventoryIcon },
  { href: "/notifications", label: "Notifications", icon: BellIcon },
  { href: "/capacity-building", label: "Capacity Building", icon: CapacityIcon },
  { href: "/procurement", label: "Procurements", icon: CartIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  function isActive(path: string, href: string) {
    if (href === "/") return path === "/";
    return path === href || path.startsWith(href + "/");
  }
  return (
    <aside className="w-[260px] h-screen bg-white border-r border-gray-100 flex flex-col overflow-hidden">
      <div className="h-16 flex items-center px-6">
        <div className="text-lg font-semibold">ERP System</div>
      </div>
      <nav className="flex-1 overflow-y-auto thin-scroll py-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm ${
                active
                  ? "text-blue-600 bg-blue-50 relative"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r" />
              )}
              <Icon className={active ? "text-blue-600" : "text-gray-400"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="h-12" />
    </aside>
  );
}

function IconWrapper({ className, children }: any) {
  return (
    <span
      className={`inline-flex items-center justify-center h-5 w-5 ${className}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

function DashboardIcon({ className = "" }) {
  return (
    <IconWrapper className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    </IconWrapper>
  );
}
function UsersIcon({ className = "" }) {
  return (
    <IconWrapper className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    </IconWrapper>
  );
}
function VoucherIcon({ className = "" }) {
  return (
    <IconWrapper className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4 6h16v12H4z" opacity=".2"/><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H4V6h16v12z"/>
      </svg>
    </IconWrapper>
  );
}
function PayrollIcon({ className = "" }) {
  return (
    <IconWrapper className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 20c-3.87-1.11-7-5.21-7-9.71V6.3l7-3.11 7 3.11v5C19 15.79 15.87 19.89 12 21z"/>
      </svg>
    </IconWrapper>
  );
}
function MemoIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M5 3h14a2 2 0 012 2v11l-4 4H5a2 2 0 01-2-2V5a2 2 0 012-2zm11 16l3-3h-3v3z"/></svg>
  </IconWrapper>
);} 
function CircularsIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v6l5 3-.75 1.23L12 14V7h1z"/></svg>
  </IconWrapper>
);} 
function WrenchIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M22.7 19.3l-6.4-6.4a7 7 0 11-3.6-3.6l6.4 6.4 3.6 3.6zM7 10a3 3 0 100-6 3 3 0 000 6z"/></svg>
  </IconWrapper>
);} 
function TruckIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 13h11V6H3v7zm13-5h3l3 3v4h-2a2 2 0 01-4 0H8a2 2 0 11-4 0H3v-2h13V8z"/></svg>
  </IconWrapper>
);} 
function BudgetIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 5h18v4H3V5zm0 6h18v8H3v-8zm5 2v4h2v-4H8z"/></svg>
  </IconWrapper>
);} 
function InventoryIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20 6H4l-2 4v10a2 2 0 002 2h16a2 2 0 002-2V10l-2-4zM4 20V10h16v10H4z"/></svg>
  </IconWrapper>
);} 
function BellIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zM18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"/></svg>
  </IconWrapper>
);} 
function CapacityIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2l9 4v6c0 5-3.6 9.3-9 10-5.4-.7-9-5-9-10V6l9-4z"/></svg>
  </IconWrapper>
);} 
function CartIcon({ className = "" }) { return (
  <IconWrapper className={className}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.68l1.74-8H6L5.27 2H2v2h2l3.6 7.59L5.25 17h13.5v-2H7.16z"/></svg>
  </IconWrapper>
);} 
