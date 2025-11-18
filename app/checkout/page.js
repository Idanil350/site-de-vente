'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useCartStore } from '@/lib/cartStore'
import Image from 'next/image'
import { Package, CheckCircle } from 'lucide-react'

const exchangeRates = {
  EUR: 1,
  XAF: 655.957,
  USD: 1.08
}

const cities = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Maroua',
  'Bamenda',
  'Ngaoundéré',
  'Bertoua',
  'Limbé',
  'Kribi',
  'Autre'
]

export default function CheckoutPage() {
  const router = useRouter()
  const [currency, setCurrency] = useState('XAF')
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const clearCart = useCartStore((state) => state.clearCart)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Douala',
  })

  const formatPrice = (price) => {
    const priceInEUR = price / exchangeRates['EUR']
    const converted = priceInEUR * exchangeRates[currency]
    const symbols = { EUR: '€', XAF: 'FCFA', USD: '$' }
    
    if (currency === 'XAF') {
      return `${Math.round(converted)} ${symbols[currency]}`
    }
    return `${converted.toFixed(2)} ${symbols[currency]}`
  }

  const total = getTotalPrice()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
        },
        items: items.map(item => ({
          productId: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: total,
        currency: 'EUR',
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()

      if (data.success) {
        setOrderNumber(data.data.orderNumber)
        setOrderSuccess(true)
        clearCart()
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      alert('Erreur lors de la commande')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const whatsappNumber = '+237672628383'
  const whatsappMessage = orderNumber 
    ? `Bonjour, je viens de passer la commande ${orderNumber} sur WINSHOP`
    : 'Bonjour, je souhaite commander sur WINSHOP'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currency={currency} setCurrency={setCurrency} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currency={currency} setCurrency={setCurrency} />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Commande enregistrée !
            </h1>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Votre numéro de commande:</p>
              <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold text-gray-900 mb-3">Prochaines étapes:</h3>
              <ol className="space-y-2 text-gray-700">
                <li>1. Contactez-nous sur WhatsApp</li>
                <li>2. Nous vous donnerons le prix total</li>
                <li>3. Payez via Mobile Money/Orange Money</li>
                <li>4. Nous commandons vos produits en Chine</li>
                <li>5. Vous payez la douane quand le colis arrive</li>
              </ol>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg mb-4"
            >
              Contacter sur WhatsApp
            </a>

            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Retour à la boutique
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currency={currency} setCurrency={setCurrency} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="Ex: +237 690 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Après votre commande, contactez-nous sur WhatsApp pour finaliser votre paiement .
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 transition font-semibold text-lg disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer ma commande'}
                </button>
              </form>
            </div>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex space-x-4">
                    <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="text-gray-900 font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="text-sm text-gray-500">À confirmer</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total estimé</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">
                  Le prix final sera confirmé sur WhatsApp. Vous payerez la douane séparément à l'arrivée du colis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}