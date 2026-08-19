import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import CommentThread from "./CommentThread";
import TaskAssignment from "./TaskAssignment";

export default function CollaborationPanel({ entityType, entityId, entityTitle }) {
  return (
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="bg-[#1a2332] border border-[#2a3548]">
        <TabsTrigger value="comments">
          <MessageSquare className="h-4 w-4 mr-2" />
          Discussion
        </TabsTrigger>
        <TabsTrigger value="tasks">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Tasks
        </TabsTrigger>
      </TabsList>

      <TabsContent value="comments" className="mt-4">
        <CommentThread entityType={entityType} entityId={entityId} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TaskAssignment entityType={entityType} entityId={entityId} entityTitle={entityTitle} />
      </TabsContent>
    </Tabs>
  );
}