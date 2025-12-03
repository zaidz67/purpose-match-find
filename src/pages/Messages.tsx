import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const handleSelectConversation = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <Card className="h-[calc(100vh-200px)] grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Conversation List */}
          <div className="border-r hidden md:block">
            <ConversationList
              currentUserId={currentUserId}
              selectedConversationId={conversationId || null}
              onSelectConversation={handleSelectConversation}
            />
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2">
            {conversationId ? (
              <MessageThread
                currentUserId={currentUserId}
                otherUserId={conversationId}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messages;