import { useQuery } from "@tanstack/react-query";
import { GpsPoint } from "@shared/schema";
import GpsPointForm from "@/components/gps-point-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HomePage() {
  const { data: points, isLoading } = useQuery<GpsPoint[]>({
    queryKey: ["/api/gps-points"],
  });

  const deletePoint = async (id: number) => {
    await apiRequest("DELETE", `/api/gps-points/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/gps-points"] });
  };

  const exportToCsv = () => {
    window.location.href = "/api/export/gps-points";
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
              <CardTitle>Add GPS Point</CardTitle>
            </CardHeader>
            <CardContent>
              <GpsPointForm />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>GPS Points</CardTitle>
              <Button onClick={exportToCsv} variant="outline">
                Export to CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {points?.map((point) => (
                  <Card key={point.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{point.apName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {point.latitude}, {point.longitude}
                          </p>
                          {point.description && (
                            <p className="mt-2 text-sm">{point.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePoint(point.id)}
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
