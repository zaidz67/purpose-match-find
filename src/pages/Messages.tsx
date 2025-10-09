import { useParams } from "react-router-dom";

const Messages = () => {
  const { conversationId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-2">
          {conversationId ? `Conversation: ${conversationId}` : "Select a conversation"}
        </p>
      </div>
    </div>
  );
};

export default Messages;