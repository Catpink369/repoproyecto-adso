    //Footer (pie de pagina para todas las vistas menos admin)
    import React from 'react';
    //estilos
    import "./css/footer.css";    //imagenes
    import tiktok from "../assets/logo_tiktok.png";
    import instagram from "../assets/logo_instagram.png";
    
    const Footer = () => {
    return (
        <footer>
        <p>Síguenos en nuestras redes sociales</p>
        <div className="redes"> 
            <a href="https://www.instagram.com/_guramaa_" target="_blank" className="redes-icon-link">
                <img src={instagram} alt="icono instagram" />
                <span>Instagram</span>
            </a> 
            <a href="https://www.tiktok.com/@_guramaa_" target="_blank" className="redes-icon-link">
                <img src={tiktok} alt="icono tiktok" />
                <span>TikTok</span>
            </a>
        </div>
        <p>© Gurama 2025. Todos los derechos reservados.</p> 
        </footer>
    );
    };

    export default Footer;