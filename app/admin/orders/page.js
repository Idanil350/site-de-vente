'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { 
  Search, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  Phone,
  Eye,
  Trash2,
  X,
  Users
} from 'lucide-react'

const STATUS_CONFIG = {
  'en attente': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  contacted: { label: 'Contacté', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-800 border border-green-300' },
  ordered: { label: 'Commandé', color: 'bg-purple-100 text-purple-800 border border-purple-300' },
  shipped: { label: 'Expédié', color: 'bg-indigo-100 text-indigo-800 border border-indigo-300' },
  delivered: { label: 'Livré', color: 'bg-gray-100 text-gray-800 border border-gray-300' }
}

const EXCHANGE_RATES = {
  EUR: 1,
  XAF: 655.957,
  USD: 1.10
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('XAF')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrder, setUpdatingOrder] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    topCity: '',
    topProducts: []
  })

  useEffect(() => { fetchOrders() }, [])
  useEffect(() => { applyFilters() }, [orders, searchTerm, statusFilter, cityFilter])
  useEffect(() => { if (orders.length > 0) calculateStats(orders) }, [currency, orders])

  const toDisplayCurrency = (amountEUR) => {
    if (amountEUR === null || amountEUR === undefined) return 0
    switch (currency) {
      case 'XAF': return amountEUR * EXCHANGE_RATES.XAF
      case 'USD': return amountEUR * EXCHANGE_RATES.USD
      default: return amountEUR
    }
  }

  const formatPrice = (amountEUR) => {
    const symbols = { EUR: '€', XAF: 'FCFA', USD: '$' }
    if (amountEUR === null || amountEUR === undefined) return `0 ${symbols[currency]}`
    const value = toDisplayCurrency(amountEUR)
    return currency === 'XAF'
      ? `${Math.round(value).toLocaleString('fr-FR')} ${symbols[currency]}`
      : `${value.toFixed(2)} ${symbols[currency]}`
  }

  const getStatusConfig = (status) => STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800 border border-gray-300' }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        const cleanedOrders = data.data.map(order => ({
          ...order,
          totalAmount: order.totalAmount > 1 ? order.totalAmount : 
            order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
        }))
        setOrders(cleanedOrders)
      }
    } catch (error) {
      alert('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData) => {
    const totalRevenueEUR = ordersData.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = ordersData.length
    const pendingOrders = ordersData.filter(o => o.status === 'pending' || o.status === 'en attente').length
    const averageOrderValueEUR = totalOrders > 0 ? totalRevenueEUR / totalOrders : 0

    // Store stats in EUR (raw). Formatting/conversion is handled by `formatPrice` when rendering.
    const totalRevenue = totalRevenueEUR
    const averageOrderValue = averageOrderValueEUR

    const cityCounts = {}
    ordersData.forEach(o => {
      const city = o.customer?.city || 'Inconnue'
      cityCounts[city] = (cityCounts[city] || 0) + 1
    })
    const topCity = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a])[0] || 'N/A'

    const productCounts = {}
    ordersData.forEach(o => {
      o.items?.forEach(item => {
        const name = item.name
        if (!productCounts[name]) productCounts[name] = { count: 0, revenueEUR: 0 }
        productCounts[name].count += item.quantity
        productCounts[name].revenueEUR += item.price * item.quantity
      })
    })

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        count: data.count,
        // store revenue in EUR; UI should call formatPrice(item.revenue) to display
        revenueEUR: data.revenueEUR
      }))

    setStats({ totalRevenue, totalOrders, pendingOrders, averageOrderValue, topCity, topProducts })
  }

  const applyFilters = () => {
    let filtered = [...orders]
    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer?.phone?.includes(searchTerm)
      )
    }
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter)
    if (cityFilter !== 'all') filtered = filtered.filter(o => o.customer?.city === cityFilter)
    setFilteredOrders(filtered)
  }

  // SUPPRESSION CORRIGÉE
  const deleteOrder = async (orderId) => {
    const id = orderId.toString()
    if (!confirm('Supprimer cette commande ?')) return

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur serveur')

      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.filter(o => o._id.toString() !== id))
        setSelectedOrder(null)
        alert('Supprimée !')
      } else {
        alert('Erreur : ' + data.error)
      }
    } catch (error) {
      alert('Erreur réseau')
    }
  }

  // MISE À JOUR CORRIGÉE
  const updateOrderStatus = async (orderId, newStatus) => {
    const id = orderId.toString()
    try {
      setUpdatingOrder(id)
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Erreur serveur')

      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o._id.toString() === id ? { ...o, status: newStatus } : o))
        if (selectedOrder?._id.toString() === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        alert('Erreur : ' + data.error)
      }
    } catch (error) {
      alert('Erreur réseau')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const cities = [...new Set(orders.map(o => o.customer?.city).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currency={currency} setCurrency={setCurrency} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard Commandes</h1>
            <p className="text-gray-600 mt-2">Vue d'ensemble et gestion</p>
          </div>
          <Link href="/admin" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            Retour Produits
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full"><DollarSign className="h-8 w-8 text-green-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commandes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full"><ShoppingBag className="h-8 w-8 text-blue-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Attente</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full"><Calendar className="h-8 w-8 text-yellow-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Panier Moyen</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(stats.averageOrderValue)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full"><TrendingUp className="h-8 w-8 text-purple-600" /></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="N° commande, nom, téléphone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">Tous</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">Toutes</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Chargement...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">Aucune commande</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">N°</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ville</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.customer?.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <a href={`https://wa.me/${order.customer?.phone?.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-green-600 hover:underline">
                        <Phone className="h-4 w-4 mr-1" /> {order.customer?.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.customer?.city}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={updatingOrder === order._id.toString()}
                        className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusConfig(order.status).color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-600 p-1"><Eye className="h-5 w-5" /></button>
                        <button onClick={() => deleteOrder(order._id)} className="text-red-600 p-1"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Ticket - {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center"><Users className="h-5 w-5 mr-2" />Client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-600">Nom</p><p className="font-medium">{selectedOrder.customer?.name}</p></div>
                  <div><p className="text-sm text-gray-600">Téléphone</p><p className="font-medium">{selectedOrder.customer?.phone}</p></div>
                  <div><p className="text-sm text-gray-600">Ville</p><p className="font-medium">{selectedOrder.customer?.city}</p></div>
                  <div><p className="text-sm text-gray-600">Date</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Statut</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg font-semibold ${getStatusConfig(selectedOrder.status).color}`}
                >
                  {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center"><ShoppingBag className="h-5 w-5 mr-2" />Produits</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => {
                    const itemTotalEUR = item.price * item.quantity
                    return (
                      <div key={i} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                        {item.image && <img src={item.image} alt={item.name} className="h-20 w-20 object-contain bg-white rounded border" />}
                        <div className="flex-grow">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-sm text-gray-600 mt-1">Qté: <span className="font-semibold">{item.quantity}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(itemTotalEUR)}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)} / unité</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <a href={`https://wa.me/${selectedOrder.customer?.phone?.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-center flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5" /><span>WhatsApp</span>
                </a>
                <button onClick={() => deleteOrder(selectedOrder._id)} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center space-x-2">
                  <Trash2 className="h-5 w-5" /><span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}