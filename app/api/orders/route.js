// app/api/orders/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import parseJson from '@/lib/safeRequest'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('winshop')
    const orders = await db.collection('orders').find({}).toArray()
    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await parseJson(request)
    if (!body) return NextResponse.json({ success: false, error: 'Corps de requête vide' }, { status: 400 })

    // Générer un numéro de commande unique
    const orderNumber = 'WIN' + Date.now().toString().slice(-6)
    const order = {
      ...body,
      orderNumber,
      status: 'pending',
      createdAt: new Date(),
    }

    const client = await clientPromise
    const db = client.db('winshop')
    const result = await db.collection('orders').insertOne(order)

    return NextResponse.json({ success: true, data: { orderNumber } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}