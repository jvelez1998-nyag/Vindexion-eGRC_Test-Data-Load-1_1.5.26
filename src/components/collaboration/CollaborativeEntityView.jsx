import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Bell } from "lucide-react";
import EntityCommentThread from "./EntityCommentThread";
import SlackTeamsIntegration from "./SlackTeamsIntegration";
import TaskAssignment from "./TaskAssignment";

export default function CollaborativeEntityView({ entityType, entityId, entityName }) {
  return (
    <Tabs defaultValue="comments" className="w-full">
      <TabsList className="bg-[#1a2332]">
        <TabsTrigger value="comments" className="data-[state=active]:bg-[#2a3548]">
          <MessageSquare className="h-4 w-4 mr-2" />
          Discussion
        </TabsTrigger>
        <TabsTrigger value="tasks" className="data-[state=active]:bg-[#2a3548]">
          <Users className="h-4 w-4 mr-2" />
          Tasks
        </TabsTrigger>
        <TabsTrigger value="notifications" className="data-[state=active]:bg-[#2a3548]">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="comments">
        <EntityCommentThread 
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
        />
      </TabsContent>

      <TabsContent value="tasks">
        <TaskAssignment 
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
        />
      </TabsContent>

      <TabsContent value="notifications">
        <SlackTeamsIntegration 
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
        />
      </TabsContent>
    </Tabs>
  );
}