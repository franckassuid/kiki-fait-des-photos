import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getImagePath } from '../utils/imagePath';
import { formatExposureTime, formatDate, formatCameraModel } from '../utils/formatters';
import './Lightbox.scss';

const Lightbox = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const transformRef = useRef(null);
    const hasMultiTouchOccurred = useRef(false);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Reset zoom when image changes
    useEffect(() => {
        if (transformRef.current) {
            transformRef.current.resetTransform();
        }
        setIsZoomed(false);
        hasMultiTouchOccurred.current = false;
    }, [currentIndex]);

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

    // Swipe handlers
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        if (e.touches.length > 1) {
            hasMultiTouchOccurred.current = true;
        }

        if (isZoomed || hasMultiTouchOccurred.current) return;

        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        if (e.touches.length > 1) {
            hasMultiTouchOccurred.current = true;
        }

        if (isZoomed || hasMultiTouchOccurred.current) {
            setTouchStart(null);
            setTouchEnd(null);
            return;
        }
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = (e) => {
        // Reset multi-touch flag only when all fingers are lifted
        if (e.touches.length === 0) {
            if (hasMultiTouchOccurred.current) {
                hasMultiTouchOccurred.current = false;
                return;
            }
        }

        if (isZoomed || hasMultiTouchOccurred.current) return;
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();
    };

    const handleImageClick = (e) => {
        if (isZoomed) return;

        const { clientX, currentTarget } = e;
        const { width, left } = currentTarget.getBoundingClientRect();
        const x = clientX - left;

        // Navigation zones (left 30%, right 30%)
        if (x < width * 0.3) {
            handlePrev();
        } else if (x > width * 0.7) {
            handleNext();
        }
    };

    return (
        <div
            className="lightbox-overlay"
            onClick={onClose}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
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
                <TransformWrapper
                    ref={transformRef}
                    initialScale={1}
                    minScale={1}
                    maxScale={5}
                    centerOnInit={true}
                    doubleClick={{ disabled: false, mode: 'toggle' }}
                    wheel={{ disabled: false, step: 0.2 }}
                    panning={{ disabled: !isZoomed }}
                    onTransformed={(ref) => setIsZoomed(ref.instance.transformState.scale > 1)}
                >
                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                        <div
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={handleImageClick}
                        >
                            <img
                                src={getImagePath(images[currentIndex].src)}
                                alt={`Gallery image ${currentIndex + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    </TransformComponent>
                </TransformWrapper>

                <div className="image-info" style={{ opacity: isZoomed ? 0 : 1, transition: 'opacity 0.3s ease' }}>
                    <div className="image-counter">
                        {images[currentIndex].subcategory && <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>{images[currentIndex].subcategory}</span>}
                        {currentIndex + 1} / {images.length}
                    </div>
                    {images[currentIndex].exif && (
                        <div className="exif-data">
                            {images[currentIndex].exif.model && <span style={{ opacity: 0.7 }}>{formatCameraModel(images[currentIndex].exif.model)}</span>}
                            {images[currentIndex].exif.focal_length && <span style={{ opacity: 0.7 }}>{images[currentIndex].exif.focal_length}</span>}
                            {images[currentIndex].exif.f_stop && <span style={{ opacity: 0.7 }}>{images[currentIndex].exif.f_stop}</span>}
                            {images[currentIndex].exif.shutter_speed && <span style={{ opacity: 0.7 }}>{formatExposureTime(images[currentIndex].exif.shutter_speed)}</span>}
                            {images[currentIndex].exif.iso && <span style={{ opacity: 0.7 }}>ISO {images[currentIndex].exif.iso}</span>}
                            {images[currentIndex].exif.date && <span style={{ opacity: 1 }}>{formatDate(images[currentIndex].exif.date)}</span>}
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
        </div>
    );
};

export default Lightbox;
