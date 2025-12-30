import { useEffect, useMemo, useState } from "react";
import "./index.css";
import { ErrorBanner } from "./components/common/ErrorBanner";
import { Pagination } from "./components/common/Pagination";
import ReportTable from "./components/report/ReportTable";
import ReportRequestForm from "./components/report/ReportRequestForm";
import { PageResult, ReportJob } from "./types";

type Props = {
  apiBase?: string;
  accessToken?: string | null;
};

const filenameFromDisposition = (header: string | null) => {
  if (!header) return null;
  const match = /filename="?([^"]+)"?/i.exec(header);
  return match?.[1] ?? null;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const nav = navigator as Navigator & {
    msSaveOrOpenBlob?: (b: Blob, name: string) => void;
  };

  if (nav.msSaveOrOpenBlob) {
    nav.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Delay revoke or Chrome may cancel the download
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export default function App(props: Props) {
  const apiBase = props.apiBase ?? "http://localhost:80/api";
  const token = props.accessToken ?? null;
  const listUrl = `${apiBase}/report/jobs/list`;
  const gqlUrl = `${apiBase}/resource/graphql`;

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<ReportJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const queryParams = useMemo(
    () => ({
      sortBy: "createdAt",
      direction: "ASC",
    }),
    [],
  );

  const load = async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...queryParams,
        page: String(nextPage),
        size: String(pageSize),
      });
      const url = `${listUrl}?${params.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Report list failed: ${res.status} ${res.statusText} - ${text}`,
        );
      }
      const data = (await res.json()) as PageResult<ReportJob>;
      setItems(data.content.reverse());
      setTotal(data.totalElements);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const download = async (job: ReportJob) => {
    setDownloadingId(job.id);
    setError(null);
    try {
      const url = `${apiBase}/report/jobs/${job.id}/pdf`;
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Download failed: ${res.status} ${res.statusText} - ${text}`,
        );
      }
      const blob = await res.blob();
      const filename =
        filenameFromDisposition(res.headers.get("content-disposition")) ??
        `report-${job.id}.pdf`;
      triggerDownload(blob, filename);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const createReport = async (payload: {
    deviceId: string;
    from: string | null;
    to: string | null;
  }) => {
    setCreating(true);
    setError(null);
    try {
      const url = `${apiBase}/process/jobs/report`;
      const body = {
        deviceId: payload.deviceId,
        ...(payload.from ? { from: payload.from } : {}),
        ...(payload.to ? { to: payload.to } : {}),
      };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Create report failed: ${res.status} ${res.statusText} - ${text}`,
        );
      }
      await load(0);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    load(0);
  }, [listUrl, token, pageSize]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Report Jobs</h2>
        <button
          className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => load(0)}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <ReportRequestForm
        loading={creating}
        gqlUrl={gqlUrl}
        token={token}
        onSubmit={createReport}
      />

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <ReportTable
          items={items}
          loading={loading}
          downloadingId={downloadingId}
          onDownload={download}
        />

        <div className="mt-3">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            loading={loading}
            onPrev={() => load(Math.max(0, page - 1))}
            onNext={() => load(page + 1)}
          />
        </div>
      </section>
    </div>
  );
}
