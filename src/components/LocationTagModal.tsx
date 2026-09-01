import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X, Check, Loader2, AlertCircle, Compass } from 'lucide-react';
import type { LocationData } from '../types';

interface LocationTagModalProps {
  currentLocation?: LocationData;
  onSaveLocation: (loc?: LocationData) => void;
  onClose: () => void;
}

export const LocationTagModal: React.FC<LocationTagModalProps> = ({
  currentLocation,
  onSaveLocation,
  onClose,
}) => {
  const [placeName, setPlaceName] = useState(currentLocation?.placeName || '');
  const [city, setCity] = useState(currentLocation?.city || '');
  const [country, setCountry] = useState(currentLocation?.country || '');
  const [lat, setLat] = useState<number>(currentLocation?.lat || 37.7749);
  const [lng, setLng] = useState<number>(currentLocation?.lng || -122.4194);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Quick preset locations for mindful journaling contexts
  const PRESET_PLACES = [
    { name: 'Home Sanctuary', city: 'Private Residence', lat: 37.7749, lng: -122.4194 },
    { name: 'Quiet Coffee Shop', city: 'Downtown Cafe', lat: 37.7888, lng: -122.4074 },
    { name: 'Nature Trail / Park', city: 'Redwood Park', lat: 37.8024, lng: -122.4058 },
    { name: 'Creative Studio', city: 'Workspace', lat: 37.7699, lng: -122.4469 },
  ];

  // Geolocation detector
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        // Update map position
        if (mapInstanceRef.current && (window as any).google?.maps) {
          const newPos = { lat: latitude, lng: longitude };
          mapInstanceRef.current.setCenter(newPos);
          mapInstanceRef.current.setZoom(14);
          if (markerRef.current) {
            markerRef.current.setPosition(newPos);
          }
        }

        // Reverse geocoding via Google Maps API if available
        if ((window as any).google?.maps?.Geocoder) {
          try {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
              if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                const parts = address.split(',');
                setPlaceName(parts[0] || 'Current Sanctuary');
                setCity(parts[1]?.trim() || '');
                setCountry(parts[parts.length - 1]?.trim() || '');
              } else {
                setPlaceName('Current Sanctuary');
              }
            });
          } catch {
            setPlaceName('Current Sanctuary');
          }
        } else {
          setPlaceName('Current Sanctuary');
        }

        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        setDetectError(err.message || 'Unable to retrieve your current physical location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Load Google Maps API script dynamically
  useEffect(() => {
    const loadGoogleMaps = () => {
      if ((window as any).google?.maps) {
        initMap();
        return;
      }

      // Check if script already attached
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places';
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        console.warn('Google Maps script failed to load, falling back to coordinate mode.');
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current || !(window as any).google?.maps) return;

      try {
        const initialPos = { lat, lng };
        const map = new (window as any).google.maps.Map(mapContainerRef.current, {
          center: initialPos,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#161826' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#11131C' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#25283D' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0F172A' }],
            },
          ],
          internalUsageAttributionIds: ['gmp_git_agentskills_v1'],
        });

        const marker = new (window as any).google.maps.Marker({
          position: initialPos,
          map: map,
          draggable: true,
          title: placeName || 'Reflection Sanctuary',
        });

        marker.addListener('dragend', (evt: any) => {
          const newLat = evt.latLng.lat();
          const newLng = evt.latLng.lng();
          setLat(newLat);
          setLng(newLng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        console.warn('Error initializing Google Maps:', err);
      }
    };

    loadGoogleMaps();
  }, []);

  const handleApplyPreset = (preset: typeof PRESET_PLACES[0]) => {
    setPlaceName(preset.name);
    setCity(preset.city);
    setLat(preset.lat);
    setLng(preset.lng);

    if (mapInstanceRef.current && (window as any).google?.maps) {
      const pos = { lat: preset.lat, lng: preset.lng };
      mapInstanceRef.current.setCenter(pos);
      if (markerRef.current) {
        markerRef.current.setPosition(pos);
      }
    }
  };

  const handleSave = () => {
    if (!placeName.trim()) {
      setDetectError('Please provide a place name for this reflection location.');
      return;
    }

    const locData: LocationData = {
      placeName: placeName.trim(),
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      lat,
      lng,
      formattedAddress: [placeName.trim(), city.trim(), country.trim()].filter(Boolean).join(', '),
    };

    onSaveLocation(locData);
    onClose();
  };

  const handleRemove = () => {
    onSaveLocation(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-[#11131C] border border-white/[0.12] shadow-2xl space-y-5 text-[#F3F4F6]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E1B4B] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD]">
              <MapPin className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#F9FAFB]">Tag Physical Location</h3>
              <p className="text-xs text-[#9CA3AF]">
                Enrich your reflection with geographical context and mindful environment mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick GPS auto-detect & presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
              Quick Environments
            </span>
            <button
              onClick={handleDetectCurrentLocation}
              disabled={isDetecting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E1B4B] hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-medium transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-[#8B5CF6]/10"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Detect My Location</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_PLACES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  placeName === preset.name
                    ? 'bg-[#1E1B4B] border-[#8B5CF6] text-[#F9FAFB]'
                    : 'bg-[#161826] border-white/[0.08] text-[#9CA3AF] hover:bg-[#1E2235] hover:text-[#F3F4F6]'
                }`}
              >
                <div className="font-medium truncate">{preset.name}</div>
                <div className="text-[10px] text-[#6B7280] truncate">{preset.city}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[11px] font-medium text-[#9CA3AF]">
              Place / Sanctuary Name *
            </label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g., Home Balcony, Coastline Bench, Library"
              className="w-full px-3 py-2 rounded-xl bg-[#161826] border border-white/[0.08] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[#9CA3AF]">City / Area</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. San Francisco"
              className="w-full px-3 py-2 rounded-xl bg-[#161826] border border-white/[0.08] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </div>

        {/* Interactive Google Map Preview Container */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <span>Google Maps Coordinate Alignment</span>
            <span className="font-mono text-[#6B7280]">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-44 rounded-xl border border-white/[0.08] bg-[#161826] overflow-hidden relative"
          >
            {/* Fallback styling if Maps API is loading or unavailable */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B7280] space-y-1 pointer-events-none">
              <Compass className="w-6 h-6 text-[#8B5CF6]/50 animate-pulse" />
              <span className="text-[11px]">Pin Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {detectError && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A1418]/40 border border-[#FB7185]/40 text-xs text-[#FB7185]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{detectError}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          {currentLocation ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3.5 py-2 rounded-xl bg-[#FB7185]/10 hover:bg-[#FB7185]/20 text-[#FB7185] text-xs font-medium transition-colors cursor-pointer border border-[#FB7185]/30"
            >
              Remove Location Tag
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1E2235] hover:bg-[#282E47] text-[#E5E7EB] text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white text-xs font-semibold transition-all shadow-md shadow-[#7C3AED]/20 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
