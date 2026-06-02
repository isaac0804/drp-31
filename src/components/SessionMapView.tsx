import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MatchSession } from '../types';

const IMPERIAL_CENTER: [number, number] = [51.4988, -0.1749];

function makeSessionIcon(isFull: boolean, isHosted: boolean) {
  const color = isFull ? '#6B7280' : isHosted ? '#F59E0B' : '#CAF300';
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
      <div style="font-weight:700;font-size:13px;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${session.location!.name}</div>
      <div style="font-size:11px;color:#8a9090;margin-bottom:8px">${session.date} · ${session.timeStart}–${session.timeEnd}</div>
      <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap">
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;background:rgba(202,243,0,0.1);color:#caf300;border:1px solid rgba(202,243,0,0.3);text-transform:uppercase;letter-spacing:0.05em">${session.skillLevel}</span>
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;background:#333535;color:#8a9090;text-transform:uppercase;letter-spacing:0.05em">${session.matchType}</span>
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:999px;background:#333535;color:#8a9090;text-transform:uppercase;letter-spacing:0.05em">${gender}</span>
      </div>
      <div style="font-size:11px;color:${spotsColor};font-weight:600;margin-bottom:10px">${spotsLabel}</div>
      <button
        class="session-map-view-btn"
        data-session-id="${session.id}"
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
}

export default function SessionMapView({ sessions, onSelectSession, currentUserId }: SessionMapViewProps) {
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

    return () => {
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
      const isHosted = session.host.id === currentUserId;

      const marker = L.marker([lat, lng], { icon: makeSessionIcon(isFull, isHosted) }).addTo(layerGroup);

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

  const locatedCount = sessions.filter((s) => s.location).length;
  const unlocatedCount = sessions.length - locatedCount;

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="w-full rounded-xl overflow-hidden border border-outline-variant/30"
        style={{ height: 420 }}
      />
      {unlocatedCount > 0 && (
        <p className="text-xs text-on-surface-variant text-center">
          {unlocatedCount} session{unlocatedCount > 1 ? 's' : ''} without a map pin — visible in list view
        </p>
      )}
    </div>
  );
}
