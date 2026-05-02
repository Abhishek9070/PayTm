import ApiError from "./apiErros.js";
import { SecurityEvent } from "../models/securityEvent.model.js";

const rateLimitState = new Map();

export const DUPLICATE_WINDOW_MS = Number(process.env.FRAUD_DUPLICATE_WINDOW_MS || 2 * 60 * 1000);
export const WITHDRAWAL_COOLDOWN_MS = Number(process.env.WITHDRAWAL_COOLDOWN_MS || 15 * 60 * 1000);
export const PAYMENT_ORDER_COOLDOWN_MS = Number(process.env.PAYMENT_ORDER_COOLDOWN_MS || 10 * 60 * 1000);
export const HIGH_VALUE_TRANSACTION_THRESHOLD = Number(process.env.FRAUD_HIGH_VALUE_THRESHOLD || 50000);

const consumeBucket = ({ key, limit, windowMs }) => {
  const now = Date.now();
  const bucket = rateLimitState.get(key) || [];
  const activeBucket = bucket.filter((timestamp) => now - timestamp < windowMs);

  activeBucket.push(now);
  rateLimitState.set(key, activeBucket);

  return {
    limited: activeBucket.length > limit,
    remaining: Math.max(limit - activeBucket.length, 0),
    resetAt: new Date(activeBucket[0] + windowMs)
  };
};

export const recordSecurityEvent = async ({
  userId = null,
  actionType,
  reason,
  severity = "medium",
  blocked = true,
  route = null,
  ipAddress = null,
  metadata = null
}) => {
  return SecurityEvent.create({
    userId,
    actionType,
    reason,
    severity,
    blocked,
    route,
    ipAddress,
    metadata
  });
};

export const consumeActionRateLimit = async ({
  userId,
  action,
  limit,
  windowMs,
  reason,
  severity = "medium",
  route = null,
  ipAddress = null,
  metadata = null
}) => {
  const { limited, remaining, resetAt } = consumeBucket({
    key: `${action}:${userId}`,
    limit,
    windowMs
  });

  if (limited) {
    await recordSecurityEvent({
      userId,
      actionType: "rate_limit",
      reason: reason || `Too many ${action} attempts`,
      severity,
      blocked: true,
      route,
      ipAddress,
      metadata
    });

    throw new ApiError(429, reason || `Too many ${action} attempts. Please try again later.`);
  }

  return {
    remaining,
    resetAt
  };
};