"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
  
    {
      title: "SMS",
      url: "/sms",
      icon: AudioWaveform,
      items: [
        {
          title: "Yeni SMS",
          url: "/sms/new",
        },
        {
          title: "Toplu SMS",
          url: "/sms/bulk",
        },
        {
          title: "Dosyadan Gönder",
          url: "/sms/import",
        },
        {
          title: "Şablonlar",
          url: "/sms/templates",
        },
      ],
    },
    {
      title: "Raporlar",
      url: "/reports",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: "SMS Logları",
          url: "/reports/sms",
        },
        {
          title: "Kampanya Logları",
          url: "/reports/campaigns",
        },
        {
          title: "Özet Rapor",
          url: "/reports/summary",
        },
        {
          title: "Fatura Raporu",
          url: "/reports/billing",
        },
      ],
    },
    {
      title: "Rehber",
      url: "/contacts",
      icon: BookOpen,
      items: [
        {
          title: "Kişiler",
          url: "/contacts",
        },
        {
          title: "Gruplar",
          url: "/contacts/groups",
        },
        {
          title: "Kara Liste",
          url: "/contacts/blacklist",
        },
      ],
    },
    {
      title: "Yönetim",
      url: "/admin",
      icon: Settings2,
      items: [
        {
          title: "Bayiler",
          url: "/tenants",
        },
        {
          title: "Kullanıcılar",
          url: "/users",
        },
        {
          title: "SMS Başlıkları",
          url: "/settings/titles",
        },
        {
          title: "Ayarlar",
          url: "/settings",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
 
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
