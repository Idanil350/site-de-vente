import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  },
  items: [
    {
      productId: String,
      name: String,
      description: String,
      price: Number,
      quantity: Number,
      image: String,
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'EUR',
  },
  paymentMethod: {
    type: String,
    enum: ['whatsapp', 'stripe'],
    default: 'whatsapp',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'paid', 'ordered', 'shipped', 'delivered'],
    default: 'pending',
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)