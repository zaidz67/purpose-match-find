import { useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">Profile View</h1>
        <p className="text-muted-foreground mt-2">
          {userId ? `Viewing profile: ${userId}` : "Your profile"}
        </p>
      </div>
    </div>
  );
};

export default Profile;