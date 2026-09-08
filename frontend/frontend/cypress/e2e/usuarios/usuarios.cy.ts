
// RF 1.1 a 1.8 - Gestion de Usuarios
describe('RF-001.1 Registrar usuario', () => {

  it('CP-001: debe permitir registrar un usuario Cliente nuevo exitosamente', () => {
    // Genera un correo y documento unicos en cada corrida de la prueba
    const idUnico = Date.now().toString().slice(-9)

    cy.visit('http://localhost:5173')
    cy.get('body').then(($b) => {
      if ($b.find('.cerrar').length) cy.get('.cerrar').click({ force: true })
    })
    cy.contains('Registrarse').click()
    cy.url().should('include', '/registro')

    cy.get('#id_usuario').type(idUnico)
    cy.get('#nom_1').type('John')
    cy.get('#ape_1').type('Cordoba')
    cy.get('#correo').type(`john.cordoba.${idUnico}@example.com`)
    cy.get('#telefono').type('3001234567')
    cy.get('#contrasena').type('abc123')

    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
  })

  it('CP-002: debe permitir registrar un usuario Trabajador desde el panel de Administrador', () => {
    const idUnico = Date.now().toString().slice(-9)

    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.contains('Registrar Usuario').click()

    cy.contains('label', 'Rol de Usuario')
      .parent()
      .find('select')
      .select('Trabajador')
    cy.contains('label', 'Tipo de documento')
      .parent()
      .find('select')
      .select('Cédula de ciudadanía')

    cy.contains('label', 'Número de documento')
      .parent()
      .find('input')
      .type(idUnico)
    cy.get('input[placeholder="Primer Nombre"]').type('Carlos')
    cy.get('input[placeholder="Segundo Nombre"]').type('Alberto')
    cy.get('input[placeholder="Primer Apellido"]').type('Mendoza')
    cy.get('input[placeholder="Segundo Apellido"]').type('Rios')

    cy.get('input[placeholder="correo@ejemplo.com"]').type(
      `carlos.trabajador.${idUnico}@example.com`
    )
    cy.get('input[placeholder="3001234567"]').type('3109876543')
    cy.get('input[placeholder="Mínimo 6 caracteres"]').type('Trabajador123')

    cy.contains('button', 'Registrar').click({ force: true })
    cy.url().should('include', '/usuarios')
  })

  it('CP-003: debe permitir registrar un usuario Administrador desde el panel autorizado', () => {
    const idUnico = Date.now().toString().slice(-9)
    const correoAdmin = `admin.nuevo.${idUnico}@example.com`

    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.contains('Registrar Usuario').click()

    cy.contains('label', 'Rol de Usuario')
      .parent()
      .find('select')
      .select('Administrador')
    cy.contains('label', 'Tipo de documento')
      .parent()
      .find('select')
      .select('Cédula de ciudadanía')

    cy.contains('label', 'Número de documento')
      .parent()
      .find('input')
      .type(idUnico)

    cy.get('input[placeholder="Primer Nombre"]').type('Ana')
    cy.get('input[placeholder="Segundo Nombre"]').type('Maria')
    cy.get('input[placeholder="Primer Apellido"]').type('Gomez')
    cy.get('input[placeholder="Segundo Apellido"]').type('Perez')

    cy.get('input[placeholder="correo@ejemplo.com"]').type(correoAdmin)
    cy.get('input[placeholder="3001234567"]').type('3201234567')
    cy.get('input[placeholder="Mínimo 6 caracteres"]').type('AdminPass123')

    cy.contains('button', 'Registrar').click({ force: true })
    cy.url().should('include', '/usuarios')
  })

  it('CP-004: no debe permitir registrar con un documento ya existente', () => {
    cy.visit('http://localhost:5173/registro')

    cy.get('#id_usuario').type('1023898051')
    cy.get('#nom_1').type('Prueba')
    cy.get('#ape_1').type('Duplicado')

    cy.get('#correo').type(`nuevo.intento.${Date.now()}@example.com`)
    cy.get('#telefono').type('3001234567')
    cy.get('#contrasena').type('abc123')

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/registro')
    cy.url().should('not.include', '/login')
  })

  it('CP-005: no debe permitir el registro si existen campos obligatorios vacios', () => {
    cy.visit('http://localhost:5173/registro')

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/registro')
    cy.url().should('not.include', '/login')
  })

  it('CP-006: no debe permitir el registro con una contraseña que no cumple las políticas de seguridad', () => {
    const idUnico = Date.now().toString().slice(-9)

    cy.visit('http://localhost:5173/registro')

    cy.get('#id_usuario').type(idUnico)
    cy.get('#nom_1').type('Usuario')
    cy.get('#ape_1').type('Debil')
    cy.get('#correo').type(`password.debil.${idUnico}@example.com`)
    cy.get('#telefono').type('3001234567')
    cy.get('#contrasena').type('123')

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/registro')
    cy.url().should('not.include', '/login')
  })

})

