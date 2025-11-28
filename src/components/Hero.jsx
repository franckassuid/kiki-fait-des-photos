import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleries } from '../data/galleries';
import { getImagePath } from '../utils/imagePath';
import './Hero.scss';

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [randomImages, setRandomImages] = useState([]);

    useEffect(() => {
        // Flatten all images into a single array, preserving metadata
        const allImages = galleries.flatMap(gallery =>
            gallery.images.map(img => ({
                ...img,
                country: gallery.country,
                code: gallery.code,
                // Use subcategory if available, otherwise just country
                location: img.subcategory ? `${img.subcategory}, ${gallery.country}` : gallery.country
            }))
        );

        // Shuffle and pick 10 random images
        const shuffled = allImages.sort(() => 0.5 - Math.random());
        setRandomImages(shuffled.slice(0, 10));
    }, []);

    useEffect(() => {
        if (randomImages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % randomImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [randomImages]);

    if (randomImages.length === 0) return null;

    const currentImage = randomImages[currentImageIndex];

    return (
        <section className="hero">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImageIndex}
                    className="hero-background"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    style={{ backgroundImage: `url(${getImagePath(currentImage.src)})` }}
                />
            </AnimatePresence>
            <div className="hero-overlay">
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

            <div className="hero-metadata">
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
