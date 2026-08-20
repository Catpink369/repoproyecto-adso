// RF 1.1 a 1.8 - Geston de Usuarios
describe('RF-001.1 Registrar usuario', () => {

  it('CP-001: debe permitir registrar un usuario Cliente nuevo exitosamente', () => {
    // Genera un correo y documento unicos en cada corrida de la prueba
    const idUnico = Date.now().toString().slice(-9)

    cy.visit('http://localhost:5173')
    cy.get('.cerrar').click()
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

    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

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
  })

  it('CP-003: debe permitir registrar un usuario Administrador desde el panel autorizado', () => {
    const idUnico = Date.now().toString().slice(-9)
    const correoAdmin = `admin.nuevo.${idUnico}@example.com`

    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

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
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      cy.contains('Usuarios').click()
      cy.url().should('include', '/usuarios')

      cy.get('table tbody tr').should('have.length.greaterThan', 0)
    })
  })

  it('CP-008: debe permitir filtrar y buscar un usuario específico en la lista por su nombre o correo', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      cy.contains('Usuarios').click()
      cy.url().should('include', '/usuarios')

      cy.contains('Administradores').click()

      cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
        .type('valruiz@gmail.com')

      cy.get('table tbody tr').should('have.length', 1)
      cy.contains('td', 'valruiz@gmail.com').should('be.visible')
    })
  })

  it('CP-009: no debe permitir visualizar la lista de usuarios con un rol no autorizado (Cliente)', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail', 'clientePassword']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('#contrasena').type(env.clientePassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.url().should('not.include', '/login')

      // Intenta acceder directamente a la gestión de usuarios
      cy.visit('http://localhost:5173/usuarios')

      cy.url().should('not.include', '/usuarios')
      cy.url().should('include', '/cliente')
    })
  })

})

describe('RF-001.3 Iniciar sesión', () => {

  it('CP-010: debe permitir iniciar sesión exitosamente con credenciales válidas de Cliente', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail', 'clientePassword']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('#contrasena').type(env.clientePassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/cliente')
    })
  })

  it('CP-011: debe permitir iniciar sesión exitosamente con credenciales válidas de Trabajador', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['trabajadorEmail', 'trabajadorPassword', 'trabajadorCode']).then((env) => {
      cy.get('#correo').type(env.trabajadorEmail, { log: false })
      cy.get('#contrasena').type(env.trabajadorPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.trabajadorCode)
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/panel_control')
    })
  })

  it('CP-012: debe redirigir al inicio del administrador', () => {
    cy.visit('http://localhost:5173')
    cy.get('.cerrar').click()

    cy.contains('Iniciar sesión').click()
    cy.url().should('include', '/login')

    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/admin-code')
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/panel_control')
    })
  })

  it('CP-013: no debe permitir iniciar sesión con una contraseña incorrecta', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('#contrasena').type('ContrasenaErronea123!')

      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/login')
    })
  })

  it('CP-014: no debe permitir iniciar sesión con un correo que no está registrado', () => {
    cy.visit('http://localhost:5173/login')

    cy.get('#correo').type('usuario_inexistente@correo.com')
    cy.get('#contrasena').type('CualquierContrasena123!')

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/login')
  })

  it('CP-015: debe bloquear temporalmente la cuenta tras ingresar la contraseña incorrecta 5 veces seguidas', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })

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

      // Confirma que, mientras está bloqueada, no deja iniciar sesión ni con la contraseña correcta
      cy.env(['clientePassword']).then((envPass) => {
        cy.get('#contrasena').clear().type(envPass.clientePassword, { log: false })
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/login')
      })

      // Espera a que se levante el bloqueo para no afectar otras pruebas que usan esta cuenta
      cy.wait(60000)

    })
  })

  it('CP-016: debe validar la redirección correcta según el rol del usuario', () => {
    // Cliente -> /cliente
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail', 'clientePassword']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('#contrasena').type(env.clientePassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/cliente')
    })

    // Trabajador -> /panel_control
    cy.visit('http://localhost:5173/login')
    cy.env(['trabajadorEmail', 'trabajadorPassword', 'trabajadorCode']).then((env) => {
      cy.get('#correo').type(env.trabajadorEmail, { log: false })
      cy.get('#contrasena').type(env.trabajadorPassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.get('#codigo').type(env.trabajadorCode)
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/panel_control')
    })

    // Administrador -> /panel_control
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/panel_control')
    })
  })

})

