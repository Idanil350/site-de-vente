import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

// NOTE: This project manages images manually in `public/images/`.
// On Vercel, writing to `public/` at runtime is not persistent. To avoid confusion
// and accidental uploads, uploads are disabled in production unless an external
// storage (Cloudinary) is configured. If you want uploads in production, set
// `CLOUDINARY_URL` in environment variables.

export async function POST(request) {
  try {
    // If deployed on Vercel (or NODE env production) and no Cloudinary configured,
    // refuse runtime uploads and instruct the admin to add images manually.
    const isVercel = !!process.env.VERCEL
    const hasCloudinary = !!process.env.CLOUDINARY_URL
    if (isVercel && !hasCloudinary) {
      return NextResponse.json({ success: false, error: 'Uploads disabled in production. Please add images manually to public/images and commit to the repository.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier' }, { status: 400 })
    }

    // Local development: write to public/images for convenience
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const filePath = path.join(process.cwd(), 'public', 'images', uniqueName)

    await writeFile(filePath, buffer)

    return NextResponse.json({ success: true, url: `/images/${uniqueName}` })
  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}