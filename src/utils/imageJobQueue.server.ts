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
  urlName: string;
  isComplete: boolean;
  attempts: number;
};

const queue: ImageJob[] = [];
let activeJobs = 0;

const CONCURRENCY = 1;
const MAX_RETRIES = 3;

export function enqueueImageJob(
  draftId: string,
  urlName: string,
  isComplete: boolean,
) {
  const job: ImageJob = {
    id: `${draftId}-${isComplete ? "complete" : "incomplete"}-${Date.now()}`,
    urlName,
    isComplete,
    attempts: 0,
  };

  queue.push(job);
  console.log(
    `[ImageQueue] Enqueued job ${job.id} (queue size: ${queue.length})`,
  );

  processQueue();
}

function processQueue() {
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
}

async function processJob(job: ImageJob) {
  console.log(
    `[ImageQueue] Processing job ${job.id} (attempt ${job.attempts + 1})`,
  );

  try {
    const result = await draftByPrettyUrl(job.urlName);
    if (!result) {
      console.log(`[ImageQueue] Draft not found for job ${job.id}, skipping`);
      return;
    }

    const draft = JSON.parse(result.data as string) as Draft;

    const imageBuffer = job.isComplete
      ? await generateDraftImageBuffer(draft, job.urlName)
      : draft.settings.draftGameMode === "presetMap"
        ? await generatePresetDraftImage(draft, job.urlName)
        : await generateDraftSlicesImage(draft, job.urlName);

    const status = job.isComplete ? "complete" : "incomplete";
    const cdnUrl = await syncImageToR2(job.urlName, imageBuffer, status);

    const updateData = job.isComplete
      ? { imageUrl: cdnUrl }
      : { incompleteImageUrl: cdnUrl };

    await db
      .update(drafts)
      .set(updateData)
      .where(eq(drafts.urlName, job.urlName))
      .run();

    console.log(
      `[ImageQueue] Successfully processed job ${job.id} -> ${cdnUrl}`,
    );
  } catch (error) {
    job.attempts++;
    console.error(`[ImageQueue] Error processing job ${job.id}:`, error);

    if (job.attempts < MAX_RETRIES) {
      console.log(
        `[ImageQueue] Retrying job ${job.id} (attempt ${job.attempts + 1}/${MAX_RETRIES})`,
      );
      queue.push(job);
    } else {
      console.error(
        `[ImageQueue] Max retries reached for job ${job.id}, giving up`,
      );
    }
  }
}
