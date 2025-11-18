import { NextResponse } from 'next/server'
import parseJson from '@/lib/safeRequest'

// Read admin password from env for production. Do NOT use a hardcoded fallback.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_PASSWORD) {
  // Fail fast during server startup to avoid accidental unsecured deploys.
  // In serverless environments this will surface as an error when the file is imported.
  throw new Error('ADMIN_PASSWORD environment variable is required')
}

export async function POST(request) {
  try {
    const body = await parseJson(request)

    if (!body) return NextResponse.json({ success: false, error: 'Empty body' }, { status: 400 })

    const { password } = body

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
      })
      return response
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}