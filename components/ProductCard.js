'use client'
import Image from 'next/image'
import { useCartStore } from '@/lib/cartStore'
import { ShoppingCart, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ProductCard({ product, formatPrice }) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [descOpen, setDescOpen] = useState(false)

  const images = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : [])

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Keyboard handlers: ESC to close modals, arrows to navigate images
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false)
        if (descOpen) setDescOpen(false)
      }
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex(i => Math.min(images.length - 1, i + 1))
        }
        if (e.key === 'ArrowLeft') {
          setLightboxIndex(i => Math.max(0, i - 1))
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, descOpen, images.length])

  return (
    <>
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => { setLightboxIndex(0); setLightboxOpen(true) }}
          className="w-full h-full"
          aria-label={`Voir les images de ${product.name}`}
        >
          <Image
            src={images[0] || ''}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        <button type="button" onClick={() => setDescOpen(true)} className="text-xs text-blue-600 hover:underline mt-1">Lire la suite</button>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-gray-800">
            {formatPrice(product.price)}
          </span>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`px-4 py-2 rounded-md transition-all flex items-center space-x-2 ${
              product.stock === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                <span>Ajouté</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Ajouter</span>
              </>
            )}
          </button>
        </div>
        
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-sm text-orange-600 mt-2">
            Plus que {product.stock} en stock !
          </p>
        )}
        
        {product.stock === 0 && (
          <p className="text-sm text-red-600 mt-2">
            Rupture de stock
          </p>
        )}
      </div>
    </div>

      {/* Lightbox modal for images */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 text-white bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-3 text-2xl shadow-lg"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative h-96 bg-black">
                <Image src={images[lightboxIndex] || ''} alt={`${product.name} image ${lightboxIndex+1}`} fill className="object-contain" />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                  <button
                    disabled={lightboxIndex === 0}
                    onClick={() => setLightboxIndex(i => Math.max(0, i-1))}
                    className={`px-3 py-2 rounded ${lightboxIndex===0?'bg-gray-200 text-gray-400':'bg-gray-900 text-white'}`}
                  >
                    Préc
                  </button>
                  <button
                    disabled={lightboxIndex >= images.length-1}
                    onClick={() => setLightboxIndex(i => Math.min(images.length-1, i+1))}
                    className={`px-3 py-2 rounded ${lightboxIndex>=images.length-1?'bg-gray-200 text-gray-400':'bg-gray-900 text-white'}`}
                  >
                    Suiv
                  </button>
                </div>
                <div className="text-sm text-gray-600">{lightboxIndex+1} / {images.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description modal */}
      {descOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200"
          onClick={() => setDescOpen(false)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Description</h3>
              <button onClick={() => setDescOpen(false)} className="text-gray-600 text-2xl leading-none">✕</button>
            </div>
            <div className="mt-4 text-gray-800">
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}