describe('RF-001.4 Recuperar contraseña', () => {

  it('CP-017: debe permitir solicitar la recuperación de contraseña con un correo registrado (envío de código de verificación)', () => {
    cy.visit('http://localhost:5173/login')
    cy.contains('¿Olvidó su contraseña?').click()
    cy.url().should('include', '/olvide_c')
 
    cy.env(['clienteEmail']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('button[type="submit"]').click()
 
      // Al enviarse el código, el mismo formulario muestra el campo para ingresarlo
      cy.url().should('include', '/olvide_c')
      cy.get('#codigo').should('be.visible')
    })
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
    cy.visit('http://localhost:5173/login')
    cy.contains('¿Olvidó su contraseña?').click()
    cy.url().should('include', '/olvide_c')
 
    cy.env(['clienteEmail']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('button[type="submit"]').click()
 
      cy.get('#codigo').should('be.visible').type('000000')
      cy.get('input[type="password"]').eq(0).type('NuevaContrasena123!')
      cy.get('input[type="password"]').eq(1).type('NuevaContrasena123!')
      cy.contains('button', 'Restablecer Contraseña').click()
 
      cy.url().should('include', '/olvide_c')
    })
  })

})

describe('RF-001.5 Editar Perfil', () => {

  it('CP-020: debe permitir actualizar la información del perfil del usuario', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      cy.get('a[href="/perfil_admin"]').click()

      cy.url().should('include', '/perfil_admin')

      cy.contains('button', 'Cambiar datos').click()

      cy.get('#telefono').clear().type('3119998877')

      cy.contains('button', 'Guardar').click({ force: true })

      cy.url().should('include', '/perfil_admin')
    })
  })

  it('CP-021: no debe permitir actualizar el correo del perfil por uno que ya está en uso por otro usuario', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode', 'trabajadorEmail']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()
 
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()
 
      cy.get('a[href="/perfil_admin"]').click()
      cy.url().should('include', '/perfil_admin')
 
      cy.contains('button', 'Cambiar datos').click()
      cy.contains('Correo').click()
 
      cy.get('#correo').clear().type(env.trabajadorEmail)
 
      cy.contains('button', 'Guardar').click({ force: true })
 
      cy.contains('Error de conexión. Intenta de nuevo.').should('be.visible')
    })
  })

})

describe('RF-001.6 Cambiar Contraseña', () => {

  it('CP-022: debe permitir cambiar la contraseña desde la vista de perfil', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {

      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      cy.get('a[href="/perfil_admin"]').click()
      cy.url().should('include', '/perfil_admin')

      cy.contains('button', 'Cambiar contraseña').click()

      cy.get('input[type="password"]').eq(0).type(env.adminPassword, { log: false })
      cy.get('input[type="password"]').eq(1).type('NuevaContrasena123!')
      cy.get('input[type="password"]').eq(2).type('NuevaContrasena123!')

      cy.contains('button', 'Cambiar Contraseña').click({ force: true })

      cy.contains('button', 'Cambiar contraseña').click()
      cy.get('input[type="password"]').eq(0).type('NuevaContrasena123!', { log: false })
      cy.get('input[type="password"]').eq(1).type(env.adminPassword)
      cy.get('input[type="password"]').eq(2).type(env.adminPassword)
      cy.contains('button', 'Cambiar Contraseña').click({ force: true })

      cy.url().should('include', '/perfil_admin')
    })
  })

  it('CP-023: no debe permitir cambiar la contraseña si la contraseña actual es incorrecta', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {

      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

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

})

