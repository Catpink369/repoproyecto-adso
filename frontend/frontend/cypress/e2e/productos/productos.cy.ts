// RF2.1 a 2.5 - gestion de productos
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

describe('Módulo de Gestión de Productos y Catálogo', () => {
  describe('RF-002.1 Crear producto', () => {

    it('CP-001: Crear un nuevo producto completando todos los campos obligatorios de forma exitosa (Administrador)', () => {
      const idUnico = Date.now().toString().slice(-6)
      const nombreProducto = `Producto Prueba ${idUnico}`

      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.contains('Registrar nuevo Producto').click()

        cy.get('input[placeholder="Nombre completo del producto"]').type(nombreProducto)
        cy.get('input[placeholder="Precio al que se venderá"]').type('25000')
        cy.get('input[placeholder="Cantidad inicial en inventario"]').type('50')

        cy.contains('label', 'Categoría').parent().find('select').select(1)
        cy.contains('label', 'Clasificación').parent().find('select').select(1)

        cy.get('input[type="file"]').selectFile('cypress/fixtures/gato.jpg', { force: true })
        cy.get('textarea[placeholder="Detalles completos del producto..."]').type('Descripción de prueba')

        cy.contains('button', 'Registrar Nuevo Producto').click({ force: true })
        cy.contains(nombreProducto).should('be.visible')
      })
    })

    // CP-002: NO APLICA A NIVEL DE UI
    // El ID es autogenerado e incremental por la base de datos.

    it('CP-003: Intento de crear un producto dejando campos obligatorios vacíos', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.contains('Registrar nuevo Producto').click()

        cy.contains('button', 'Registrar Nuevo Producto').click({ force: true })

        cy.get('input[placeholder="Nombre completo del producto"]:invalid').should('exist')
        cy.get('input[placeholder="Precio al que se venderá"]:invalid').should('exist')
        cy.get('input[placeholder="Cantidad inicial en inventario"]:invalid').should('exist')
      })
    })

    it('CP-004: Intento de crear un producto con valores numéricos inválidos', () => {
      const idUnico = Date.now().toString().slice(-6)

      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.contains('Registrar nuevo Producto').click()

        cy.get('input[placeholder="Nombre completo del producto"]').type(`Producto Invalido ${idUnico}`)
        cy.get('input[placeholder="Precio al que se venderá"]').clear().type('-5000')
        cy.get('input[placeholder="Cantidad inicial en inventario"]').clear().type('-10')

        cy.contains('label', 'Categoría').parent().find('select').select(1)
        cy.contains('label', 'Clasificación').parent().find('select').select(1)
        cy.get('textarea[placeholder="Detalles completos del producto..."]').type('Prueba con valores negativos')

        cy.contains('button', 'Registrar Nuevo Producto').click({ force: true })

        cy.get('input[placeholder="Precio al que se venderá"]:invalid').should('exist')
        cy.get('input[placeholder="Cantidad inicial en inventario"]:invalid').should('exist')
      })
    })

    it('CP-006: Intento de subir un archivo inválido (ej. PDF) en el campo de imagen', () => {
      cy.writeFile('cypress/fixtures/documento.pdf', 'Contenido de prueba PDF')

      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.contains('Registrar nuevo Producto').click()

        cy.get('input[type="file"]').selectFile('cypress/fixtures/documento.pdf', { force: true })
        cy.get('img.preview-imagen').should('not.exist')
      })
    })

    it('CP-007: Intentar crear un producto desde una cuenta sin permisos autorizados (Cliente)', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').should('not.exist')
        cy.contains('Registrar nuevo Producto').should('not.exist')

        cy.visit('http://localhost:5173/registro_prod', { failOnStatusCode: false })
        cy.url().should('not.include', '/registro_prod')
      })
    })
  })

  describe('RF-002.2 Visualizar catálogo', () => {

    it('CP-008: Visualizar la lista completa de productos disponibles en el catálogo', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')
        cy.contains('Virgencitas').should('be.visible')
      })

      cy.clearCookies()
      cy.clearLocalStorage()

      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').should('be.visible').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.get('table tbody tr').should('have.length.greaterThan', 0)
      })
    })

    it('CP-009: Verificar la paginación o scroll infinito del catálogo', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')

        cy.scrollTo('bottom')
        cy.get('img').should('have.length.greaterThan', 4)
      })
    })
  })

  describe('RF-002.3 Buscar y filtrar productos', () => {

    it('CP-010: Buscar un producto específico utilizando la barra de búsqueda por nombre', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')

        cy.get('input[placeholder="Buscar productos..."]').type('Perritos Snoopy para pareja{enter}')
        cy.contains('Perritos Snoopy para pareja').should('be.visible')
      })
    })

    it('CP-011: Filtrar productos por categoría', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')

        cy.contains('button', 'Amigurumis').click()
        cy.contains('Virgencitas').should('be.visible')
      })
    })

    it('CP-012: Filtrar productos por clasificación', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')

        cy.contains('button', 'En_oferta').click()
        cy.contains('Virgencitas').should('be.visible')
      })
    })

    it('CP-013: Aplicar múltiples filtros simultáneamente', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')

        cy.contains('button', 'Amigurumis').click()
        cy.contains('button', 'En_oferta').click()

        cy.contains('Virgencitas').should('be.visible')
      })
    })

    it('CP-014: Realizar una búsqueda con caracteres especiales o texto vacío', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.contains('Catálogo').click()
        cy.contains('Catálogo de productos').should('be.visible')

        cy.get('input[placeholder="Buscar productos..."]').clear().type('!@#$%^&*()_+=~{enter}')
        cy.contains(/No se encontraron|Sin resultados/i).should('be.visible')
      })
    })
  })

  describe('RF-002.4 Editar producto', () => {

    it('CP-015: Actualizar exitosamente los datos básicos de un producto desde un rol autorizado', () => {
      const timestamp = Date.now().toString().slice(-4)
      const nuevoNombre = `Producto Editado ${timestamp}`
      const nuevoPrecio = '35000'
      const nuevaDescripcion = `Descripción actualizada por prueba automatizada ${timestamp}`

      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').should('be.visible').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.url().should('include', '/productos')

        cy.get('table tbody tr').first().within(() => {
          cy.get('button, a').contains(/editar|modificar/i).click({ force: true })
        })

        cy.contains('label, div, p, span', 'Nombre del Producto').parent().find('input').clear().type(nuevoNombre)
        cy.contains('label, div, p, span', 'Precio Unitario').parent().find('input').clear().type(nuevoPrecio)
        cy.contains('label, div, p, span', 'Descripción').parent().find('textarea').clear().type(nuevaDescripcion)

        cy.contains('button', 'Guardar Cambios').click()
        cy.contains(nuevoNombre).should('be.visible')
      })
    })

    it('CP-016: Intento de modificar precio o stock mínimo con caracteres no numéricos o negativos', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').should('be.visible').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.get('table tbody tr').first().within(() => {
          cy.get('button, a').contains(/editar|modificar/i).click({ force: true })
        })

        cy.contains('label, div, p, span', 'Precio Unitario').parent().find('input').clear().type('-5000')
        cy.contains('label, div, p, span', 'Stock Mínimo').parent().find('input').clear().type('-10')

        cy.contains('button', 'Guardar Cambios').click()
        cy.contains('button', 'Guardar Cambios').should('be.visible')
        cy.url().should('include', '/editar')
      })
    })

    it('CP-017: Intentar modificar los datos de un producto desde un rol no autorizado (Cliente)', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.get('.cerrar').click()

        cy.visit('http://localhost:5173/editar_producto/1', { failOnStatusCode: false })
        cy.url().should('not.include', '/editar_producto')
      })
    })
  })

  describe('RF-002.5 Eliminar producto', () => {

    it('CP-018: Desactivar producto exitosamente', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').should('be.visible').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.url().should('include', '/productos')

        cy.on('window:confirm', (str) => {
          expect(str).to.include('¿Estás seguro de que deseas eliminar este producto?')
          return true
        })

        cy.get('table tbody tr').first().within(() => {
          cy.get('button, a').contains(/eliminar|desactivar|borrar/i).click({ force: true })
        })

        cy.on('window:alert', (str) => {
          expect(str).to.exist
        })
      })
    })

    it('CP-019: Intentar eliminar un producto con pedidos asociados', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').should('be.visible').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.url().should('include', '/productos')

        cy.on('window:confirm', () => true)

        cy.get('table tbody tr').first().within(() => {
          cy.get('button, a').contains(/eliminar|desactivar|borrar/i).click({ force: true })
        })

        cy.on('window:alert', (str) => {
          expect(str).to.match(/error|no se puede|asociado|pedidos/i)
        })
      })
    })

    it('CP-020: Usuario cancela la operación de eliminación', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
        cy.get('#correo').type(env.adminEmail, { log: false })
        cy.get('#contrasena').type(env.adminPassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.get('#codigo').should('be.visible').type(env.adminCode)
        cy.get('button[type="submit"]').click()

        cy.contains('Productos').click()
        cy.url().should('include', '/productos')

        cy.on('window:confirm', (str) => {
          expect(str).to.include('¿Estás seguro de que deseas eliminar este producto?')
          return false
        })

        cy.get('table tbody tr').first().within(() => {
          cy.get('button, a').contains(/eliminar|desactivar|borrar/i).click({ force: true })
        })

        cy.get('table tbody tr').should('have.length.at.least', 1)
        cy.url().should('include', '/productos')
      })
    })

    it('CP-021: Intentar eliminar o desactivar un producto desde un usuario sin permisos (Cliente)', () => {
      cy.visit('http://localhost:5173/login')
      cy.env(['clienteEmail', 'clientePassword']).then((env) => {
        cy.get('#correo').type(env.clienteEmail, { log: false })
        cy.get('#contrasena').type(env.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()

        cy.request({
          method: 'DELETE',
          url: 'http://localhost:3000/productos/1',
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403])
        })
      })
    })
  })
})