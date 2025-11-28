import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import GalleryGrid from './components/GalleryGrid';
import GalleryModal from './components/GalleryModal';
import ContactForm from './components/ContactForm';
import Map from './components/Map';
import { galleries } from './data/galleries';

function App() {
  const [selectedContinent, setSelectedContinent] = useState('Tous');
  const [selectedGallery, setSelectedGallery] = useState(null);

  const continents = useMemo(() => {
    const uniqueContinents = new Set(galleries.map(g => g.continent));
    return Array.from(uniqueContinents);
  }, []);

  const filteredGalleries = selectedContinent === 'Tous'
    ? galleries
    : galleries.filter(gallery => gallery.continent === selectedContinent);

  return (
    <div className="app">
      <Header />
      <Hero />

      <main className="main-content">
        <FilterBar
          continents={continents}
          activeFilter={selectedContinent === 'Tous' ? 'All' : selectedContinent}
          onFilterChange={(filter) => setSelectedContinent(filter === 'All' ? 'Tous' : filter)}
        />

        <GalleryGrid
          galleries={filteredGalleries}
          onGalleryClick={setSelectedGallery}
        />

        <Map />

        <ContactForm />
      </main>

      {selectedGallery && (
        <GalleryModal
          gallery={selectedGallery}
          onClose={() => setSelectedGallery(null)}
        />
      )}
    </div>
  );
}

export default App;
