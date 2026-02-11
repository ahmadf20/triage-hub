import "dotenv/config";
import { Worker } from "bullmq";
import { triageTicket } from "./ai";
import prisma from "./db";

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    };

console.log("Worker starting with Redis config:", connection);

const worker = new Worker(
  "ticket-triage",
  async (job) => {
    console.log(`Processing ticket ${job.data.ticketId}`);
    const { ticketId, content } = job.data;

    try {
      const aiResult = await triageTicket(content);

      console.log(`AI Result for ${ticketId}:`, aiResult);

      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: "PROCESSED",
          category: aiResult.category,
          sentiment: aiResult.sentiment,
          urgency: aiResult.urgency,
          aiDraft: aiResult.draft,
        },
      });

      console.log(`Ticket ${ticketId} processed successfully.`);
    } catch (error) {
      console.error(`Error processing ticket ${ticketId}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed with ${err.message}`);
  if (job?.data?.ticketId) {
    try {
      await prisma.ticket.update({
        where: { id: job.data.ticketId },
        data: { status: "FAILED" },
      });
      console.log(`Marked ticket ${job.data.ticketId} as FAILED.`);
    } catch (dbError) {
      console.error(`Failed to update ticket status to FAILED:`, dbError);
    }
  }
});
