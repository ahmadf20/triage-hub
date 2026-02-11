import "dotenv/config";
import express from "express";
import cors from "cors";
import { Queue } from "bullmq";
import { z } from "zod";
import prisma from "./db";

const createTicketSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters long"),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

const updateTicketSchema = z.object({
  status: z.enum(["PENDING", "PROCESSED", "RESOLVED", "FAILED"]).optional(),
  aiDraft: z.string().optional(),
});

const app = express();
app.use(cors());
app.use(express.json());

// Redis connection config
const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL } // Use URL if provided
  : {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    };

const ticketQueue = new Queue("ticket-triage", { connection });

app.post("/tickets", async (req, res) => {
  try {
    const validatedData = createTicketSchema.parse(req.body);
    const { content, customerEmail } = validatedData;

    const ticket = await prisma.ticket.create({
      data: {
        content,
        customerEmail,
        status: "PENDING",
      },
    });

    console.log(`Ticket created: ${ticket.id}`);

    await ticketQueue.add("process-ticket", {
      ticketId: ticket.id,
      content,
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/tickets", async (req, res) => {
  const {
    status,
    urgency,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (urgency && urgency !== "ALL") where.urgency = urgency;

  const allowedSortFields = ["createdAt", "urgency", "sentiment", "status"];
  const sortField = allowedSortFields.includes(sortBy as string)
    ? (sortBy as string)
    : "createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  try {
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { [sortField]: order },
        skip,
        take: limitNum,
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      tickets,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/tickets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/tickets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const validatedData = updateTicketSchema.parse(req.body);

    const ticket = await prisma.ticket.update({
      where: { id },
      data: validatedData,
    });
    res.json(ticket);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
