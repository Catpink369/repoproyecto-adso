describe ('Crear un producto', () => {

    it('debe iniciar sesión con credenciales válidas y registrar u producto', () => {
        cy.visit('http://localhost:5173/')
        cy.get('.cerrar').click()

        cy.contains('Iniciar sesión').click()
        cy.url().should('include', '/login')

        // formulario login

        cy.get('#correo').type('valruiz@gmail.com')
        cy.get('#contrasena').type('vale123')
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/admin-code')

        cy.get('#codigo').type('12345')
        cy.get('button[type="submit"]').click()
        
        // panel admin
        cy.url().should('include', '/panel_control')

        //productos
        cy.contains('Productos').click()
        cy.url().should('include', '/productos')

        // resgistar producto
        cy.get('a[href="/registro_prod"]').click()

        cy.url().should('include', '/registro_prod')  
    })
})