import { NextResponse } from "next/server";
import {
  getNextPendingJob,
  updateJob,
} from "@/lib/ingestQueue";
import { detectPlatformFromColumns } from "@/lib/schemaDetector";
import {
  inferColumnMapping,
  applyColumnMappingToRows,
  NormalizedRow,
} from "@/lib/columnMapper";
import { autoFixRows } from "@/lib/autoFix";
import { buildFunnelsFromRows, mergeNewFunnels } from "@/lib/funnelBuilder";
import { logUpload } from "@/lib/uploads";
import { parseCSV } from "@/lib/csvLoader";

async function loadRawRowsForFile(filePath: string) {
  try {
    return parseCSV(filePath);
  } catch (error) {
    console.error("CSV parse error for", filePath, error);
    return { columns: [], rows: [] };
  }
}

export const runtime = "nodejs";

export async function POST() {
  const job = getNextPendingJob();
  if (!job) {
    return NextResponse.json({ message: "No pending jobs." });
  }

  let currentJob = updateJob(job.id, {
    status: "running",
    step: "detecting_schema",
    progress: 5,
    errors: [],
  })!;

  try {
    const allNormalized: NormalizedRow[] = [];
    let creatorsDetected = 0;

    for (const file of currentJob.files) {
      const { columns, rows } = await loadRawRowsForFile(file);

      const detection = detectPlatformFromColumns(columns);

      currentJob = updateJob(job.id, {
        step: "mapping_columns",
        progress: 20,
      })!;

      const mapping = inferColumnMapping(columns);

      let normalized = applyColumnMappingToRows(
        rows,
        mapping,
        detection.platform
      );

      currentJob = updateJob(job.id, {
        step: "auto_fixing",
        progress: 40,
      })!;

      const fixResult = autoFixRows(normalized);
      normalized = fixResult.fixedRows;

      const mergedErrors = [
        ...(currentJob.errors ?? []),
        ...fixResult.warnings,
      ];

      currentJob = updateJob(job.id, {
        errors: Array.from(new Set(mergedErrors)),
      })!;

      allNormalized.push(...normalized);
    }

    currentJob = updateJob(job.id, {
      step: "normalizing",
      progress: 60,
    })!;

    const funnels = buildFunnelsFromRows(allNormalized);

    creatorsDetected = funnels.length;

    currentJob = updateJob(job.id, {
      step: "building_funnels",
      progress: 80,
      creatorsDetected,
    })!;

    mergeNewFunnels(funnels);

    currentJob = updateJob(job.id, {
      step: "logging_upload",
      progress: 90,
    })!;

    logUpload(currentJob.files, creatorsDetected, "processed");

    currentJob = updateJob(job.id, {
      status: "done",
      step: "complete",
      progress: 100,
    })!;

    return NextResponse.json({ job: currentJob });
  } catch (err: any) {
    console.error("[ingest/run] failed:", err);
    currentJob = updateJob(job.id, {
      status: "failed",
      step: "error",
      progress: 100,
      errors: [
        ...(currentJob.errors ?? []),
        String(err?.message ?? "Unknown error"),
      ],
    })!;
    return NextResponse.json({ job: currentJob }, { status: 500 });
  }
}
