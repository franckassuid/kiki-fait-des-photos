import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Lightbox from './Lightbox';
import { getImagePath } from '../utils/imagePath';
import './GalleryModal.scss';

const GalleryModal = ({ gallery, onClose }) => {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!gallery) return null;

    return (
        <div className="gallery-modal-overlay fade-in">
            <button className="close-button" onClick={onClose}>
                <X size={32} />
            </button>

            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {gallery.code && (
                            <img
                                src={`https://flagcdn.com/w40/${gallery.code.toLowerCase()}.png`}
                                alt={`${gallery.country} flag`}
                                className="modal-flag-icon"
                            />
                        )}
                        {gallery.country}
                    </h2>
                    <span className="modal-subtitle">{gallery.continent}</span>
                </div>

                <div className="gallery-content">
                    {(() => {
                        // Group images by subcategory
                        const groups = {};
                        let hasSubcategories = false;

                        gallery.images.forEach((img) => {
                            const sub = img.subcategory || 'General';
                            if (img.subcategory) hasSubcategories = true;
                            if (!groups[sub]) groups[sub] = [];
                            groups[sub].push(img);
                        });

                        // If no subcategories exist, render as before (single grid)
                        if (!hasSubcategories) {
                            return (
                                <div className="modal-grid">
                                    {gallery.images.map((img, index) => (
                                        <div
                                            key={index}
                                            className="image-wrapper"
                                            onClick={() => setLightboxIndex(index)}
                                        >
                                            <img src={getImagePath(img.src)} alt={`${gallery.country} ${index + 1}`} loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        // Otherwise, render grouped sections
                        // Sort keys to put 'General' first or last? Usually 'General' contains misc photos.
                        // Let's sort alphabetically, but keep 'General' at the top if needed.
                        const sortedKeys = Object.keys(groups).sort();

                        return sortedKeys.map((subcategory) => (
                            <div key={subcategory} className="subcategory-section" style={{ marginBottom: '3rem' }}>
                                {subcategory !== 'General' && (
                                    <h3 className="subcategory-title" style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '1.5rem',
                                        color: 'var(--color-text)',
                                        borderBottom: '1px solid var(--color-border)',
                                        paddingBottom: '0.5rem'
                                    }}>
                                        {subcategory}
                                    </h3>
                                )}
                                <div className="modal-grid">
                                    {groups[subcategory].map((img) => {
                                        const globalIndex = gallery.images.indexOf(img);
                                        return (
                                            <div
                                                key={globalIndex}
                                                className="image-wrapper"
                                                onClick={() => setLightboxIndex(globalIndex)}
                                            >
                                                <img src={getImagePath(img.src)} alt={`${gallery.country} - ${subcategory} ${globalIndex + 1}`} loading="lazy" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={gallery.images}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
};

export default GalleryModal;
