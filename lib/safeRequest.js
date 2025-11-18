// Helper to safely parse JSON from a Next.js Request
export async function parseJson(request) {
  // Read raw text first (safer than calling request.json() directly)
  const text = await request.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (err) {
    const error = new Error('Invalid JSON body')
    error.cause = err
    throw error
  }
}

export default parseJson