describe('RF-001.2 Visualizar usuarios', () => {

  it('CP-007: debe permitir visualizar la lista completa de usuarios registrados desde el rol Administrador', () => {
    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.url().should('include', '/usuarios')

    cy.get('table tbody tr').should('have.length.greaterThan', 0)
  })

  it('CP-008: debe permitir filtrar y buscar un usuario específico en la lista por su nombre o correo', () => {
    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.url().should('include', '/usuarios')

    cy.contains('Administradores').click()

    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .type('valruiz@gmail.com')

    cy.get('table tbody tr').should('have.length', 1)
    cy.contains('td', 'valruiz@gmail.com').should('be.visible')
  })

  it('CP-009: no debe permitir visualizar la lista de usuarios con un rol no autorizado (Cliente)', () => {
    cy.loginCliente()

    cy.visit('http://localhost:5173/usuarios')

    cy.url().should('not.include', '/usuarios')
    cy.url().should('include', '/cliente')
  })

})

describe('RF-001.3 Iniciar sesión', () => {

  it('CP-010: debe permitir iniciar sesión exitosamente con credenciales válidas de Cliente', () => {
    const clienteEmail = Cypress.env('clienteEmail')
    const clientePassword = Cypress.env('clientePassword')

    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(clienteEmail, { log: false })
    cy.get('#contrasena').type(clientePassword, { log: false })
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/cliente')
  })

  it('CP-011: debe permitir iniciar sesión exitosamente con credenciales válidas de Trabajador', () => {
    const trabajadorEmail = Cypress.env('trabajadorEmail')
    const trabajadorPassword = Cypress.env('trabajadorPassword')
    const trabajadorCode = Cypress.env('trabajadorCode')

    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(trabajadorEmail, { log: false })
    cy.get('#contrasena').type(trabajadorPassword, { log: false })
    cy.get('button[type="submit"]').click()

    cy.get('#codigo').type(trabajadorCode)
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/panel_control')
  })

  it('CP-012: debe redirigir al inicio del administrador', () => {
    const adminEmail = Cypress.env('adminEmail')
    const adminPassword = Cypress.env('adminPassword')
    const adminCode = Cypress.env('adminCode')

    cy.visit('http://localhost:5173')
    cy.get('.cerrar').click()

    cy.contains('Iniciar sesión').click()
    cy.url().should('include', '/login')

    cy.get('#correo').type(adminEmail, { log: false })
    cy.get('#contrasena').type(adminPassword, { log: false })
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/admin-code')
    cy.get('#codigo').type(adminCode)
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/panel_control')
  })

  it('CP-013: no debe permitir iniciar sesión con una contraseña incorrecta', () => {
    const clienteEmail = Cypress.env('clienteEmail')

    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(clienteEmail, { log: false })
    cy.get('#contrasena').type('ContrasenaErronea123!')

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/login')
  })

  it('CP-014: no debe permitir iniciar sesión con un correo que no está registrado', () => {
    cy.visit('http://localhost:5173/login')

    cy.get('#correo').type('usuario_inexistente@correo.com')
    cy.get('#contrasena').type('CualquierContrasena123!')

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/login')
  })

  it('CP-015: debe bloquear temporalmente la cuenta tras ingresar la contraseña incorrecta 5 veces seguidas', () => {

    const clienteBloqueoEmail = Cypress.env('clienteBloqueoEmail')
    const clienteBloqueoPassword = Cypress.env('clienteBloqueoPassword')

    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(clienteBloqueoEmail, { log: false })

    cy.get('#contrasena').clear().type('ContrasenaErronea123!')
    cy.get('button[type="submit"]').click()
    cy.get('#contrasena').clear().type('ContrasenaErronea123!')
    cy.get('button[type="submit"]').click()
    cy.get('#contrasena').clear().type('ContrasenaErronea123!')
    cy.get('button[type="submit"]').click()
    cy.get('#contrasena').clear().type('ContrasenaErronea123!')
    cy.get('button[type="submit"]').click()
    cy.get('#contrasena').clear().type('ContrasenaErronea123!')
    cy.get('button[type="submit"]').click()

    cy.get('#contrasena').clear().type(clienteBloqueoPassword, { log: false })
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')

    cy.wait(60000)
  })

  it('CP-016: debe validar la redirección correcta según el rol del usuario', () => {
    const clienteEmail = Cypress.env('clienteEmail')
    const clientePassword = Cypress.env('clientePassword')
    const trabajadorEmail = Cypress.env('trabajadorEmail')
    const trabajadorPassword = Cypress.env('trabajadorPassword')
    const trabajadorCode = Cypress.env('trabajadorCode')
    const adminEmail = Cypress.env('adminEmail')
    const adminPassword = Cypress.env('adminPassword')
    const adminCode = Cypress.env('adminCode')

    // Cliente -> /cliente
    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(clienteEmail, { log: false })
    cy.get('#contrasena').type(clientePassword, { log: false })
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/cliente')

    cy.clearCookies()
    cy.clearLocalStorage()

    // Trabajador -> /panel_control
    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(trabajadorEmail, { log: false })
    cy.get('#contrasena').type(trabajadorPassword, { log: false })
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/admin-code')
    cy.get('#codigo').should('be.visible').type(trabajadorCode)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/panel_control')

    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => win.sessionStorage.clear())

    // Administrador -> /panel_control
    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(adminEmail, { log: false })
    cy.get('#contrasena').type(adminPassword, { log: false })
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/admin-code')
    cy.get('#codigo').should('be.visible').type(adminCode)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/panel_control')
  })

})

