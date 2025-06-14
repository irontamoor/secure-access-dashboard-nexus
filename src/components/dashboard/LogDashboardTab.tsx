
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import SmtpLogs from "./SmtpLogs";
import AllSwipeLogs from "./AllSwipeLogs";
import SystemErrorLogs from "./SystemErrorLogs";

export type LogType = "smtp" | "swipes" | "errors";

const EXPORT_OPTIONS: { label: string, value: LogType }[] = [
  { label: "SMTP Logs", value: "smtp" },
  { label: "Swipe Logs", value: "swipes" },
  { label: "System Errors (LDAP/SMTP/DB)", value: "errors" },
];

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function LogDashboardTab() {
  const [selected, setSelected] = useState<LogType>("smtp");

  // These refs will allow us to invoke the export CSV for each log type
  const smtpLogsRef = useRef<{ getCsv: () => string }>(null);
  const swipeLogsRef = useRef<{ getCsv: () => string }>(null);
  const systemErrorLogsRef = useRef<{ getCsv: () => string }>(null);

  const handleExport = () => {
    if (selected === "smtp") {
      const csv = smtpLogsRef.current?.getCsv?.();
      if (csv) downloadCsv(`smtp_logs_${new Date().toISOString().substr(0, 10)}.csv`, csv);
    } else if (selected === "swipes") {
      const csv = swipeLogsRef.current?.getCsv?.();
      if (csv) downloadCsv(`swipe_logs_${new Date().toISOString().substr(0, 10)}.csv`, csv);
    } else if (selected === "errors") {
      const csv = systemErrorLogsRef.current?.getCsv?.();
      if (csv) downloadCsv(`system_errors_${new Date().toISOString().substr(0, 10)}.csv`, csv);
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-2 mb-2">
        <Select value={selected} onValueChange={(v: LogType) => setSelected(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select logs to export" />
          </SelectTrigger>
          <SelectContent>
            {EXPORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button disabled={!selected} onClick={handleExport} variant="default">
          Export CSV
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-5 space-y-8">
        <div>
          <h3 className="font-bold text-lg mb-2">SMTP Logs</h3>
          <SmtpLogs ref={smtpLogsRef} hideExport />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">All Swipe Logs</h3>
          <AllSwipeLogs ref={swipeLogsRef} hideExport />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">System Errors (LDAP, SMTP, DB)</h3>
          <SystemErrorLogs ref={systemErrorLogsRef} hideExport />
        </div>
      </div>
    </section>
  );
}
