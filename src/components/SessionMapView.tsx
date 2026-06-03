import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MatchSession } from '../types';

const IMPERIAL_CENTER: [number, number] = [51.4988, -0.1749];

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function makeSessionIcon(isFull: boolean) {
  const color = isFull ? '#EF4444' : '#22C55E';
  return L.divIcon({
    html: `<div style="width:16px;height:16px;background:${color};border:2.5px solid rgba(255,255,255,0.85);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:translate(-50%,-50%)"></div>`,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function buildPopupHtml(session: MatchSession) {
  const isFull = session.playersJoined.length >= session.maxPlayers;
  const spots = session.maxPlayers - session.playersJoined.length;
  const spotsLabel = isFull ? 'Full' : `${spots} spot${spots === 1 ? '' : 's'} left`;
  const spotsColor = isFull ? '#ef4444' : '#caf300';
  const gender = session.gender === 'male' ? '♂ Male' : session.gender === 'female' ? '♀ Female' : '⚥ Open';

  return `
    <div style="font-family:Inter,sans-serif;color:#e2e2e2;background:#282a2b;padding:12px 14px;border-radius:12px;min-width:190px;max-width:220px;border:1px solid rgba(255,255,255,0.08)">
      <div style="font-weight:700;font-size:13px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(session.location!.name)}</div>
      <div style="font-size:11px;color:#8a9090;margin-bottom:8px">${esc(session.date)} · ${esc(session.timeStart)}–${esc(session.timeEnd)}</div>
      <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap">
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;background:rgba(202,243,0,0.1);color:#caf300;border:1px solid rgba(202,243,0,0.3);text-transform:uppercase;letter-spacing:0.05em">${esc(session.skillLevel)}</span>
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;background:#333535;color:#8a9090;text-transform:uppercase;letter-spacing:0.05em">${esc(session.matchType)}</span>
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;background:#333535;color:#8a9090;text-transform:uppercase;letter-spacing:0.05em">${esc(gender)}</span>
      </div>
      <div style="font-size:11px;color:${spotsColor};font-weight:600;margin-bottom:10px">${esc(spotsLabel)}</div>
      <button
        class="session-map-view-btn"
        data-session-id="${esc(session.id)}"
        style="width:100%;padding:7px 0;background:#caf300;color:#121414;font-weight:800;font-size:11px;border:none;border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:0.07em"
      >
        View Session
      </button>
    </div>
  `;
}

interface SessionMapViewProps {
  sessions: MatchSession[];
  onSelectSession: (id: string) => void;
  currentUserId?: string;
  fullScreen?: boolean;
}

export default function SessionMapView({ sessions, onSelectSession, currentUserId, fullScreen }: SessionMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectSession);
  useEffect(() => { onSelectRef.current = onSelectSession; }, [onSelectSession]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: IMPERIAL_CENTER,
      zoom: 13,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    // Re-measure whenever the container's size changes. On a fresh page load
    // Leaflet often reads the container before the layout has settled, which
    // leaves tiles rendered in only a thin strip at the top. A ResizeObserver
    // catches the final dimensions and a couple of rAF ticks cover the initial
    // paint.
    const invalidate = () => map.invalidateSize();
    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(mapContainerRef.current);
    const raf1 = requestAnimationFrame(() => {
      invalidate();
      requestAnimationFrame(invalidate);
    });

    return () => {
      cancelAnimationFrame(raf1);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const locatedSessions = sessions.filter((s) => s.location);

    locatedSessions.forEach((session) => {
      const { lat, lng } = session.location!;
      const isFull = session.playersJoined.length >= session.maxPlayers;
      const marker = L.marker([lat, lng], { icon: makeSessionIcon(isFull) }).addTo(layerGroup);

      const popup = L.popup({
        className: 'session-map-popup',
        maxWidth: 240,
        closeButton: false,
      }).setContent(buildPopupHtml(session));

      marker.bindPopup(popup);

      // Wire up the View button after popup opens
      marker.on('popupopen', () => {
        const el = popup.getElement();
        const btn = el?.querySelector<HTMLButtonElement>('.session-map-view-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectRef.current(session.id);
            map.closePopup();
          }, { once: true });
        }
      });
    });

    if (locatedSessions.length > 0) {
      const bounds = L.latLngBounds(locatedSessions.map((s) => [s.location!.lat, s.location!.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [sessions, currentUserId]);

  const legend = (
    <div className="flex flex-col gap-1.5 bg-surface-container-high/90 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-outline-variant/20 shadow-lg">
      {[
        { color: '#22C55E', label: 'Open' },
        { color: '#EF4444', label: 'Full' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: color, border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          />
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-wide">{label}</span>
        </div>
      ))}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="relative w-full h-full">
        <div ref={mapContainerRef} className="absolute inset-0" />
        <div className="absolute bottom-10 left-3 z-[450] pointer-events-none">
          {legend}
        </div>
      </div>
    );
  }

  const unlocatedCount = sessions.length - sessions.filter((s) => s.location).length;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full rounded-xl overflow-hidden border border-outline-variant/30"
          style={{ height: 420 }}
        />
        <div className="absolute bottom-3 left-3 z-[450] pointer-events-none">
          {legend}
        </div>
      </div>
      {unlocatedCount > 0 && (
        <p className="text-xs text-on-surface-variant text-center">
          {unlocatedCount} session{unlocatedCount > 1 ? 's' : ''} without a map pin — visible in list view
        </p>
      )}
    </div>
  );
}
