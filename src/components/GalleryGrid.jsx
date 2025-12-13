import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GalleryGrid.scss';

import { getImagePath } from '../utils/imagePath';

import Loader from './Loader';

const GalleryGrid = ({ galleries, onGalleryClick }) => {
    const [loadingImages, setLoadingImages] = React.useState({});

    const handleImageLoad = (id) => {
        setLoadingImages(prev => ({ ...prev, [id]: false }));
    };

    // Helper to generate srcset from the medium cover path
    // Assumes file ends with _medium.webp
    const getCoverSrcSet = (coverPath) => {
        if (!coverPath) return '';
        const basePath = coverPath.replace('_medium.webp', '');
        return `
            ${getImagePath(basePath + '_thumb.webp')} 400w,
            ${getImagePath(basePath + '_medium.webp')} 800w,
            ${getImagePath(basePath + '_large.webp')} 1920w
        `;
    };

    return (
        <motion.div className="gallery-grid">
            <AnimatePresence mode="wait">
                {galleries.map((gallery) => (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        key={gallery.id}
                        className="gallery-card"
                        onClick={() => onGalleryClick(gallery)}
                    >
                        <div className="image-container">
                            {loadingImages[gallery.id] !== false && <Loader />}
                            <img
                                src={getImagePath(gallery.cover)}
                                srcSet={getCoverSrcSet(gallery.cover)}
                                sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 800px"
                                alt={gallery.country}
                                loading="lazy"
                                onLoad={() => handleImageLoad(gallery.id)}
                                style={{ opacity: loadingImages[gallery.id] === false ? 1 : 0 }}
                            />
                            <div className="overlay">
                                <h3>
                                    {gallery.code && (
                                        <img
                                            src={`https://flagcdn.com/w40/${gallery.code.toLowerCase()}.png`}
                                            alt={`${gallery.country} flag`}
                                            className="flag-icon"
                                        />
                                    )}
                                    <span>{gallery.country}</span>
                                </h3>
                                <span className="photo-count">{gallery.images.length} photos</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default GalleryGrid;
