import { useQuery, useMutation } from "@tanstack/react-query";
import { User, GpsPoint, Task, AdminLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CreateUserForm from "@/components/create-user-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth"; // Fix import path

export default function AdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: adminData, isLoading } = useQuery<{
    users: User[];
    points: GpsPoint[];
    tasks: Task[];
  }>({
    queryKey: ["/api/admin/data"],
  });

  const { data: logs } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {user?.isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
        </h1>
        <Badge variant="secondary" className="text-sm">
          {user?.isSuperAdmin ? 'Super Admin' : 'Admin'}
        </Badge>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="data">GPS Points & Tasks</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              {user?.isSuperAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <CreateUserForm allowAdminCreation={user?.isSuperAdmin} />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData?.users.map((u) => (
                  <Card key={u.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{u.username}</h3>
                            {u.isSuperAdmin && (
                              <Badge>Super Admin</Badge>
                            )}
                            {u.isAdmin && !u.isSuperAdmin && (
                              <Badge variant="secondary">Admin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(u.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        {((user?.isSuperAdmin && !u.isSuperAdmin) || (!user?.isSuperAdmin && !u.isAdmin)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUserMutation.mutate(u.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GPS Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData?.points.map((point) => (
                    <Card key={point.id}>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold">{point.apName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {point.latitude}, {point.longitude}
                        </p>
                        {point.description && (
                          <p className="mt-2 text-sm">{point.description}</p>
                        )}
                        {point.imageUrl && (
                          <img
                            src={point.imageUrl}
                            alt="GPS Point"
                            className="mt-2 rounded-md max-w-full h-auto"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData?.tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge variant="secondary">
                            Priority {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs?.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{log.action}</h3>
                          {log.details && (
                            <p className="text-sm text-muted-foreground">
                              {log.details}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}