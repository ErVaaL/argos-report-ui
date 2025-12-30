type Props = {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export const Pagination = ({
  page,
  pageSize,
  total,
  loading,
  onPrev,
  onNext,
}: Props) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Total: {total}
      </span>

      <div className="flex items-center gap-2">
        <span className="text-slate-500">
          page {page + 1} / {pages}
        </span>

        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 0 || loading}
          onClick={onPrev}
        >
          Prev
        </button>

        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= pages - 1 || loading}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};
