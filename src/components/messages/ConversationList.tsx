import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  full_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ConversationListProps {
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (userId: string) => void;
}

export const ConversationList = ({
  currentUserId,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel("messages-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, any>();

      messages?.forEach((message) => {
        const otherUserId =
          message.sender_id === currentUserId
            ? message.recipient_id
            : message.sender_id;

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count:
              message.recipient_id === currentUserId && !message.is_read ? 1 : 0,
          });
        } else if (
          message.recipient_id === currentUserId &&
          !message.is_read
        ) {
          const conv = conversationMap.get(otherUserId);
          conv.unread_count += 1;
        }
      });

      const userIds = Array.from(conversationMap.keys());
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const enrichedConversations = Array.from(conversationMap.values()).map(
          (conv) => {
            const profile = profiles?.find((p) => p.id === conv.id);
            return {
              ...conv,
              full_name: profile?.full_name || "Unknown User",
              avatar_url: profile?.avatar_url,
            };
          }
        );

        setConversations(enrichedConversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start connecting with people to begin messaging
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors ${
              selectedConversationId === conversation.id ? "bg-accent" : ""
            }`}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.avatar_url || ""} />
              <AvatarFallback>
                {conversation.full_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{conversation.full_name}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conversation.last_message_time), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
