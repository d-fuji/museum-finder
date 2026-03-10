"use client";

import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import type { MuseumSummary } from "@/types/api";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";

type Props = {
  museums: MuseumSummary[];
  onMuseumClick?: (id: string) => void;
};

const JAPAN_CENTER = { latitude: 36.5, longitude: 137.0 };
const DEFAULT_ZOOM = 5;

export function MuseumMap({ museums, onMuseumClick }: Props) {
  const [selectedMuseum, setSelectedMuseum] = useState<MuseumSummary | null>(null);

  return (
    <Map
      initialViewState={{
        ...JAPAN_CENTER,
        zoom: DEFAULT_ZOOM,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      {museums.map((museum) => (
        <Marker
          key={museum.id}
          latitude={museum.latitude}
          longitude={museum.longitude}
          onClick={() => setSelectedMuseum(museum)}
        >
          <MapPin
            size={28}
            className="cursor-pointer fill-primary text-primary drop-shadow-md transition-transform hover:scale-110"
          />
        </Marker>
      ))}

      {selectedMuseum && (
        <Popup
          latitude={selectedMuseum.latitude}
          longitude={selectedMuseum.longitude}
          onClose={() => setSelectedMuseum(null)}
          closeOnClick={false}
          anchor="bottom"
          offset={28}
        >
          <div className="min-w-40 p-1">
            <p className="text-sm font-bold text-foreground">{selectedMuseum.name}</p>
            <div className="mt-1 flex items-center gap-1">
              <StarRating rating={selectedMuseum.averageRating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {selectedMuseum.averageRating.toFixed(1)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => onMuseumClick?.(selectedMuseum.id)}
            >
              詳細を見る
            </Button>
          </div>
        </Popup>
      )}
    </Map>
  );
}
