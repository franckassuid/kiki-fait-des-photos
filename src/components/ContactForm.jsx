import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import './ContactForm.scss';

const ContactForm = () => {
    // REPLACE "YOUR_FORMSPREE_ID" WITH YOUR ACTUAL FORM ID FROM FORMSPREE.IO
    const [state, handleSubmit] = useForm("YOUR_FORMSPREE_ID");

    if (state.succeeded) {
        return (
            <section className="contact-section">
                <div className="container contact-container">
                    <h2 className="contact-title">Merci !</h2>
                    <p className="contact-subtitle">Votre message a bien été envoyé. Je vous répondrai dès que possible.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="contact-section">
            <div className="container contact-container">
                <h2 className="contact-title">Contact</h2>
                <p className="contact-subtitle">Un projet ? Une question ? Écrivez-moi.</p>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Nom"
                            required
                        />
                        <ValidationError
                            prefix="Name"
                            field="name"
                            errors={state.errors}
                        />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                        />
                        <ValidationError
                            prefix="Email"
                            field="email"
                            errors={state.errors}
                        />
                    </div>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Votre message"
                        rows={5}
                        required
                    />
                    <ValidationError
                        prefix="Message"
                        field="message"
                        errors={state.errors}
                    />
                    <button type="submit" disabled={state.submitting}>
                        {state.submitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
