/**
 * Safely parse JSON from an LLM response.
 *
 * Handles:
 * - Plain JSON
 * - JSON wrapped in code fences (```json ... ```)
 * - Trailing/leading whitespace
 *
 * Throws clean error if parsing fails.
 */
export function safeJsonParse<T>(text: string): T {
  if (!text || !text.trim()) {
    throw new Error('Empty response from AI. Expected JSON output.');
  }

  let cleaned = text.trim();

  // Remove markdown code fences if present
  // Handle ```json ... ``` or ``` ... ```
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeFenceMatch) {
    cleaned = codeFenceMatch[1].trim();
  }

  // Try to extract JSON object or array from the text
  // Find the first { or [ and the last } or ]
  const jsonStart = cleaned.search(/[\[{]/);
  const jsonEndBrace = cleaned.lastIndexOf('}');
  const jsonEndBracket = cleaned.lastIndexOf(']');
  const jsonEnd = Math.max(jsonEndBrace, jsonEndBracket);

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse AI response as JSON. ` +
      `Response started with: "${text.slice(0, 100)}..."`
    );
  }
}
