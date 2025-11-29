import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { galleries } from '../data/galleries';
import L from 'leaflet';
import { getImagePath } from '../utils/imagePath';
import { ArrowLeft } from 'lucide-react';
import './Map.scss';

// Custom pulsing icon
const customIcon = L.divIcon({
    className: 'custom-marker-container',
    html: '<div class="custom-marker"><div class="marker-pulse"></div></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Component to handle map movements
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
};

const Map = ({ onGalleryClick }) => {
    const [activeCountry, setActiveCountry] = useState(null);
    const [viewState, setViewState] = useState({ center: [20, 0], zoom: 2 });

    const handleCountryClick = (gallery) => {
        setActiveCountry(gallery);
        setViewState({ center: gallery.coordinates, zoom: 6 });
    };

    const handleReset = () => {
        setActiveCountry(null);
        setViewState({ center: [20, 0], zoom: 2 });
    };

    return (
        <section className="map-section">
            <div className="container">
                <h2 className="section-title">La Carte du Monde</h2>
                <div className="map-container">
                    {activeCountry && (
                        <button className="map-back-button" onClick={handleReset}>
                            <ArrowLeft size={20} />
                            Retour au monde
                        </button>
                    )}
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <MapController center={viewState.center} zoom={viewState.zoom} />

                        {!activeCountry ? (
                            // Show Country Markers
                            galleries.map((gallery) => (
                                <Marker
                                    key={gallery.id}
                                    position={gallery.coordinates}
                                    icon={customIcon}
                                    eventHandlers={{
                                        click: () => handleCountryClick(gallery)
                                    }}
                                >
                                    {/* Optional: Add tooltip on hover */}
                                </Marker>
                            ))
                        ) : (
                            // Show City Markers for Active Country
                            activeCountry.cities?.map((city, index) => (
                                <Marker
                                    key={index}
                                    position={city.coordinates}
                                    icon={customIcon}
                                >
                                    <Popup className="city-popup">
                                        <div className="map-popup-content">
                                            <img src={getImagePath(city.cover)} alt={city.name} className="popup-cover" />
                                            <h3>{city.name}</h3>
                                            <button
                                                className="view-gallery-btn"
                                                onClick={() => onGalleryClick(activeCountry, city.name)}
                                            >
                                                Voir les photos
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))
                        )}
                    </MapContainer>
                </div>
            </div>
        </section>
    );
};

export default Map;
