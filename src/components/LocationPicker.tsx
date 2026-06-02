import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SessionLocation } from '../types';
import { Search, MapPin, X, Navigation } from 'lucide-react';

const SPORT_CENTRES: SessionLocation[] = [
  { name: 'Ethos Sport – Imperial College', address: 'Princes Gardens, London SW7 2AZ', lat: 51.4988, lng: -0.1765 },
  { name: 'Queen Mother Sports Centre', address: '223 Vauxhall Bridge Rd, London SW1V 1EL', lat: 51.4931, lng: -0.1412 },
  { name: 'Chelsea Sports Centre', address: 'Chelsea Manor St, London SW3 5PL', lat: 51.4837, lng: -0.1742 },
  { name: 'Westway Sports & Fitness', address: '1 Crowthorne Rd, London W10 6RP', lat: 51.5180, lng: -0.2183 },
  { name: 'Kensington Leisure Centre', address: 'Walmer Rd, London W11 4PH', lat: 51.5079, lng: -0.2038 },
];

const IMPERIAL_CENTER: [number, number] = [51.4988, -0.1749];

function makeCircleIcon(color: string, size: number) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid rgba(255,255,255,0.85);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.55);transform:translate(-50%,-50%)"></div>`,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

const presetIcon = makeCircleIcon('#60A5FA', 14);
const selectedPresetIcon = makeCircleIcon('#CAF300', 20);
const customIcon = makeCircleIcon('#F59E0B', 18);

interface LocationPickerProps {
  value: SessionLocation | null;
  onChange: (loc: SessionLocation) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Track whether the map has been revealed so we know when to invalidateSize
  const mapWasShownRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise Leaflet once (map container is always in the DOM, just height-0 until needed)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: IMPERIAL_CENTER,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    SPORT_CENTRES.forEach((centre) => {
      const marker = L.marker([centre.lat, centre.lng], { icon: presetIcon })
        .addTo(map)
        .bindTooltip(centre.name, { direction: 'top', offset: [0, -4], opacity: 0.92 });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        onChangeRef.current(centre);
      });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
        .then((r) => r.json())
        .then((data) => {
          onChangeRef.current({
            lat, lng,
            name: (data.name || data.display_name?.split(',')[0]) ?? 'Custom Location',
            address: data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          });
        })
        .catch(() => {
          onChangeRef.current({ lat, lng, name: 'Custom Location', address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      selectedMarkerRef.current = null;
      mapWasShownRef.current = false;
    };
  }, []);

  // Update marker; invalidateSize the first time the map becomes visible
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (!value) {
      mapWasShownRef.current = false;
      return;
    }

    // First reveal: wait for the CSS expand transition (300ms) then fix Leaflet's size
    if (!mapWasShownRef.current) {
      mapWasShownRef.current = true;
      setTimeout(() => map.invalidateSize(), 320);
    }

    const isPreset = SPORT_CENTRES.some((c) => c.lat === value.lat && c.lng === value.lng);
    const marker = L.marker([value.lat, value.lng], { icon: isPreset ? selectedPresetIcon : customIcon }).addTo(map);
    selectedMarkerRef.current = marker;
  }, [value]);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }

    searchTimerRef.current = setTimeout(() => {
      setIsSearching(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' London')}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
        .then((r) => r.json())
        .then((data: NominatimResult[]) => setSearchResults(data))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 500);
  }, []);

  const selectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name.split(',')[0];
    onChange({ lat, lng, name, address: result.display_name });
    setSearchQuery(name);
    setSearchResults([]);
    // Pan after invalidateSize has had time to run
    setTimeout(() => mapRef.current?.setView([lat, lng], 15, { animate: true }), 340);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <div className="rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
          <span className="pl-3 text-on-surface-variant shrink-0">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search venue or address..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={() => setTimeout(() => setSearchResults([]), 150)}
            className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="pr-3 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 right-0 z-[1001] mt-1 bg-surface-container-high border border-outline-variant/30 rounded-lg overflow-hidden shadow-xl">
            {isSearching ? (
              <div className="px-4 py-3 text-sm text-on-surface-variant">Searching…</div>
            ) : (
              searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => selectSearchResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors border-b border-outline-variant/20 last:border-b-0"
                >
                  <div className="font-medium truncate">{r.display_name.split(',')[0]}</div>
                  <div className="text-xs text-on-surface-variant truncate">{r.display_name}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Preset chips */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-sans font-extrabold text-on-surface-variant uppercase tracking-wider">
          Popular Venues Near Imperial
        </p>
        <div className="flex flex-wrap gap-2">
          {SPORT_CENTRES.map((centre) => (
            <button
              key={centre.name}
              type="button"
              onClick={() => {
                onChange(centre);
                setTimeout(() => mapRef.current?.setView([centre.lat, centre.lng], 15, { animate: true }), 340);
              }}
              className={`text-[11px] font-sans font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                value?.name === centre.name
                  ? 'bg-primary-fixed/15 border-primary-fixed text-primary-fixed'
                  : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              {centre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map — hidden until a location is chosen, then expands smoothly */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out rounded-xl ${value ? 'max-h-[260px]' : 'max-h-0'}`}>
        <div
          ref={mapContainerRef}
          className="w-full border border-outline-variant/30 rounded-xl overflow-hidden"
          style={{ height: 240 }}
        />
      </div>

      {/* Tap-to-pinpoint hint — shown only when map is visible */}
      {value && (
        <p className="text-[11px] text-on-surface-variant/70 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 shrink-0" />
          Tap anywhere on the map to fine-tune the exact pin location.
        </p>
      )}

      {/* Selected location display */}
      {value && (
        <div className="flex items-start gap-2 px-3 py-2 bg-surface-variant/40 rounded-lg border border-outline-variant/20">
          <MapPin className="w-4 h-4 text-primary-fixed mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{value.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{value.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
