import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'XAF', 'USD']
  },
  category: {
    type: String,
    required: true,
    enum: ['chaussures-homme', 'chaussures-femme', 'perruques', 'sacs-femme', 'tech-ai', 'consoles', 'hygiene']
  },
  image: {
    type: String,
    // kept for backward compatibility, prefer `images` array
  },
  images: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    default: 0,
  },
  // Optional vendor / contact details for the product
  vendorName: {
    type: String,
  },
  vendorPhone: {
    type: String,
  },
  vendorEmail: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)