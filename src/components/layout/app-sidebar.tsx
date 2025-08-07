import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  LayoutGrid,
  PenSquare,
  Shapes,
  AppWindow,
} from "lucide-react";

export default function AppSidebar() {
  return (
    <>
      <SidebarHeader className="p-0 items-center justify-center h-16">
        <Shapes className="h-6 w-6 text-white" />
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto p-2">
        <SidebarMenu className="gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              className="flex-col h-auto py-2"
              size="lg"
              tooltip="Boards"
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-xs mt-1">BOARDS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="flex-col h-auto py-2"
              size="lg"
              tooltip="Ideas"
              isActive
            >
              <AppWindow className="w-5 h-5" />
              <span className="text-xs mt-1">IDEAS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="flex-col h-auto py-2"
              size="lg"
              tooltip="Editor"
            >
              <PenSquare className="w-5 h-5" />
              <span className="text-xs mt-1">EDITOR</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="icon" tooltip="Help">
              <HelpCircle className="h-5 w-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="icon" tooltip="User Profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
