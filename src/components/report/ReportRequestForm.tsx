import { useEffect, useMemo, useState } from "react";
import type { Device, PageResult } from "../../types";
import { DEVICES_QUERY } from "../../lib/queries";
import { gql } from "../../lib/gql";

type Payload = {
  deviceId: string;
  from: string | null;
  to: string | null;
};

type Props = {
  loading: boolean;
  gqlUrl: string;
  token: string | null;
  onSubmit: (payload: Payload) => void;
};

const toIsoStart = (value: string) => `${value}T00:00:00Z`;
const toIsoEnd = (value: string) => `${value}T23:59:59Z`;

const normalize = (value: string) => value.trim().toLowerCase();

type DevicesResponse = {
  devices: PageResult<Device>;
};

export default function ReportRequestForm({
  loading,
  gqlUrl,
  token,
  onSubmit,
}: Props) {
  const [deviceQuery, setDeviceQuery] = useState("");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const canSubmit = useMemo(() => {
    return deviceQuery.trim().length > 0 && !loading;
  }, [deviceQuery, loading]);

  const filtered = useMemo(() => {
    const query = normalize(deviceQuery);
    if (!query) return devices.slice(0, 8);
    return devices
      .filter((device) => {
        const nameMatch = normalize(device.name).includes(query);
        const idMatch = normalize(device.id).includes(query);
        return nameMatch || idMatch;
      })
      .slice(0, 8);
  }, [deviceQuery, devices]);

  useEffect(() => {
    if (!open || devices.length > 0 || devicesLoading) return;
    const load = async () => {
      setDevicesLoading(true);
      setDevicesError(null);
      try {
        const data = await gql<DevicesResponse>(
          gqlUrl,
          DEVICES_QUERY,
          {
            page: {
              page: 0,
              size: 200,
              sortBy: "name",
              sortDirection: "ASC",
            },
          },
          token,
        );
        setDevices(data.devices.content);
      } catch (err: any) {
        setDevicesError(err.message ?? String(err));
      } finally {
        setDevicesLoading(false);
      }
    };
    void load();
  }, [open, gqlUrl, token, devices.length, devicesLoading]);

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Create report</h3>
        <p className="text-sm text-slate-500">
          Provide a device ID and optional date range.
        </p>
      </div>

      <form
        className="grid grid-cols-1 gap-3 md:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
        onSubmit({
            deviceId: (deviceId ?? deviceQuery).trim(),
            from: from ? toIsoStart(from) : null,
            to: to ? toIsoEnd(to) : null,
          });
        }}
      >
        <div className="relative md:col-span-2">
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="Device name or ID"
            value={deviceQuery}
            onChange={(e) => {
              setDeviceQuery(e.target.value);
              setDeviceId(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 120);
            }}
          />
          <div
            className={[
              "absolute left-0 right-0 top-11 z-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-all duration-200",
              open ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="max-h-64 overflow-auto">
              {devicesLoading && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  Loading devices…
                </div>
              )}
              {devicesError && !devicesLoading && (
                <div className="px-3 py-2 text-xs text-red-600">
                  {devicesError}
                </div>
              )}
              {!devicesLoading && !devicesError && filtered.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  No matches
                </div>
              )}
              {!devicesLoading &&
                !devicesError &&
                filtered.map((device) => (
                  <button
                    type="button"
                    key={device.id}
                    className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50"
                    onMouseDown={() => {
                      setDeviceQuery(device.name || device.id);
                      setDeviceId(device.id);
                      setOpen(false);
                    }}
                  >
                    <span className="font-semibold text-slate-900">
                      {device.name || device.id}
                    </span>
                    <span className="text-xs text-slate-500">{device.id}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
        <input
          type="date"
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="hidden md:block md:col-span-1" />
        <button
          type="submit"
          className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
        >
          {loading ? "Submitting…" : "Create report"}
        </button>
      </form>

      {deviceId && (
        <div className="text-xs text-slate-500">Selected: {deviceId}</div>
      )}
    </section>
  );
}
