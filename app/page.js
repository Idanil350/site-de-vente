'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { Zap, Shield, Globe, Package, Shirt, Sparkles, Gamepad2, Droplets } from 'lucide-react'
import Link from 'next/link'

const exchangeRates = {
  EUR: 1,
  XAF: 655.957,
  USD: 1.08
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => {
    const locale = navigator.language
    if (locale.includes('CM') || locale.includes('fr-CM')) {
      setCurrency('XAF')
    } else if (locale.includes('US')) {
      setCurrency('USD')
    }

    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Impossible de charger les produits')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    const priceInEUR = price / exchangeRates['EUR']
    const converted = priceInEUR * exchangeRates[currency]
    const symbols = { EUR: '€', XAF: 'FCFA', USD: '$' }
    
    if (currency === 'XAF') {
      return `${Math.round(converted)} ${symbols[currency]}`
    }
    return `${converted.toFixed(2)} ${symbols[currency]}`
  }

  const categoryGroups = [
    { 
      id: 'chaussures', 
      name: 'Chaussures', 
      icon: Package, 
      desc: 'Homme & Femme',
      categories: ['chaussures-homme', 'chaussures-femme']
    },
    { 
      id: 'perruques', 
      name: 'Perruques', 
      icon: Sparkles, 
      desc: 'Beauté naturelle',
      categories: ['perruques']
    },
    { 
      id: 'sacs', 
      name: 'Sacs de Marque', 
      icon: Package, 
      desc: 'Luxe et style',
      categories: ['sacs-femme']
    },
    { 
      id: 'tech-ai', 
      name: 'Tech IA', 
      icon: Sparkles, 
      desc: 'Innovation technologique',
      categories: ['tech-ai']
    },
    { 
      id: 'consoles', 
      name: 'Consoles de Jeux', 
      icon: Gamepad2, 
      desc: 'Divertissement ultime',
      categories: ['consoles']
    },
    { 
      id: 'hygiene', 
      name: 'Hygiène', 
      icon: Droplets, 
      desc: 'Produits essentiels',
      categories: ['hygiene']
    },
  ]

  const productsExist = products.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currency={currency} setCurrency={setCurrency} />
      
      <section className="relative bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Bienvenue chez WINSHOP
          </h1>
          <p className="text-2xl md:text-3xl mb-4 text-gray-300">
            Votre destination Shopping & Tech
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Mode, Technologies IA, Consoles, Hygiène et bien plus encore
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Explorer nos catégories
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Pourquoi choisir WINSHOP ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4">
                <Zap className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Livraison Rapide</h3>
              <p className="text-gray-600">Recevez vos commandes en 24-48h partout au Cameroun</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Paiement Sécurisé</h3>
              <p className="text-gray-600">Transactions 100% sécurisées avec les meilleurs standards</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-4">
                <Globe className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Multi-devises</h3>
              <p className="text-gray-600">Payez en EUR, XAF ou USD selon votre préférence</p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Nos Catégories</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Découvrez notre large gamme de produits</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryGroups.map((group) => {
              const Icon = group.icon
              const groupProducts = products.filter(p => group.categories.includes(p.category))
              const count = groupProducts.length
              
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    const section = document.getElementById(group.id)
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{group.desc}</p>
                  {count > 0 && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                      {count} produit{count > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {productsExist ? (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Nos Produits</h2>
            
            {categoryGroups.map(group => {
              const groupProducts = products.filter(p => group.categories.includes(p.category))
              if (groupProducts.length === 0) return null
              
              return (
                <div key={group.id} id={group.id} className="mb-16">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">{group.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {groupProducts.map((product) => (
                      <ProductCard key={product._id} product={product} formatPrice={formatPrice} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 shadow-lg">
              <Sparkles className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bientôt disponible ! 🚀
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Nous préparons une sélection exceptionnelle de produits pour vous.
              </p>
              <p className="text-gray-600 mb-8">
                Notre boutique ouvrira très prochainement avec des produits de qualité dans toutes nos catégories.
              </p>
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/admin" 
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition inline-block"
                >
                  Accès Administrateur
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Rejoignez des milliers de clients satisfaits</h2>
          <p className="text-xl text-gray-300 mb-8">
            Profitez de nos offres exceptionnelles et de notre service client de qualité
          </p>
          <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-white text-gray-900 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
            Commencer mes achats
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">WINSHOP</h3>
              <p className="text-gray-400">Votre destination shopping de confiance</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Catégories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Chaussures</li>
                <li>Perruques</li>
                <li>Sacs</li>
                <li>Tech IA</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Contact</li>
                <li>FAQ</li>
                <li>Livraison</li>
                <li>Retours</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Devises acceptées</h4>
              <p className="text-gray-400">EUR • XAF • USD</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 WINSHOP. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}