'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

useEffect(() => {
  const checkAuth = async () => {
    const res = await fetch('/api/admin/check-auth')
    const data = await res.json()
    if (!data.authenticated) {
      router.push('/admin/login')
    }
  }
  checkAuth()
}, [])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [currency, setCurrency] = useState('EUR')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'chaussures-homme',
    image: '',
    images: [],
    stock: '',
    currency: 'EUR'
  })

  // Helper to open form for editing
  const openEditForm = (product) => {
    setEditingProductId(product._id?.toString ? product._id.toString() : String(product._id))
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? product.price : '',
      category: product.category || 'chaussures-homme',
      image: product.image || '',
      images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      stock: product.stock != null ? product.stock : '',
      currency: product.currency || 'EUR',
      vendorName: product.vendorName || '',
      vendorPhone: product.vendorPhone || '',
      vendorEmail: product.vendorEmail || ''
    })
    setShowForm(true)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // don't require `formData.image` here: we support multiple images in `formData.images`

    setLoading(true)

    try {
      // Ensure at least one image is present (use images[0] or image fallback)
      const images = (formData.images && formData.images.filter(Boolean)) || []
      if (!images || images.length === 0) {
        alert('Veuillez uploader au moins une photo (Photo 1)')
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        images,
        // maintain single `image` for backward compatibility
        image: images[0] || formData.image || '',
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      }

      let res
      if (editingProductId) {
        // Update existing product
        res = await fetch(`/api/products/${encodeURIComponent(editingProductId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const data = await res.json()

      if (data.success) {
        alert(editingProductId ? '✅ Produit mis à jour !' : '✅ Produit ajouté avec succès !')
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'chaussures-homme',
          image: '',
          stock: '',
          currency: 'EUR'
        })
        setShowForm(false)
        setEditingProductId(null)
        fetchProducts()
      } else {
        alert('❌ Erreur: ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'ajout du produit')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const sid = id?.toString ? id.toString() : String(id)
      console.log('[admin] deleting product id=', sid)
      const res = await fetch(`/api/products/${encodeURIComponent(sid)}`, {
        method: 'DELETE',
      })
      // Try to parse JSON, but handle non-JSON responses gracefully
      let data = null
      try {
        data = await res.json()
      } catch (err) {
        console.warn('Réponse non JSON lors de la suppression:', err)
      }

      if (res.ok && (!data || data.success !== false)) {
        alert('✅ Produit supprimé !')
        fetchProducts()
        return
      }

      alert('❌ Erreur lors de la suppression' + (data?.error ? ': ' + data.error : ''))
    } catch (error) {
      alert('❌ Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currency={currency} setCurrency={setCurrency} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gestion des Produits</h1>
          <div className="flex space-x-4">
            <Link
              href="/admin/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Voir les commandes
            </Link>

            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                window.location.href = '/admin/login'
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Déconnexion
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter un produit</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Nouveau Produit</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[0,1,2].map((i) => (
                  <div key={i} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Photo {i+1} {i===0? '*': '(optionnel)'} </label>
                    <ImageUpload
                      currentImage={formData.images?.[i] || ''}
                      onImageUploaded={(url) => {
                        const imgs = [...(formData.images || [])]
                        imgs[i] = url
                        setFormData({...formData, images: imgs})
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="Ex: Nike Air Max"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  >
                    <option value="chaussures-homme">Chaussures Homme</option>
                    <option value="chaussures-femme">Chaussures Femme</option>
                    <option value="perruques">Perruques</option>
                    <option value="sacs-femme">Sacs de Marque</option>
                    <option value="tech-ai">Tech IA</option>
                    <option value="consoles">Consoles de Jeux</option>
                    <option value="hygiene">Hygiène</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (EUR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="99.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du vendeur</label>
                  <input
                    type="text"
                    value={formData.vendorName || ''}
                    onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="Ex: Fournisseur X"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone du vendeur</label>
                  <input
                    type="tel"
                    value={formData.vendorPhone || ''}
                    onChange={(e) => setFormData({...formData, vendorPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                    placeholder="Ex: +237 690 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email du vendeur</label>
                <input
                  type="email"
                  value={formData.vendorEmail || ''}
                  onChange={(e) => setFormData({...formData, vendorEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                  placeholder="contact@fournisseur.com"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Produits existants ({products.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                          src={(product.images && product.images[0]) || product.image}
                          alt={product.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' : 
                        product.stock > 0 ? 'bg-orange-100 text-orange-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} unités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button onClick={() => openEditForm(product)} className="text-blue-600 hover:text-blue-900">
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun produit pour le moment.</p>
                <p className="text-sm text-gray-400 mt-2">Cliquez sur "Ajouter un produit" pour commencer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}