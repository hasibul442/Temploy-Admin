/**
 * Mock moderation data (reports, disputes).
 * Deterministic (index-based) so server and client renders match.
 */
import { PEOPLE, CLIENTS, daysAgo } from "./marketplace";

const pick = (arr, i) => arr[i % arr.length];

// ---------------------------------------------------------------- Reports
export const REPORT_TYPES = ["Gig", "User", "Message", "Review", "Job"];
export const REPORT_REASONS = ["Spam", "Scam / fraud", "Inappropriate content", "Copyright", "Off-platform payment", "Harassment"];
const REPORT_STATUSES = ["Open", "Under review", "Open", "Resolved", "Dismissed", "Open", "Resolved"];
const TARGETS = {
  Gig: ["I will build a responsive Next.js website", "I will design a modern minimalist logo", "I will run your Google Ads campaign"],
  User: PEOPLE,
  Message: ["Chat in ORD-10471", "Chat in ORD-10466", "Chat in ORD-10452"],
  Review: ["Review on GIG-5104", "Review on GIG-5117", "Review on GIG-5122"],
  Job: ["Data entry from scanned invoices", "Shopify store setup and theme tweaks", "Quarterly tax filing support"],
};
const NOTES = [
  "Reporter attached screenshots showing a request to pay outside Temploy.",
  "Multiple similar reports in the last 7 days.",
  "Content appears copied from a competitor's listing.",
  "User claims the message contained abusive language.",
  "Listing uses keyword stuffing in the title and tags.",
];

export const reports = Array.from({ length: 30 }, (_, i) => {
  const type = pick(REPORT_TYPES, i);
  return {
    id: `RPT-${640 - i}`,
    type,
    target: pick(TARGETS[type], i * 3),
    reason: pick(REPORT_REASONS, i * 5),
    reporter: pick(i % 2 ? PEOPLE : CLIENTS, i * 7),
    date: daysAgo(i),
    status: pick(REPORT_STATUSES, i * 3),
    notes: pick(NOTES, i),
  };
});

// ---------------------------------------------------------------- Disputes
export const DISPUTE_REASONS = ["Late delivery", "Not as described", "No response", "Quality issue", "Refund request"];
export const PRIORITIES = ["High", "Medium", "Low"];
const DISPUTE_STATUSES = ["Open", "Under review", "Escalated", "Open", "Resolved", "Refunded", "Under review"];

export const disputes = Array.from({ length: 20 }, (_, i) => {
  const client = pick(CLIENTS, i * 3);
  const freelancer = pick(PEOPLE, i * 5);
  const reason = pick(DISPUTE_REASONS, i);
  const opened = daysAgo(i * 2 + 1);
  const status = pick(DISPUTE_STATUSES, i);
  const timeline = [
    { date: opened, actor: client, text: `Opened a dispute: ${reason.toLowerCase()}.` },
    { date: daysAgo(i * 2), actor: freelancer, text: "Responded with delivery files and a revision offer." },
  ];
  if (status !== "Open") timeline.push({ date: daysAgo(Math.max(i * 2 - 1, 0)), actor: "Support team", text: "Started reviewing the order conversation." });
  if (status === "Escalated") timeline.push({ date: daysAgo(Math.max(i * 2 - 1, 0)), actor: "Support team", text: "Escalated to a senior moderator." });
  if (status === "Resolved") timeline.push({ date: daysAgo(Math.max(i * 2 - 1, 0)), actor: "Support team", text: "Released payment to the freelancer." });
  if (status === "Refunded") timeline.push({ date: daysAgo(Math.max(i * 2 - 1, 0)), actor: "Support team", text: "Refunded the client in full." });
  return {
    id: `DSP-${215 - i}`,
    order: `ORD-${10479 - i * 2}`,
    client,
    freelancer,
    amount: 80 + ((i * 271) % 1600),
    reason,
    priority: pick(PRIORITIES, i * 2),
    opened,
    status,
    timeline,
  };
});