describe('RF-001.7 Editar Código y Rol', () => {

  it('CP-024: debe permitir modificar el rol de un usuario existente (de Trabajador a Administrador) desde la cuenta de Administrador', () => {
    const correoTrabajador = 'harry@gmail.com'
 
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()
 
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()
 
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
  })
  

  it('CP-025: no debe permitir cambiar el rol de un usuario desde una cuenta sin permisos (Cliente/Trabajador)', () => {
    // Trabajador: la sección "Usuarios" no debe aparecer en su panel
    cy.visit('http://localhost:5173/login')
    cy.env(['trabajadorEmail', 'trabajadorPassword', 'trabajadorCode']).then((env) => {
      cy.get('#correo').type(env.trabajadorEmail, { log: false })
      cy.get('#contrasena').type(env.trabajadorPassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.get('#codigo').type(env.trabajadorCode)
      cy.get('button[type="submit"]').click()

      cy.contains('Usuarios').should('not.exist')

      // Al intentar acceder directamente, se mantiene en el panel de control o redirige a él
      cy.visit('http://localhost:5173/usuarios')
      cy.url().should('include', '/panel_control')
      cy.url().should('not.include', '/usuarios')
    })

    // Cliente: tampoco tiene acceso al apartado de usuarios
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail', 'clientePassword']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('#contrasena').type(env.clientePassword, { log: false })
      cy.get('button[type="submit"]').click()

      cy.contains('Usuarios').should('not.exist')

      // El cliente es redirigido a la vista /cliente al intentar forzar la URL
      cy.visit('http://localhost:5173/usuarios')
      cy.url().should('include', '/cliente')
      cy.url().should('not.include', '/usuarios')
    })
  })

})

describe('RF-001.8 Desactivar Usuario', () => {

  it('CP-026: debe permitir desactivar la cuenta de un usuario (bloqueo lógico) desde el panel de Administrador', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode', 'clienteEmail']).then((env) => {
      // 1. Iniciar sesión como Administrador
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      // 2. Ir al apartado de Usuarios y pestaña Clientes
      cy.contains('Usuarios').click()
      cy.url().should('include', '/usuarios')
      cy.contains('Clientes').click({ force: true })

      // 3. Buscar al cliente
      cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
        .clear()
        .type(env.clienteEmail)

      // 4. Desactivar y confirmar en el modal
      cy.contains('td', env.clienteEmail)
        .parents('tr')
        .within(() => {
          cy.contains('button', 'Desactivar').click()
        })



    })
  })
  it('CP-027: no debe permitir iniciar sesión con una cuenta que ha sido previamente desactivada por el Administrador', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['clienteEmail', 'clientePassword']).then((env) => {
      cy.get('#correo').type(env.clienteEmail, { log: false })
      cy.get('#contrasena').type(env.clientePassword, { log: false })
      cy.get('button[type="submit"]').click()

      // Valida la alerta o mensaje de cuenta inactiva y previene la redirección
      cy.contains('Tu cuenta se encuentra desactivada. Contacta al administrador.')
        .should('be.visible')
      cy.url().should('include', '/login')
    })
  })
  it('CP-028: debe permitir reactivar la cuenta de un usuario previamente desactivado desde el rol Administrador', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode', 'clienteEmail']).then((env) => {
      // 1. Iniciar sesión como Administrador
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      // 2. Ir a Usuarios > Clientes
      cy.contains('Usuarios').click()
      cy.url().should('include', '/usuarios')
      cy.contains('Clientes').click({ force: true })

      // 3. Buscar al cliente inactivo
      cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
        .clear()
        .type(env.clienteEmail)

      // 4. Activar y confirmar
      cy.contains('td', env.clienteEmail)
        .parents('tr')
        .within(() => {
          cy.contains('button', 'Activar').click()
        })
    })
  })

  it('CP-029: no debe permitir desactivar a un usuario Administrador principal (restricción de seguridad del sistema)', () => {
    cy.visit('http://localhost:5173/login')
    cy.env(['adminEmail', 'adminPassword', 'adminCode']).then((env) => {
      cy.get('#correo').type(env.adminEmail, { log: false })
      cy.get('#contrasena').type(env.adminPassword, { log: false })
      cy.get('button[type="submit"]').click()
      cy.get('#codigo').type(env.adminCode)
      cy.get('button[type="submit"]').click()

      cy.contains('Usuarios').click()
      cy.contains('Administradores').click()
      cy.get('input[placeholder="Buscar por nombre, correo, teléfono o ID..."]')
        .type(env.adminEmail)

      cy.contains('td', env.adminEmail)
        .parents('tr')
        .within(() => {
          cy.contains('button', 'Desactivar').should('not.exist')
          cy.contains('Protegido').should('be.visible')
        })
    })
  })

})