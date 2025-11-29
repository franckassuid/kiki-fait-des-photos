import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import GalleryGrid from './components/GalleryGrid';
import GalleryModal from './components/GalleryModal';
import ContactForm from './components/ContactForm';
import Map from './components/Map';
import { galleries } from './data/galleries';

import Lightbox from './components/Lightbox';

function App() {
  const [selectedContinent, setSelectedContinent] = useState('Tous');
  const [selectedGalleryData, setSelectedGalleryData] = useState(null); // { gallery, initialSubcategory }
  const [lightboxState, setLightboxState] = useState({ isOpen: false, images: [], index: 0 });

  const continents = useMemo(() => {
    const uniqueContinents = new Set(galleries.map(g => g.continent));
    return Array.from(uniqueContinents);
  }, []);

  const filteredGalleries = selectedContinent === 'Tous'
    ? galleries
    : galleries.filter(gallery => gallery.continent === selectedContinent);

  const handleGalleryClick = (gallery, subcategory = null) => {
    setSelectedGalleryData({ gallery, initialSubcategory: subcategory });
  };

  const handleImageClick = (images, index) => {
    setLightboxState({ isOpen: true, images, index });
  };

  const closeLightbox = () => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="app">
      <Header />
      <Hero onGalleryClick={(gallery, subcategory) => handleGalleryClick(gallery, subcategory)} />

      <main className="main-content">
        <FilterBar
          continents={continents}
          activeFilter={selectedContinent === 'Tous' ? 'All' : selectedContinent}
          onFilterChange={(filter) => setSelectedContinent(filter === 'All' ? 'Tous' : filter)}
        />

        <GalleryGrid
          galleries={filteredGalleries}
          onGalleryClick={(gallery) => handleGalleryClick(gallery)}
        />

        <Map onGalleryClick={(gallery) => handleGalleryClick(gallery)} />

        <ContactForm />
      </main>

      {selectedGalleryData && (
        <GalleryModal
          gallery={selectedGalleryData.gallery}
          initialSubcategory={selectedGalleryData.initialSubcategory}
          onClose={() => setSelectedGalleryData(null)}
          onImageClick={handleImageClick}
        />
      )}

      {lightboxState.isOpen && (
        <Lightbox
          images={lightboxState.images}
          initialIndex={lightboxState.index}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}

export default App;
