import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PharmacyOffer, OfferTag } from '../types/offer';
import { CartItem } from '../types/cart';
import { Address } from '../types/user';
import { OfferService } from '../services/offerService';
import { useCart } from './CartContext';
import { useAddress } from './AddressContext';

interface OfferContextType {
  offers: PharmacyOffer[];
  isMatching: boolean;
  matchingStep: number;
  matchingStatusText: string;
  selectedOffer: PharmacyOffer | null;
  activeFilter: OfferTag | 'all';
  timeRemainingSeconds: number;
  isOffersExpired: boolean;
  startFindingPharmacies: (cartId: string, items: CartItem[], address?: Address | null) => Promise<PharmacyOffer[]>;
  selectOffer: (offer: PharmacyOffer) => void;
  setActiveFilter: (filter: OfferTag | 'all') => void;
  filteredOffers: PharmacyOffer[];
  invalidateOffers: () => void;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

export const OfferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<PharmacyOffer[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchingStatusText, setMatchingStatusText] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<PharmacyOffer | null>(null);
  const [activeFilter, setActiveFilter] = useState<OfferTag | 'all'>('all');
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600); // 10 minutes
  const [isOffersExpired, setIsOffersExpired] = useState(false);

  useEffect(() => {
    try {
      const initial = OfferService.getMockOffersSync('cart-current');
      setOffers(initial);
      if (initial.length > 0) {
        setSelectedOffer(initial[0]);
      }
    } catch {
      // fallback
    }
  }, []);

  const invalidateOffers = useCallback(() => {
    OfferService.invalidateOffers();
    const fresh = OfferService.getMockOffersSync('cart-current');
    setOffers(fresh);
    setSelectedOffer(fresh[0] || null);
    setIsOffersExpired(false);
  }, []);

  // Expiry countdown timer
  useEffect(() => {
    if (offers.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsOffersExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offers]);

  const startFindingPharmacies = useCallback(
    async (cartId: string, items: CartItem[], address?: Address | null): Promise<PharmacyOffer[]> => {
      setIsMatching(true);
      setMatchingStep(1);
      setMatchingStatusText('Checking delivery location & serviceability radius...');

      await new Promise((r) => setTimeout(r, 600));
      setMatchingStep(2);
      setMatchingStatusText('Found 12 licensed pharmacies within 3 km...');

      await new Promise((r) => setTimeout(r, 700));
      setMatchingStep(3);
      setMatchingStatusText('Verifying batch stock & prescription requirements...');

      const generatedOffers = await OfferService.generateOffersForCart(cartId, items, address);

      await new Promise((r) => setTimeout(r, 700));
      setMatchingStep(4);
      setMatchingStatusText('Received 4 competitive pharmacy bids!');

      setOffers(generatedOffers);
      if (generatedOffers.length > 0) {
        setSelectedOffer(generatedOffers[0]); // Recommended default
      }
      setTimeRemainingSeconds(600);
      setIsOffersExpired(false);
      setIsMatching(false);
      return generatedOffers;
    },
    []
  );

  const selectOffer = useCallback((offer: PharmacyOffer) => {
    setSelectedOffer(offer);
  }, []);

  const filteredOffers = offers.filter((offer) => {
    if (activeFilter === 'all') return true;
    return offer.tags.includes(activeFilter);
  });

  return (
    <OfferContext.Provider
      value={{
        offers,
        isMatching,
        matchingStep,
        matchingStatusText,
        selectedOffer,
        activeFilter,
        timeRemainingSeconds,
        isOffersExpired,
        startFindingPharmacies,
        selectOffer,
        setActiveFilter,
        filteredOffers,
        invalidateOffers,
      }}
    >
      {children}
    </OfferContext.Provider>
  );
};

export const useOffers = () => {
  const context = useContext(OfferContext);
  if (!context) {
    throw new Error('useOffers must be used within an OfferProvider');
  }
  return context;
};
