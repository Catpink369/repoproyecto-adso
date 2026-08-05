//maneja el estado del carrito en memoria

import React, { createContext, useState, useContext, useCallback } from 'react';

const CartContext = createContext();

// Hook para usar el carrito
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

// Proveedor del Contexto
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Función para añadir/incrementar un producto desde el BACKEND
    const addToCart = useCallback((product) => {
        console.log('Agregando al carrito:', product);
        
        setCartItems(prevItems => {
            // Usar id_producto del backend como identificador único
            const itemId = Number(product.id_producto || product.id); 
            const existingItemIndex = prevItems.findIndex(item => item.id === itemId);

            if (existingItemIndex > -1) {
                // Si existe, incrementa la cantidad
                const updatedItems = prevItems.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
                console.log('Carrito actualizado:', updatedItems);
                return updatedItems;
            } else {
                // Si no existe, añádelo con cantidad 1
                // Mapear los campos del backend a la estructura del carrito
                const nuevoProducto = {
                    id: itemId,
                    name: product.nom_producto || product.name,
                    price: Number(product.precio_unitario || product.price),
                    image: product.ruta_imagen || product.image, //  IMAGEN INCLUIDA
                    category: product.nombre_c || product.category || 'N/A',
                    stock_actual: product.stock_actual || 0, // Añadir stock disponible
                    cantidad: 1,
                };
                console.log('Producto añadido:', nuevoProducto);
                const updatedItems = [...prevItems, nuevoProducto];
                console.log('Carrito completo:', updatedItems);
                return updatedItems;
            }
        });
    }, []);
    
    // Función para cambiar la cantidad con validación de stock
    const updateQuantity = useCallback((id, newQuantity) => {
        const cantidad = Number(newQuantity);
        if (cantidad < 1) return; 

        setCartItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                // Validar que no exceda el stock disponible
                const cantidadFinal = item.stock_actual 
                    ? Math.min(cantidad, item.stock_actual)
                    : cantidad;
                return { ...item, cantidad: cantidadFinal };
            }
            return item;
        }));
    }, []);

    // Función para eliminar
    const removeItem = useCallback((id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    // Función para limpiar el carrito después de una compra
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Función para obtener el total del carrito
    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => 
            total + (item.price * item.cantidad), 0
        );
    }, [cartItems]);

    // Función para obtener la cantidad total de productos
    const getTotalItems = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.cantidad, 0);
    }, [cartItems]);

    const contextValue = {
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartTotal,
        getTotalItems,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};