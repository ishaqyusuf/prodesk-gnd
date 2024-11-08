"use server";

export type ErrorTags = "pdf" | "chromium-aws";
export type ErrorStatus = "severe" | "moderate" | "other";
export async function logError(error, status: ErrorStatus, tags: ErrorTags[]) {}
