
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import SmtpLogs from "./SmtpLogs";
import AllSwipeLogs from "./AllSwipeLogs";
import SystemErrorLogs from "./SystemErrorLogs";
import SmtpLogsComponent from "./SmtpLogs";
import AllSwipeLogsComponent from "./AllSwipeLogs";

const LOG_OPTIONS = [
  { label: "Swipe Logs", value: "swipes" },
  { label: "SMTP Logs", value: "smtp" },
  { label: "System Errors", value: "errors" }, // includes LDAP, DB, SMTP errors
];

export default function UnifiedLogsTab() {
  const [selectedLog, setSelectedLog] = useState("swipes");

  const smtpRef = useRef<{ getCsv: () => string }>(null);
  const swipeRef = useRef<{ getCsv: () => string }>(null);
  const systemErrorRef = useRef<{ getCsv: () => string }>(null);

  const handleExport = () => {
    let csv = "";
    let filename = "";
    if (selectedLog === "swipes") {
      csv = swipeRef.current?.getCsv?.() || "";
      filename = `swipe_logs_${new Date().toISOString().substr(0, 10)}.csv`;
    } else if (selectedLog === "smtp") {
      csv = smtpRef.current?.getCsv?.() || "";
      filename = `smtp_logs_${new Date().toISOString().substr(0, 10)}.csv`;
    } else if (selectedLog === "errors") {
      csv = systemErrorRef.current?.getCsv?.() || "";
      filename = `system_errors_${new Date().toISOString().substr(0, 10)}.csv`;
    }
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Select value={selectedLog} onValueChange={(v: string) => setSelectedLog(v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select log type" />
          </SelectTrigger>
          <SelectContent>
            {LOG_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleExport}>Export CSV</Button>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5 mt-2">
        {selectedLog === "swipes" && (
          <div>
            <h3 className="font-bold text-lg mb-3">All Swipe Logs</h3>
            <AllSwipeLogsComponent ref={swipeRef} hideExport />
          </div>
        )}

        {selectedLog === "smtp" && (
          <div>
            <h3 className="font-bold text-lg mb-3">SMTP Logs</h3>
            <SmtpLogsComponent ref={smtpRef} hideExport />
          </div>
        )}

        {selectedLog === "errors" && (
          <div>
            <h3 className="font-bold text-lg mb-3">System Errors (LDAP / SMTP / DB)</h3>
            <SystemErrorLogs ref={systemErrorRef} hideExport />
          </div>
        )}
      </div>
    </section>
  );
}