describe('RF-001.4 Recuperar contraseña', () => {

  it('CP-017: debe permitir solicitar la recuperación de contraseña con un correo registrado (envío de código de verificación)', () => {
    const clienteEmail = Cypress.env('clienteEmail')

    cy.visit('http://localhost:5173/login')
    cy.contains('¿Olvidó su contraseña?').click()
    cy.url().should('include', '/olvide_c')

    cy.get('#correo').type(clienteEmail, { log: false })
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/olvide_c')
    cy.get('#codigo').should('be.visible')
  })

  it('CP-018: no debe permitir completar la recuperación con un correo que no existe en el sistema', () => {
    cy.visit('http://localhost:5173/login')
    cy.contains('¿Olvidó su contraseña?').click()
    cy.url().should('include', '/olvide_c')

    cy.get('#correo').type('usuario_inexistente@correo.com')
    cy.get('button[type="submit"]').click()

    cy.contains('No existe un usuario con ese correo').should('be.visible')
    cy.url().should('include', '/olvide_c')
    cy.get('#codigo').should('not.exist')
  })

  it('CP-019: no debe permitir restablecer la contraseña utilizando un código que ya expiró o es inválido', () => {
    const clienteEmail = Cypress.env('clienteEmail')

    cy.visit('http://localhost:5173/login')
    cy.contains('¿Olvidó su contraseña?').click()
    cy.url().should('include', '/olvide_c')

    cy.get('#correo').type(clienteEmail, { log: false })
    cy.get('button[type="submit"]').click()

    cy.get('#codigo').should('be.visible').type('000000')
    cy.get('input[type="password"]').eq(0).type('NuevaContrasena123!')
    cy.get('input[type="password"]').eq(1).type('NuevaContrasena123!')
    cy.contains('button', 'Restablecer Contraseña').click()

    cy.url().should('include', '/olvide_c')
  })

})

