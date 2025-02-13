import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { MapPin, CheckSquare, Shield } from "lucide-react";
import { Badge } from "./ui/badge"; // Assuming Badge component exists

export default function NavBar() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                GPS Points
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="ghost" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks
              </Button>
            </Link>
            {user.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.username}
              {user.isAdmin && (
                <Badge variant="secondary" className="ml-2">
                  Admin
                </Badge>
              )}
            </span>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}