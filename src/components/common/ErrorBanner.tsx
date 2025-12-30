type Props = {
  message: string;
};

export const ErrorBanner = ({ message }: Props) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
      <div className="font-semibold">Request failed</div>
      <div className="mt-1 text-red-700">{message}</div>
    </div>
  );
};
