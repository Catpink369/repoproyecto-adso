describe ('agregar pedido al carrito', () => {

    it('Agregar producto desde el catalogo', () => {
        cy.visit('http://localhost:5173/')
        cy.get('.cerrar').click()

        cy.contains('Iniciar sesión').click()
        cy.url().should('include', '/login')

        // formulario login

        cy.get('#correo').type('catpink369@gmail.com')
        cy.get('#contrasena').type('123456')
        cy.get('button[type="submit"]').click()
        
        // cliente
        cy.url().should('include', '/cliente')
        cy.get('.cerrar').click()

        //catalogo
        cy.contains('Catálogo').click()
        cy.url().should('include', '/catalogo_c')

        //detalle producto
        cy.contains('Virgencitas').click()
        cy.url().should('include', '/producto/1')

        cy.contains('Agregar al carrito').click()
        
        //ir al carrito
        cy.get('img[alt="icono carrito"]').click()
        cy.url().should('include', '/carrito')
    })
})