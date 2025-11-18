import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'
import parseJson from '@/lib/safeRequest'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET() {
  try {
    await dbConnect()
    const products = await Product.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}

export async function POST(request) {
  try {
    // Require admin cookie for product creation
    const authCheck = await requireAdmin()
    if (authCheck) return authCheck

    await dbConnect()
    const body = await parseJson(request)

    if (!body) return NextResponse.json({ success: false, error: 'Empty body' }, { status: 400 })

    const product = await Product.create(body)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}