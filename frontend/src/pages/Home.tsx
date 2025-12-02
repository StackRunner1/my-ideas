import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to MyIdeas</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Capture, organize, and develop your ideas with our simple and powerful
          platform.
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={() => navigate("/style-guide")} variant="outline">
            View Style Guide
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in to get started with your ideas dashboard.
        </p>
      </div>
    </div>
  );
}
