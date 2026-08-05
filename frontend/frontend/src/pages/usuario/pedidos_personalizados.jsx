import React from 'react';
import { Link } from 'react-router-dom';
import "../../components/css/styles.css";
import p_sabana from "../../assets/sabana.webp";
import p_cubrelechos from "../../assets/cubrelecho.webp";
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';

const PedidosPersonalizados = () => {
    return (
        <div className="app-container">
            <Header />

            <main className="pedidos-personalizados-main">
                
                <div className="pedidos-personalizados-header">
                    <h2>Pedidos personalizados</h2>
                    <p>Diseña tu pedido a la medida, elige materiales y tallas</p>
                </div>

                <div className="ped-grid">

                    {/* Sábanas */}
                    <div className="ped-tarjeta">
                        <img src={p_sabana} alt="Sábanas" className="ped-tarjeta-imagen" />
                        <div className="ped-tarjeta-body">
                            <h3 className="ped-tarjeta-nombre">Sábanas</h3>
                            <p className="ped-tarjeta-desc">
                                Personaliza tu sábana eligiendo el tamaño, tipo de tela, diseño 
                                y si deseas fundas de almohada incluidas.
                            </p>
                            <Link to="/p_sabanas" className="ped-tarjeta-btn">
                                Personalizar sábana
                            </Link>
                        </div>
                    </div>

                    {/* Cubrelechos */}
                    <div className="ped-tarjeta">
                        <img src={p_cubrelechos} alt="Cubrelechos" className="ped-tarjeta-imagen" />
                        <div className="ped-tarjeta-body">
                            <h3 className="ped-tarjeta-nombre">Cubrelechos</h3>
                            <p className="ped-tarjeta-desc">
                                Diseña tu cubrelecho escogiendo el tamaño de cama, 
                                la tela para cada lado y los estampados que prefieras.
                            </p>
                            <Link to="/p_cubrelecho" className="ped-tarjeta-btn">
                                Personalizar cubrelecho
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PedidosPersonalizados;