import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "accepted" | "rejected";

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
}

export const useConnection = (otherUserId: string) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("none");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnectionStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !otherUserId) {
        setIsLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      // Don't check connection with yourself
      if (user.id === otherUserId) {
        setConnectionStatus("none");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setConnectionStatus("none");
        setConnection(null);
      } else {
        setConnection(data as Connection);
        if (data.status === "accepted") {
          setConnectionStatus("accepted");
        } else if (data.status === "rejected") {
          setConnectionStatus("rejected");
        } else if (data.requester_id === user.id) {
          setConnectionStatus("pending_sent");
        } else {
          setConnectionStatus("pending_received");
        }
      }
    } catch (error: any) {
      console.error("Error fetching connection:", error);
    } finally {
      setIsLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  const sendConnectionRequest = async (message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to connect",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("connections")
        .insert({
          requester_id: user.id,
          recipient_id: otherUserId,
          status: "pending",
          message,
        });

      if (error) throw error;

      setConnectionStatus("pending_sent");
      toast({
        title: "Connection request sent",
        description: "Your request has been sent successfully",
      });
      return true;
    } catch (error: any) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
      return false;
    }
  };

  const acceptConnection = async () => {
    if (!connection) return false;

    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connection.id);

      if (error) throw error;

      setConnectionStatus("accepted");
      toast({
        title: "Connection accepted",
        description: "You are now connected!",
      });
      return true;
    } catch (error: any) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept connection",
        variant: "destructive",
      });
      return false;
    }
  };

  const declineConnection = async () => {
    if (!connection) return false;

    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", connection.id);

      if (error) throw error;

      setConnectionStatus("rejected");
      toast({
        title: "Connection declined",
      });
      return true;
    } catch (error: any) {
      console.error("Error declining connection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline connection",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    connectionStatus,
    connection,
    currentUserId,
    isLoading,
    sendConnectionRequest,
    acceptConnection,
    declineConnection,
    refetch: fetchConnectionStatus,
  };
};
