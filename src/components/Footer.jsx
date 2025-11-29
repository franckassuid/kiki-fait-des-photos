import React from 'react';
import { Instagram } from 'lucide-react';
import './Footer.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <a
                    href="https://www.instagram.com/tontonkiki_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                >
                    <Instagram size={24} />
                    <span>Suivre sur Instagram</span>
                </a>
                <p className="copyright">
                    &copy; {new Date().getFullYear()} Franck Assuid. Tous droits réservés.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
