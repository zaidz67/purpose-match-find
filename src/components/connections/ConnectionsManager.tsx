import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectionRequestCard } from "./ConnectionRequestCard";
import { Users, UserPlus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  message?: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  current_intent?: string[];
}

interface ConnectionWithProfile {
  connection: Connection;
  profile: Profile;
}

export const ConnectionsManager = () => {
  const [pendingReceived, setPendingReceived] = useState<ConnectionWithProfile[]>([]);
  const [pendingSent, setPendingSent] = useState<ConnectionWithProfile[]>([]);
  const [accepted, setAccepted] = useState<ConnectionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connections, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = new Set<string>();
      connections?.forEach((c) => {
        if (c.requester_id !== user.id) userIds.add(c.requester_id);
        if (c.recipient_id !== user.id) userIds.add(c.recipient_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, location, current_intent")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      const received: ConnectionWithProfile[] = [];
      const sent: ConnectionWithProfile[] = [];
      const connected: ConnectionWithProfile[] = [];

      connections?.forEach((conn) => {
        const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        const profile = profileMap.get(otherUserId);
        
        if (!profile) return;

        const item = { connection: conn, profile };

        if (conn.status === "accepted") {
          connected.push(item);
        } else if (conn.status === "pending") {
          if (conn.requester_id === user.id) {
            sent.push(item);
          } else {
            received.push(item);
          }
        }
      });

      setPendingReceived(received);
      setPendingSent(sent);
      setAccepted(connected);
    } catch (error: any) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAccept = async (connectionId: string) => {
    setActionLoading(connectionId);
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({ title: "Connection accepted!" });
      fetchConnections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (connectionId: string) => {
    setActionLoading(connectionId);
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({ title: "Connection declined" });
      fetchConnections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Received */}
      {pendingReceived.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Connection Requests</h3>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {pendingReceived.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingReceived.map(({ connection, profile }) => (
              <ConnectionRequestCard
                key={connection.id}
                connection={connection}
                profile={profile}
                type="received"
                onAccept={() => handleAccept(connection.id)}
                onDecline={() => handleDecline(connection.id)}
                isLoading={actionLoading === connection.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Sent */}
      {pendingSent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Pending Requests</h3>
          </div>
          <div className="space-y-3">
            {pendingSent.map(({ connection, profile }) => (
              <ConnectionRequestCard
                key={connection.id}
                connection={connection}
                profile={profile}
                type="sent"
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted Connections */}
      {accepted.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Your Connections</h3>
            <span className="text-muted-foreground text-sm">({accepted.length})</span>
          </div>
          <div className="space-y-3">
            {accepted.map(({ connection, profile }) => (
              <ConnectionRequestCard
                key={connection.id}
                connection={connection}
                profile={profile}
                type="connected"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingReceived.length === 0 && pendingSent.length === 0 && accepted.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
          <p className="text-muted-foreground">
            Search for people and send connection requests to grow your network.
          </p>
        </Card>
      )}
    </div>
  );
};
