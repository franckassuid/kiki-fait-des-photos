import React from 'react';
import { Instagram } from 'lucide-react';
import { getImagePath } from '../utils/imagePath';
import './Header.scss';

const Header = () => {
    return (
        <header className="header">
            <div className="container header-container">
                <div className="logo-container">
                    <img src={getImagePath('/logo.svg')} alt="Kiki fait des photos Logo" className="logo-img" />
                    <h1 className="title">Kiki fait des photos</h1>
                </div>
                <a href="https://www.instagram.com/tontonkiki_/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                    <Instagram size={24} />
                </a>
            </div>
        </header>
    );
};

export default Header;
