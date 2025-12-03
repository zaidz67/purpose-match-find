import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ConnectionRequestCardProps {
  connection: {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: string;
    message?: string;
    created_at: string;
  };
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string;
    location?: string;
    current_intent?: string[];
  };
  type: "received" | "sent" | "connected";
  onAccept?: () => void;
  onDecline?: () => void;
  isLoading?: boolean;
}

export const ConnectionRequestCard = ({
  connection,
  profile,
  type,
  onAccept,
  onDecline,
  isLoading,
}: ConnectionRequestCardProps) => {
  const navigate = useNavigate();
  const initials = profile.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{profile.full_name}</h4>
          {profile.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {type === "received" && (
            <>
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isLoading}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDecline}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {type === "sent" && (
            <Badge variant="secondary">Pending</Badge>
          )}
          {type === "connected" && (
            <Badge className="bg-emerald-500 text-white">Connected</Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/profile/${profile.id}`)}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {connection.message && (
        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
          "{connection.message}"
        </p>
      )}
    </Card>
  );
};