describe('RF-001.5 Editar Perfil', () => {

  it('CP-020: debe permitir actualizar la información del perfil del usuario', () => {
    cy.loginAdmin()

    cy.get('a[href="/perfil_admin"]').click()

    cy.url().should('include', '/perfil_admin')

    cy.contains('button', 'Cambiar datos').click()

    cy.get('#telefono').clear().type('3119998877')

    cy.contains('button', 'Guardar').click({ force: true })

    cy.url().should('include', '/perfil_admin')
  })

  it('CP-021: no debe permitir actualizar el correo del perfil por uno que ya está en uso por otro usuario', () => {
    const trabajadorEmail = Cypress.env('trabajadorEmail')

    cy.loginAdmin()

    cy.get('a[href="/perfil_admin"]').click()
    cy.url().should('include', '/perfil_admin')

    cy.contains('button', 'Cambiar datos').click()
    cy.contains('Correo').click()

    cy.get('#correo').clear().type(trabajadorEmail)

    cy.contains('button', 'Guardar').click({ force: true })

    cy.contains('Error de conexión. Intenta de nuevo.').should('be.visible')
  })

})

describe('RF-001.6 Cambiar Contraseña', () => {

  it('CP-022: debe permitir cambiar la contraseña desde la vista de perfil', () => {
    const adminPassword = Cypress.env('adminPassword')

    cy.loginAdmin()

    cy.get('a[href="/perfil_admin"]').click()
    cy.url().should('include', '/perfil_admin')

    cy.contains('button', 'Cambiar contraseña').click()

    cy.get('input[type="password"]').eq(0).type(adminPassword, { log: false })
    cy.get('input[type="password"]').eq(1).type('NuevaContrasena123!')
    cy.get('input[type="password"]').eq(2).type('NuevaContrasena123!')

    cy.contains('button', 'Cambiar Contraseña').click({ force: true })

    cy.contains('button', 'Cambiar contraseña').click()
    cy.get('input[type="password"]').eq(0).type('NuevaContrasena123!', { log: false })
    cy.get('input[type="password"]').eq(1).type(adminPassword)
    cy.get('input[type="password"]').eq(2).type(adminPassword)
    cy.contains('button', 'Cambiar Contraseña').click({ force: true })

    cy.url().should('include', '/perfil_admin')
  })

  it('CP-023: no debe permitir cambiar la contraseña si la contraseña actual es incorrecta', () => {
    cy.loginAdmin()

    cy.get('a[href="/perfil_admin"]').click()
    cy.url().should('include', '/perfil_admin')

    cy.contains('button', 'Cambiar contraseña').click()

    cy.get('input[type="password"]').eq(0).type('ContrasenaErronea123!')
    cy.get('input[type="password"]').eq(1).type('NuevaContrasena123!')
    cy.get('input[type="password"]').eq(2).type('NuevaContrasena123!')

    cy.contains('button', 'Cambiar Contraseña').click({ force: true })

    cy.url().should('include', '/cambiar_contrasena')
    cy.get('.alerta.error').should('be.visible')
  })

})

