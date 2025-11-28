import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GalleryGrid.scss';

import { getImagePath } from '../utils/imagePath';

const GalleryGrid = ({ galleries, onGalleryClick }) => {
    return (
        <motion.div layout className="gallery-grid">
            <AnimatePresence>
                {galleries.map((gallery) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        key={gallery.id}
                        className="gallery-card"
                        onClick={() => onGalleryClick(gallery)}
                    >
                        <div className="image-container">
                            <img src={getImagePath(gallery.cover)} alt={gallery.country} loading="lazy" />
                            <div className="overlay">
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
