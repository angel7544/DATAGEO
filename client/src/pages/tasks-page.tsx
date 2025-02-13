import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import TaskForm from "@/components/task-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

const priorityColors = {
  1: "bg-red-500",
  2: "bg-yellow-500",
  3: "bg-blue-500",
};

export default function TasksPage() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const toggleComplete = async (task: Task) => {
    await apiRequest("PATCH", `/api/tasks/${task.id}`, {
      completed: !task.completed,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
  };

  const deleteTask = async (id: number) => {
    await apiRequest("DELETE", `/api/tasks/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks?.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleComplete(task)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h3>
                              <Badge variant="secondary">
                                Priority {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
