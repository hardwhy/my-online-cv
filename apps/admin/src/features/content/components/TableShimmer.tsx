export function TableShimmer({
  showsThumbnail,
  columnCount,
}: {
  showsThumbnail: boolean;
  columnCount: number;
}) {
  const rows = Array.from({ length: 5 });
  const cols = Array.from({ length: columnCount });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
          <tr>
            {showsThumbnail && (
              <th className="px-4 py-3 font-semibold">Preview</th>
            )}
            {cols.map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </th>
            ))}
            <th className="px-4 py-3">
              <div className="h-3 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </th>
            <th className="px-4 py-3">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </th>
            <th className="px-4 py-3">
              <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((_, rowIdx) => (
            <tr key={rowIdx} className="align-top">
              {showsThumbnail && (
                <td className="px-4 py-3">
                  <div className="h-12 w-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                </td>
              )}
              {cols.map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div
                    className="h-3 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                    style={{ width: `${60 + ((rowIdx * 3 + colIdx * 7) % 40)}%` }}
                  />
                  {colIdx === 0 && (
                    <div
                      className="mt-2 h-3 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                      style={{ width: `${30 + ((rowIdx * 5) % 25)}%` }}
                    />
                  )}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              </td>
              <td className="px-4 py-3">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </td>
              <td className="px-4 py-3">
                <div className="h-6 w-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
