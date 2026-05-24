import { randomBytes } from "crypto"

/**
 * Generate a unique ID (cuid-like)
 */
export function createId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = randomBytes(4).toString("hex")
  return `${timestamp}${randomPart}`
}
