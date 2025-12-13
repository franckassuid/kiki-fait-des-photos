import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleries } from '../data/galleries';
import { getImagePath } from '../utils/imagePath';
import './Hero.scss';

const Hero = ({ onGalleryClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Initialize images: prioritize 'isHero', fallback to random
    const [heroImages] = useState(() => {
        const allImages = galleries.flatMap(gallery =>
            gallery.images.map(img => ({
                ...img,
                country: gallery.country,
                code: gallery.code,
                location: img.subcategory ? `${img.subcategory}, ${gallery.country}` : gallery.country,
                gallery: gallery
            }))
        );

        // Filter for hero images
        const selectedHeroes = allImages.filter(img => img.isHero);

        if (selectedHeroes.length > 0) {
            // Shuffle selected heroes
            return selectedHeroes.sort(() => 0.5 - Math.random());
        } else {
            // Fallback: 10 random images
            return allImages.sort(() => 0.5 - Math.random()).slice(0, 10);
        }
    });

    // Auto-slide effect
    useEffect(() => {
        if (heroImages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroImages]);

    if (heroImages.length === 0) return null;

    const currentImage = heroImages[currentImageIndex];

    // Helper to generate srcset string
    const getSrcSet = (image) => {
        if (!image.srcSet) return '';
        return `
            ${getImagePath(image.srcSet.thumbnail)} 400w,
            ${getImagePath(image.srcSet.medium)} 800w,
            ${getImagePath(image.srcSet.large)} 1920w
        `;
    };

    return (
        <section className="hero">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentImageIndex}
                    className="hero-background-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                >
                    <img
                        src={getImagePath(currentImage.src)}
                        srcSet={getSrcSet(currentImage)}
                        sizes="100vw"
                        alt={currentImage.location}
                        className="hero-background-image"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: -1
                        }}
                    />
                    <div className="hero-overlay-gradient" />
                </motion.div>
            </AnimatePresence>

            <div className="hero-content-wrapper">
                <div className="hero-content">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Explorez le monde
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        À travers l'objectif de Kiki
                    </motion.p>
                </div>
            </div>

            <div
                className="hero-metadata"
                onClick={() => onGalleryClick && onGalleryClick(currentImage.gallery, currentImage.subcategory)}
                style={{ cursor: 'pointer' }}
                title="Voir la galerie"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5 }}
                        className="metadata-content"
                    >
                        <span className="location-text">
                            {currentImage.subcategory && <span className="city">{currentImage.subcategory}</span>}
                            <span className="country">{currentImage.country}</span>
                        </span>
                        {currentImage.code && (
                            <img
                                src={`https://flagcdn.com/w40/${currentImage.code.toLowerCase()}.png`}
                                alt={currentImage.country}
                                className="hero-flag"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Hero;
