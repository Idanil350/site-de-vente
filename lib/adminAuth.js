import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('admin-auth')
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    return null
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}
