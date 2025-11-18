// app/api/orders/[id]/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import parseJson from '@/lib/safeRequest'

export async function PATCH(request, context) {
  try {
    const params = await context.params
    const { id } = params
    const body = await parseJson(request)

    if (!body) return NextResponse.json({ success: false, error: 'Empty body' }, { status: 400 })

    const { status } = body

    const client = await clientPromise
    const db = client.db('winshop')

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
    }

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params
    const { id } = params

    const client = await clientPromise
    const db = client.db('winshop')

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
    }

    const result = await db.collection('orders').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}