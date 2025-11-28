import React from 'react';
import './ContactForm.scss';

const ContactForm = () => {
    return (
        <section className="contact-section">
            <div className="container contact-container">
                <h2 className="contact-title">Contact</h2>
                <p className="contact-subtitle">Un projet ? Une question ? Écrivez-moi.</p>

                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <input type="text" placeholder="Nom" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <textarea
                        placeholder="Votre message"
                        rows={5}
                    />
                    <button type="submit">
                        Envoyer
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
