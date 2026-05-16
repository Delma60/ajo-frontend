// app/dashboard/layout.tsx
import {
  SidebarProvider, Sidebar, SidebarLayout, SidebarContent,
  SidebarHeader, SidebarScrollArea, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarItem, SidebarSeparator, SidebarTrigger,
  SidebarRailToggle, SidebarUser,
} from '@/components/ui/sidebar'

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider defaultOpen persist>
      <SidebarLayout>
        <Sidebar>
          <SidebarHeader>
            <span style={{ fontFamily: 'Georgia,serif' }} className="text-white font-semibold text-lg">AjoSave</span>
            <SidebarRailToggle className="ml-auto" />
          </SidebarHeader>

          <SidebarScrollArea>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarItem icon={<HomeIcon />} active tooltip="Dashboard">Dashboard</SidebarItem>
                <SidebarItem icon={<CircleIcon />} badge={3} tooltip="Circles">Circles</SidebarItem>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup collapsible defaultExpanded={false}>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarItem icon={<SettingsIcon />} tooltip="Settings">Settings</SidebarItem>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarScrollArea>

          <SidebarFooter>
            <SidebarUser name="Adaeze Okafor" email="adaeze@example.com" initials="AO" />
          </SidebarFooter>
        </Sidebar>

        <SidebarContent>
          {/* page-level trigger for mobile */}
          <header className="flex h-16 items-center px-6 md:hidden">
            <SidebarTrigger variant="mobile" />
          </header>
          {children}
        </SidebarContent>
      </SidebarLayout>
    </SidebarProvider>
  )
}