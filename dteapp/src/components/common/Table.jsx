import { cn } from '../../utils/cn';

export const Table = ({ columns, data, actions, className }) => {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border bg-background", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-foreground">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-secondary">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
