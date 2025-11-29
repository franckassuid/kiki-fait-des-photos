import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImagePath } from '../utils/imagePath';
import './Lightbox.scss';

const Lightbox = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return createPortal(
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose}>
                <X size={32} />
            </button>

            <button
                className="lightbox-nav prev"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
                <ChevronLeft size={40} />
            </button>

            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img
                    src={getImagePath(images[currentIndex].src)}
                    alt={`Gallery image ${currentIndex + 1}`}
                />
                <div className="image-info">
                    <div className="image-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                    {images[currentIndex].exif && (
                        <div className="exif-data">
                            {images[currentIndex].exif.model && <span>{images[currentIndex].exif.model}</span>}
                            {images[currentIndex].exif.focal_length && <span>{images[currentIndex].exif.focal_length}</span>}
                            {images[currentIndex].exif.f_stop && <span>{images[currentIndex].exif.f_stop}</span>}
                            {images[currentIndex].exif.shutter_speed && <span>{images[currentIndex].exif.shutter_speed}</span>}
                            {images[currentIndex].exif.iso && <span>ISO {images[currentIndex].exif.iso}</span>}
                        </div>
                    )}
                </div>
            </div>

            <button
                className="lightbox-nav next"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
                <ChevronRight size={40} />
            </button>
        </div>,
        document.body
    );
};

export default Lightbox;
