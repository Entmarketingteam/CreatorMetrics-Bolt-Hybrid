import { NormalizedRow } from "./columnMapper";

export type AutoFixResult = {
  fixedRows: NormalizedRow[];
  warnings: string[];
  confidence: number;
};

export function autoFixRows(rows: NormalizedRow[]): AutoFixResult {
  const warnings: string[] = [];
  let touched = 0;

  const fixed = rows.map((r) => {
    let row = { ...r };

    if (row.revenue < 0) {
      row.revenue = 0;
      touched++;
      warnings.push("Found negative revenue; clamped to 0.");
    }

    if (row.orders < 0) {
      row.orders = 0;
      touched++;
      warnings.push("Found negative orders; clamped to 0.");
    }

    if (row.dpv > 0 && row.clicks > 0 && row.dpv > row.clicks * 10) {
      const tmp = row.clicks;
      row.clicks = row.dpv;
      row.dpv = tmp;
      touched++;
      warnings.push(
        "Detected DPV much larger than clicks; swapped clicks and DPV for some rows."
      );
    }

    if (!row.creator) {
      const raw = row.raw || {};
      const name =
        raw["creator"] ??
        raw["influencer"] ??
        raw["publisher"] ??
        raw["handle"] ??
        raw["creator_name"] ??
        null;
      if (name) {
        row.creator = String(name);
        touched++;
        warnings.push("Inferred missing creator from raw data for some rows.");
      }
    }

    return row;
  });

  const confidence =
    rows.length === 0 ? 1 : Math.max(0, 1 - touched / (rows.length * 3));

  return {
    fixedRows: fixed,
    warnings: Array.from(new Set(warnings)),
    confidence,
  };
}
