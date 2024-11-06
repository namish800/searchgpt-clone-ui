// Sidebar.tsx

import { ChevronDown, MessageSquarePlus, MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function Sidebar() {
  return (
    <div className="flex flex-col border-r border-border bg-black">
      <div className="p-4">
        <Button className="w-full justify-start gap-2" variant="outline">
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Recent Chats</h4>
            <nav className="space-y-1">
            </nav>
          </div>
        </div>
      </ScrollArea>
      <Separator className="bg-border" />
      <div className="p-4">
        <Button className="w-full justify-between" variant="ghost">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <div className="text-sm">
              <div className="text-foreground">namish800</div>
              <div className="text-xs text-muted-foreground">Free</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
