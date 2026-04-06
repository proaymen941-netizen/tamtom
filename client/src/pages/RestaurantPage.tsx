import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Star,
  Clock,
  Tag,
  Heart,
  AlertTriangle,
  UtensilsCrossed,
  Plus,
  Minus,
} from 'lucide-react';
import type { Restaurant, MenuItem, RestaurantSection } from '@shared/schema';
import { getRestaurantStatus, canOrderFromRestaurant } from '../utils/restaurantHours';
import { useCart } from '@/context/CartContext';

// ─── localStorage meal favorites ─────────────────────────────────────────────
const MEAL_FAV_KEY = 'meal_favorites';
function loadMealFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(MEAL_FAV_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function saveMealFavorites(s: Set<string>) {
  localStorage.setItem(MEAL_FAV_KEY, JSON.stringify([...s]));
}

// ─── localStorage restaurant favorites ───────────────────────────────────────
const REST_FAV_KEY = 'restaurant_favorites';
function loadRestFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(REST_FAV_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function saveRestFavorites(s: Set<string>) {
  localStorage.setItem(REST_FAV_KEY, JSON.stringify([...s]));
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [mealFavs, setMealFavs] = useState<Set<string>>(loadMealFavorites);
  const [restFavs, setRestFavs] = useState<Set<string>>(loadRestFavorites);

  const { addItem, removeItem, getItemQuantity } = useCart();

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/restaurants', id],
  });

  const { data: menuData } = useQuery<{ allItems: MenuItem[] }>({
    queryKey: ['/api/restaurants', id, 'menu'],
    enabled: !!id,
  });
  const menuItems = menuData?.allItems ?? [];

  const { data: sections = [] } = useQuery<RestaurantSection[]>({
    queryKey: ['/api/restaurants', id, 'sections'],
    enabled: !!id,
  });

  // Build section list from menu item categories when no sections defined
  const menuCategories = Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)));
  const hasSections = sections.length > 0;

  const displaySections: { id: string; name: string }[] = hasSections
    ? sections.map(s => ({ id: s.id, name: s.name }))
    : menuCategories.map(c => ({ id: c, name: c }));

  const filteredItems = menuItems.filter(item => {
    if (selectedSection === 'all') return true;
    if (hasSections) return item.category === displaySections.find(s => s.id === selectedSection)?.name;
    return item.category === selectedSection;
  });

  const toggleRestFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    setRestFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveRestFavorites(next);
      return next;
    });
  };

  const toggleMealFav = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setMealFavs(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      saveMealFavorites(next);
      return next;
    });
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="w-full h-52 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <UtensilsCrossed className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500 font-bold">المطعم غير موجود</p>
        <button onClick={() => setLocation('/')} className="text-primary text-sm font-bold">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const status = getRestaurantStatus(restaurant);
  const orderStatus = canOrderFromRestaurant(restaurant);
  const isRestFav = id ? restFavs.has(id) : false;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">

      {/* ── Header Image ─────────────────────────────────────────────────── */}
      <div className="relative w-full h-52 bg-gray-200">
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-gray-200 flex items-center justify-center">
            <UtensilsCrossed className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => setLocation('/')}
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Favorite heart */}
        <button
          onClick={toggleRestFav}
          className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full"
        >
          <Heart className={`h-5 w-5 ${isRestFav ? 'fill-white' : ''}`} />
        </button>

        {/* Restaurant name overlay */}
        <div className="absolute bottom-0 right-0 left-0 p-4">
          <h1 className="text-white text-xl font-black leading-tight mb-1">{restaurant.name}</h1>
          <div className="flex items-center gap-3 text-white/90 text-xs">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {restaurant.rating || '0'} ({restaurant.reviewCount || 0})
            </span>
            {restaurant.deliveryTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {restaurant.deliveryTime}
              </span>
            )}
            {restaurant.deliveryFee !== undefined && (
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {restaurant.deliveryFee} ريال
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              status.isOpen ? 'bg-emerald-500' : 'bg-gray-700'
            }`}>
              {status.isOpen ? 'مفتوح' : 'مغلق'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Closed Alert ─────────────────────────────────────────────────── */}
      {!orderStatus.canOrder && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-xs font-bold">{orderStatus.message}</p>
        </div>
      )}

      {/* ── Section Tabs ─────────────────────────────────────────────────── */}
      {displaySections.length > 0 && (
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="flex overflow-x-auto no-scrollbar px-4 py-2 gap-2">
            <button
              onClick={() => setSelectedSection('all')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                selectedSection === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              الكل
            </button>
            {displaySections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  selectedSection === sec.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Menu Items ───────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">لا توجد عناصر في هذا القسم</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const qty = getItemQuantity(item.id);
            const isMealFav = mealFavs.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex gap-3 p-3">
                  {/* Image */}
                  <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="h-8 w-8 text-gray-200" />
                      </div>
                    )}
                    {/* Meal favorite */}
                    <button
                      onClick={e => toggleMealFav(e, item.id)}
                      className="absolute top-1 left-1 bg-white/80 backdrop-blur-sm rounded-full p-1"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isMealFav ? 'fill-primary text-primary' : 'text-gray-400'}`} />
                    </button>
                    {/* Badge */}
                    {item.isAvailable === false && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">غير متوفر</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 text-sm leading-tight mb-0.5">{item.name}</h3>
                    {item.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-1 leading-snug">{item.description}</p>
                    )}
                    {item.category && (
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{item.category}</span>
                    )}

                    {/* Price + Cart */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {item.discountPrice ? (
                          <>
                            <span className="text-primary font-black text-sm">{item.discountPrice} ر.ي</span>
                            <span className="text-gray-400 text-[11px] line-through">{item.price} ر.ي</span>
                          </>
                        ) : (
                          <span className="text-primary font-black text-sm">{item.price} ر.ي</span>
                        )}
                      </div>

                      {/* Quantity control */}
                      {item.isAvailable !== false && orderStatus.canOrder && (
                        qty > 0 ? (
                          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-2 py-1">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-primary font-black text-sm w-4 text-center">{qty}</span>
                            <button
                              onClick={() => addItem(item, item.restaurantId, restaurant.name)}
                              className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addItem(item, item.restaurantId, restaurant.name)}
                            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
