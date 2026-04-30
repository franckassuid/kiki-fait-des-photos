import React from 'react';
import { galleries } from '../data/galleries';

export default function HiddenAllPhotos() {
  // Aplatit toutes les images de toutes les galeries dans un seul tableau
  const allImages = galleries.flatMap(g => g.images);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#fff' }}>Toutes les photos (Page cachée pour analyse)</h1>
      <p style={{ color: '#aaa' }}>Total : {allImages.length} photos</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', width: '100%', maxWidth: '1200px' }}>
        {allImages.map((img, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={img.src} 
              alt={`Photo ${idx}`} 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
            />
            <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.9rem' }}>{img.src}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
