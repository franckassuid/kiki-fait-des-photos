import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getImagePath } from '../utils/imagePath';
import './GalleryModal.scss';

const GalleryModal = ({ gallery, initialSubcategory, onClose, onImageClick }) => {
    const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory || 'Tous');

    useEffect(() => {
        if (initialSubcategory) {
            setSelectedSubcategory(initialSubcategory);
        }
    }, [initialSubcategory]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!gallery) return null;

    // Extract unique subcategories
    const others = [...new Set(gallery.images.map(img => img.subcategory).filter(Boolean))].sort();
    const subcategories = ['Tous', ...others];
    const hasSubcategories = subcategories.length > 1;

    // Filter images
    const filteredImages = selectedSubcategory === 'Tous'
        ? gallery.images
        : gallery.images.filter(img => img.subcategory === selectedSubcategory);

    // Group images by subcategory if 'Tous' is selected
    const groupedImages = selectedSubcategory === 'Tous' && hasSubcategories
        ? gallery.images.reduce((acc, img) => {
            const sub = img.subcategory || 'Autres';
            if (!acc[sub]) acc[sub] = [];
            acc[sub].push(img);
            return acc;
        }, {})
        : null;

    // Sort keys to put 'Autres' last if it exists, otherwise alphabetical
    const sortedGroups = groupedImages
        ? Object.keys(groupedImages).sort((a, b) => {
            if (a === 'Autres') return 1;
            if (b === 'Autres') return -1;
            return a.localeCompare(b);
        })
        : null;

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

                    {hasSubcategories && (
                        <div className="modal-filter-bar">
                            {subcategories.map(sub => (
                                <button
                                    key={sub}
                                    className={`filter-btn ${selectedSubcategory === sub ? 'active' : ''}`}
                                    onClick={() => setSelectedSubcategory(sub)}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="gallery-content">
                    {selectedSubcategory === 'Tous' && hasSubcategories ? (
                        <div className="grouped-grid">
                            {sortedGroups.map(group => (
                                <div key={group} className="group-section">
                                    <h3 className="group-title">{group}</h3>
                                    <div className="modal-grid">
                                        {groupedImages[group].map((img) => {
                                            const originalIndex = gallery.images.indexOf(img);
                                            return (
                                                <div
                                                    key={originalIndex}
                                                    className="image-wrapper"
                                                    onClick={() => onImageClick(gallery.images, originalIndex)}
                                                >
                                                    <img src={getImagePath(img.src)} alt={`${gallery.country} ${originalIndex + 1}`} loading="lazy" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="modal-grid">
                            {filteredImages.map((img) => {
                                // Find the original index for the lightbox
                                const originalIndex = gallery.images.indexOf(img);
                                return (
                                    <div
                                        key={originalIndex}
                                        className="image-wrapper"
                                        onClick={() => onImageClick(gallery.images, originalIndex)}
                                    >
                                        <img src={getImagePath(img.src)} alt={`${gallery.country} ${originalIndex + 1}`} loading="lazy" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryModal;
