import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary config is picked from CLOUDINARY_URL or individual env vars

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
    }

    // Convert file to base64 data URI so cloudinary.uploader.upload can accept it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mime = file.type || 'application/octet-stream'
    const dataUri = `data:${mime};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary; set folder for organization
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER || 'ma-boutique',
      resource_type: 'image'
    })

    // Return the secure URL from Cloudinary
    return NextResponse.json({ success: true, url: uploadResult.secure_url })

  } catch (error) {
    console.error('Erreur upload Cloudinary:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}