import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'
import parseJson from '@/lib/safeRequest'
import { requireAdmin } from '@/lib/adminAuth'

export async function DELETE(request, { params }) {
  try {
    // Require admin cookie for deletions
    const authCheck = await requireAdmin()
    if (authCheck) return authCheck

    await dbConnect()
    let { id } = params || {}

    // Fallback: try to extract id from the request URL if params is undefined
    if (!id) {
      try {
        const url = new URL(request.url)
        const parts = url.pathname.split('/').filter(Boolean)
        // expected path: /api/products/:id
        id = parts[parts.length - 1]
      } catch (err) {
        console.warn('[DELETE /api/products/:id] could not parse request.url', err)
      }
    }

    console.log('[DELETE /api/products/:id] requested id=', id, ' rawUrl=', request.url)

    // Validate id presence
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ success: false, error: 'Identifiant manquant', requestedId: id }, { status: 400 })
    }

    // Try to find the product first for clearer diagnostics
    const existing = await Product.findById(id)
    if (!existing) {
      console.warn('[DELETE /api/products/:id] product not found for id=', id)
      return NextResponse.json({ success: false, error: 'Produit non trouvé', requestedId: id }, { status: 404 })
    }

    const deletedProduct = await Product.findByIdAndDelete(id)
    if (!deletedProduct) {
      console.error('[DELETE /api/products/:id] failed to delete id=', id)
      return NextResponse.json({ success: false, error: 'Échec suppression' }, { status: 500 })
    }

    console.log('[DELETE /api/products/:id] deleted id=', id)
    return NextResponse.json({ success: true, data: { id: deletedProduct._id } })
  } catch (error) {
    console.error('[DELETE /api/products/:id] error=', error)
    // Handle invalid ObjectId cast errors
    if (error.name === 'CastError' || /Cast to ObjectId/.test(error.message)) {
      return NextResponse.json({ success: false, error: 'Identifiant invalide' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
 }
}

export async function PATCH(request, { params }) {
  try {
    // Require admin cookie for updates
    const authCheck = await requireAdmin()
    if (authCheck) return authCheck

    await dbConnect()
    let { id } = params || {}

    // Fallback to parse from url
    if (!id) {
      try {
        const url = new URL(request.url)
        const parts = url.pathname.split('/').filter(Boolean)
        id = parts[parts.length - 1]
      } catch {}
    }

    if (!id) return NextResponse.json({ success: false, error: 'Identifiant manquant' }, { status: 400 })

    const body = await parseJson(request)
    if (!body) return NextResponse.json({ success: false, error: 'Empty body' }, { status: 400 })

    // Only allow specific updatable fields (include `images` array)
    const updatable = (({ name, description, price, category, image, images, stock, currency, vendorName, vendorPhone, vendorEmail }) =>
      ({ name, description, price, category, image, images, stock, currency, vendorName, vendorPhone, vendorEmail }))(body)

    const updated = await Product.findByIdAndUpdate(id, updatable, { new: true })
    if (!updated) return NextResponse.json({ success: false, error: 'Produit non trouvé' }, { status: 404 })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PATCH /api/products/:id] error=', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}