"use client";

import { useMemo, useState } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Dealer } from "@/types/dealer";
import { Star } from "lucide-react";

interface DealerMapProps {
  dealers: Dealer[];
}

export default function DealerMap({ dealers }: DealerMapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

  const center = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []); // Center of India

  if (!isLoaded) return <div className="w-full h-[500px] bg-charcoal-900 animate-pulse rounded-2xl border border-white/10 flex items-center justify-center text-charcoal-400">Loading Map...</div>;

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 relative shadow-lg">
      <GoogleMap
        zoom={5}
        center={center}
        mapContainerClassName="w-full h-full"
        options={{
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
          ],
          disableDefaultUI: false,
        }}
      >
        {dealers.map((dealer) => {
          if (!dealer.latitude || !dealer.longitude) return null;
          return (
            <Marker
              key={dealer.id}
              position={{ lat: dealer.latitude, lng: dealer.longitude }}
              onClick={() => setSelectedDealer(dealer)}
            />
          );
        })}

        {selectedDealer && selectedDealer.latitude && selectedDealer.longitude && (
          <InfoWindow
            position={{ lat: selectedDealer.latitude, lng: selectedDealer.longitude }}
            onCloseClick={() => setSelectedDealer(null)}
          >
            <div className="bg-white p-2 rounded text-black max-w-[250px]">
              <h3 className="font-bold text-lg mb-1">{selectedDealer.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedDealer.city}, {selectedDealer.state}</p>
              <div className="flex items-center gap-1 mb-2 text-sm font-semibold">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                {selectedDealer.average_rating.toFixed(1)} ({selectedDealer.total_reviews} reviews)
              </div>
              <a 
                href={`tel:${selectedDealer.phone}`} 
                className="block text-center w-full bg-blue-600 text-white text-sm py-1.5 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Call {selectedDealer.phone}
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
