/** Flatten nested objects into dot-notation key/value pairs. */
export function extractFields(row: Record<string, unknown>): [string, string][] {
  const fields: [string, string][] = [];
  for (const [key, val] of Object.entries(row)) {
    if (val === null || val === undefined) {
      fields.push([key, ""]);
    } else if (Array.isArray(val)) {
      fields.push([key, JSON.stringify(val)]);
    } else if (typeof val === "object") {
      for (const [k2, v2] of extractFields(val as Record<string, unknown>)) {
        fields.push([`${key}.${k2}`, v2]);
      }
    } else {
      fields.push([key, String(val)]);
    }
  }
  return fields;
}

/** Format an array of rows as an aligned ASCII table. */
export function formatTable(results: Record<string, unknown>[], title?: string): string {
  if (results.length === 0) return title ? `${title}\n(no data)` : "(no data)";

  const allFields = results.map((r) => extractFields(r));
  const keys = [...new Set(allFields.flatMap((f) => f.map(([k]) => k)))];
  const widths = keys.map((k) =>
    Math.max(
      k.length,
      ...allFields.map((f) => {
        const pair = f.find(([fk]) => fk === k);
        return pair ? pair[1].length : 0;
      }),
    ),
  );

  const sep = widths.map((w) => "-".repeat(w + 2)).join("+");
  const header = keys.map((k, i) => ` ${k.padEnd(widths[i])} `).join("|");
  const rows = allFields.map((f) =>
    keys
      .map((k, i) => {
        const pair = f.find(([fk]) => fk === k);
        const val = pair ? pair[1] : "";
        return ` ${val.padEnd(widths[i])} `;
      })
      .join("|"),
  );

  const lines: string[] = [];
  if (title) lines.push(title, "");
  lines.push(header, sep, ...rows);
  return lines.join("\n");
}

/** Format as CSV with proper escaping. */
export function formatCsv(results: Record<string, unknown>[]): string {
  if (results.length === 0) return "";

  const allFields = results.map((r) => extractFields(r));
  const keys = [...new Set(allFields.flatMap((f) => f.map(([k]) => k)))];

  const escapeCsv = (s: string) =>
    s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;

  const lines = [keys.map(escapeCsv).join(",")];
  for (const f of allFields) {
    const row = keys.map((k) => {
      const pair = f.find(([fk]) => fk === k);
      return escapeCsv(pair ? pair[1] : "");
    });
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

/** Extract items and total from API response (handles both array and {items,total} formats). */
export function unwrapResponse(data: unknown): {
  items: Record<string, unknown>[];
  total?: number;
} {
  if (Array.isArray(data)) {
    return { items: data as Record<string, unknown>[] };
  }
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj?.items)) {
    return {
      items: obj.items as Record<string, unknown>[],
      total: typeof obj.total === "number" ? obj.total : undefined,
    };
  }
  return { items: [obj] };
}

/** Strip columns where every row has a zero/empty/null value. */
export function stripEmptyColumns(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  if (rows.length === 0) return rows;
  const allKeys = Object.keys(rows[0]);
  const nonEmpty = allKeys.filter((k) =>
    rows.some((r) => {
      const v = r[k];
      return v !== 0 && v !== "" && v !== null && v !== undefined;
    }),
  );
  return rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const k of nonEmpty) out[k] = r[k];
    return out;
  });
}

/** Build date range strings for today minus N days. */
export function dateRange(days: number): {
  date_from: string;
  date_to: string;
} {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    date_from: from.toISOString().slice(0, 10),
    date_to: to.toISOString().slice(0, 10),
  };
}
