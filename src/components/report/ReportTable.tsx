import type { ReportJob } from "../../types";

type Props = {
  items: ReportJob[];
  loading: boolean;
  downloadingId: string | null;
  onDownload: (job: ReportJob) => void;
};

const formatDate = (value: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toISOString().slice(0, 10);
};

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toISOString().replace("T", " ").slice(0, 16);
};

export default function ReportTable({
  items,
  loading,
  downloadingId,
  onDownload,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr className="[&>th]:px-3 [&>th]:py-3">
            <th className="rounded-tl-lg">Device</th>
            <th>Status</th>
            <th>Created</th>
            <th>From</th>
            <th>To</th>
            <th className="rounded-tr-lg">Download</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((job) => (
            <tr key={job.id} className="odd:bg-white even:bg-slate-50/60">
              <td className="px-3 py-3 font-semibold text-slate-900">
                {job.deviceName || job.deviceId}
              </td>
              <td className="px-3 py-3 text-slate-700">{job.status}</td>
              <td className="px-3 py-3 text-slate-700">
                {formatDateTime(job.createdAt)}
              </td>
              <td className="px-3 py-3 text-slate-700">
                {formatDate(job.from)}
              </td>
              <td className="px-3 py-3 text-slate-700">
                {formatDate(job.to)}
              </td>
              <td className="px-3 py-3">
                <button
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => onDownload(job)}
                  disabled={downloadingId === job.id}
                >
                  {downloadingId === job.id ? "Downloading…" : "Download"}
                </button>
              </td>
            </tr>
          ))}

          {!loading && items.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-8 text-center text-sm text-slate-500"
              >
                No report jobs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
