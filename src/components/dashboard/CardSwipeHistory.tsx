
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Log {
  id: string;
  card_number: string;
  pin_used: string | null;
  door_id: string | null;
  timestamp: string;
  access_type: string;
}

export default function CardSwipeHistory() {
  const [searchCard, setSearchCard] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("access_logs")
      .select("*")
      .eq("card_number", searchCard as string)
      .order("timestamp", { ascending: false })
      .limit(50);
    setLogs(data || []);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Swipe History By Card</CardTitle>
        <CardDescription>
          Look up swipe/access events by card number to see all uses and locations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex gap-2 mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            fetchLogs();
          }}
        >
          <Input
            placeholder="Enter card number"
            value={searchCard}
            onChange={(e) => setSearchCard(e.target.value)}
            className="w-auto"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
        <div className="overflow-x-auto max-h-80">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Card Number</th>
                <th className="p-2">Door</th>
                <th className="p-2">PIN Used</th>
                <th className="p-2">Access</th>
                <th className="p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">No swipes found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2 font-mono">{log.card_number}</td>
                    <td className="p-2 font-mono">{log.door_id}</td>
                    <td className="p-2 font-mono">{log.pin_used}</td>
                    <td className="p-2">{log.access_type}</td>
                    <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
