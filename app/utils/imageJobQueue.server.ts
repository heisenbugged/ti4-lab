import { draftByPrettyUrl } from "~/drizzle/draft.server";
import { Draft } from "~/types";
import { generateDraftImageBuffer } from "~/skiaRendering/imageGenerator.server";
import {
  generateDraftSlicesImage,
  generatePresetDraftImage,
} from "~/skiaRendering/slicesImageGenerator.server";
import { syncImageToR2 } from "~/utils/syncImageToR2.server";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";

type ImageJob = {
  id: string;
  draftId: string;
  urlName: string;
  isComplete: boolean;
  attempts: number;
  createdAt: number;
};

const queue: ImageJob[] = [];
let processing = false;
let activeJobs = 0;

const CONCURRENCY = 1;
const MAX_RETRIES = 3;

export function enqueueImageJob(draftId: string, urlName: string, isComplete: boolean) {
  const job: ImageJob = {
    id: `${draftId}-${isComplete ? "complete" : "incomplete"}-${Date.now()}`,
    draftId,
    urlName,
    isComplete,
    attempts: 0,
    createdAt: Date.now(),
  };

  queue.push(job);
  console.log(`[ImageQueue] Enqueued job ${job.id} (queue size: ${queue.length})`);

  processQueue();
}

async function processQueue() {
  if (processing) return;

  processing = true;

  while (queue.length > 0 && activeJobs < CONCURRENCY) {
    const job = queue.shift();
    if (!job) break;

    activeJobs++;
    processJob(job).finally(() => {
      activeJobs--;
      if (queue.length > 0) {
        setImmediate(() => processQueue());
      }
    });
  }

  processing = false;
}

async function processJob(job: ImageJob) {
  console.log(`[ImageQueue] Processing job ${job.id} (attempt ${job.attempts + 1})`);

  try {
    // Load draft from database
    const result = await draftByPrettyUrl(job.urlName);
    if (!result) {
      console.log(`[ImageQueue] Draft not found for job ${job.id}, skipping`);
      return;
    }

    const draft = JSON.parse(result.data as string) as Draft;

    // Generate appropriate image
    const imageBuffer = job.isComplete
      ? await generateDraftImageBuffer(draft, job.urlName)
      : draft.settings.draftGameMode === "presetMap"
        ? await generatePresetDraftImage(draft, job.urlName)
        : await generateDraftSlicesImage(draft, job.urlName);

    // Upload to R2
    const status = job.isComplete ? "complete" : "incomplete";
    const cdnUrl = await syncImageToR2(job.urlName, imageBuffer, status);

    // Update database
    const updateData = job.isComplete
      ? { imageUrl: cdnUrl }
      : { incompleteImageUrl: cdnUrl };

    await db
      .update(drafts)
      .set(updateData)
      .where(eq(drafts.urlName, job.urlName))
      .run();

    console.log(`[ImageQueue] Successfully processed job ${job.id} -> ${cdnUrl}`);
  } catch (error) {
    job.attempts++;
    console.error(`[ImageQueue] Error processing job ${job.id}:`, error);

    if (job.attempts < MAX_RETRIES) {
      console.log(`[ImageQueue] Retrying job ${job.id} (attempt ${job.attempts + 1}/${MAX_RETRIES})`);
      queue.push(job);
    } else {
      console.error(`[ImageQueue] Max retries reached for job ${job.id}, giving up`);
    }
  }
}