describe('RF-001.7 Editar Código y Rol', () => {

  it('CP-024: debe permitir modificar el rol de un usuario existente (de Trabajador a Administrador) desde la cuenta de Administrador', () => {
    const correoTrabajador = 'harry@gmail.com'

    cy.loginAdmin()

    cy.contains('Usuarios').click()

    // Busca al trabajador existente y cambia su rol a Administrador
    cy.contains('Trabajadores').click()
    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .type(correoTrabajador)
    cy.contains('td', correoTrabajador)
      .parents('tr')
      .within(() => {
        cy.contains('button', 'Editar').click()
      })

    cy.contains('label', 'Rol')
      .parent()
      .find('select')
      .select('Administrador')
    cy.contains('button', 'Guardar Cambios').click({ force: true })
    cy.contains('Usuario actualizado exitosamente.').should('be.visible')

    // Verifica el cambio buscándolo ahora en la pestaña Administradores
    cy.contains('Administradores').click()
    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .clear()
      .type(correoTrabajador)
    cy.contains('td', correoTrabajador).should('be.visible')
  })

  it('CP-025: no debe permitir cambiar el rol de un usuario desde una cuenta sin permisos (Cliente/Trabajador)', () => {
    cy.loginCliente()
    cy.visit('http://localhost:5173/usuarios')
    cy.url().should('include', '/cliente')
    cy.url().should('not.include', '/usuarios')

    cy.loginTrabajador()
    cy.visit('http://localhost:5173/usuarios', { failOnStatusCode: false })
    cy.url().then((url) => {
      if (url.includes('/usuarios')) {
        cy.get('body').then(($body) => {
          if ($body.text().includes('Editar')) {
            cy.contains('button', 'Editar').first().click({ force: true })
            cy.get('body').should('not.contain', 'Guardar Cambios')
          }
        })
      } else {
        cy.url().should('match', /panel_control|cliente|login/)
      }
    })
  })

})

describe('RF-001.8 Desactivar Usuario', () => {

  it('CP-026: debe permitir desactivar la cuenta de un usuario (bloqueo lógico) desde el panel de Administrador', () => {
    const clienteEmail = Cypress.env('clienteEmail')

    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.url().should('include', '/usuarios')
    cy.contains('Clientes').click({ force: true })

    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .clear()
      .type(clienteEmail)

    cy.contains('td', clienteEmail)
      .parents('tr')
      .within(() => {

        cy.root().then(($row) => {
          if ($row.find('button:contains("Activar")').length > 0) {
            cy.contains('button', 'Activar').click({ force: true })
          }
        })
      })

    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .clear()
      .type(clienteEmail)
    cy.contains('td', clienteEmail)
      .parents('tr')
      .within(() => {
    cy.contains('button', 'Activar', { timeout: 10000 }).should('be.visible')
    })
  })

  it('CP-027: no debe permitir iniciar sesión con una cuenta que ha sido previamente desactivada por el Administrador', () => {
    const clienteEmail = Cypress.env('clienteEmail')
    const clientePassword = Cypress.env('clientePassword')

    cy.visit('http://localhost:5173/login')
    cy.get('#correo').type(clienteEmail, { log: false })
    cy.get('#contrasena').type(clientePassword, { log: false })
    cy.get('button[type="submit"]').click()

    cy.contains('Tu cuenta se encuentra desactivada. Contacta al administrador.')
      .should('be.visible')
    cy.url().should('include', '/login')
  })

  it('CP-028: debe permitir reactivar la cuenta de un usuario previamente desactivado desde el rol Administrador', () => {
    const clienteEmail = Cypress.env('clienteEmail')

    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.url().should('include', '/usuarios')
    cy.contains('Clientes').click({ force: true })

    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .clear()
      .type(clienteEmail)

    cy.contains('td', clienteEmail)
      .parents('tr')
      .within(() => {
        cy.contains('button', 'Activar').click()
      })
  })

  it('CP-029: no debe permitir desactivar a un usuario Administrador principal (restricción de seguridad del sistema)', () => {
    const adminEmail = Cypress.env('adminEmail')

    cy.loginAdmin()

    cy.contains('Usuarios').click()
    cy.contains('Administradores').click()
    cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
      .type(adminEmail)

    cy.contains('td', adminEmail)
      .parents('tr')
      .within(() => {
        cy.contains('button', 'Desactivar').should('not.exist')
        cy.contains('Protegido').should('be.visible')
      })
  })

})