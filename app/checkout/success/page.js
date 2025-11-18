'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { CheckCircle, Loader } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'

// Composant séparé pour useSearchParams
function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [currency, setCurrency] = useState('XAF')
  const [loading, setLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')
  const clearCart = useCartStore((state) => state.clearCart)

  const verifyPayment = async () => {
    try {
      if (!sessionId) {
        setError('Session ID manquant')
        setLoading(false)
        return
      }

      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await res.json()

      if (data.success) {
        setOrderNumber(data.orderNumber)
        clearCart()
      } else {
        setError(data.error || 'Erreur lors de la vérification du paiement')
      }
    } catch (error) {
      setError('Erreur de connexion')
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    verifyPayment()
  }, [sessionId]) // ✅ verifyPayment maintenant stable

  const whatsappNumber = '237690000000'
  const whatsappMessage = `Bonjour, j'ai payé ma commande ${orderNumber} sur WINSHOP via Stripe`
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currency={currency} setCurrency={setCurrency} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Erreur</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Retour à la boutique
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currency={currency} setCurrency={setCurrency} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Loader className="h-20 w-20 text-gray-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vérification du paiement...</h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currency={currency} setCurrency={setCurrency} />
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi ! 🎉
          </h1>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Votre numéro de commande:</p>
            <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-900 mb-3">Prochaines étapes:</h3>
            <ol className="space-y-2 text-gray-700">
              <li>✅ Votre paiement a été reçu</li>
              <li>📦 Nous commandons vos produits en Chine</li>
              <li>✈️ Livraison estimée: 2-4 semaines</li>
              <li>💰 Vous payez la douane à l'arrivée</li>
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

// Page principale avec Suspense
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-20 w-20 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}