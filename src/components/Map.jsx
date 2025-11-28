import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { galleries } from '../data/galleries';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { getImagePath } from '../utils/imagePath';
import './Map.scss';

// Custom pulsing icon
const customIcon = L.divIcon({
    className: 'custom-marker-container',
    html: '<div class="custom-marker"><div class="marker-pulse"></div></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const Map = () => {
    return (
        <section className="map-section">
            <div className="container">
                <h2 className="section-title">La Carte du Monde</h2>
                <div className="map-container">
                    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {galleries.map((gallery) => (
                            <Marker key={gallery.id} position={gallery.coordinates} icon={customIcon}>
                                <Popup>
                                    <div className="map-popup">
                                        <img src={getImagePath(gallery.cover)} alt={gallery.country} className="popup-cover" />
                                        <h3>
                                            {gallery.code && (
                                                <img
                                                    src={`https://flagcdn.com/w40/${gallery.code.toLowerCase()}.png`}
                                                    alt={`${gallery.country} flag`}
                                                    className="flag-icon"
                                                />
                                            )}
                                            {gallery.country}
                                        </h3>
                                        <p>{gallery.images.length} photos</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </section>
    );
};

export default Map;
