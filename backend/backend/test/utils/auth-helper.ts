// Para obtener tocken de cliente y admin/trab
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { crearUsuarioFake, CATALOGOS, crearAdminFake } from './faker-factories';

export async function loginComoCliente(app: INestApplication) {
    const { usuario, contrasenaFake } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);

    const respuesta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: usuario.correo, contrasena: contrasenaFake });

    if (respuesta.status !== 201 && respuesta.status !== 200) {
        throw new Error(
        `Login falló en el helper de pruebas: ${respuesta.status} - ${JSON.stringify(respuesta.body)}`,
        );
    }

    return {
        usuario,
        token: respuesta.body.token as string,
    };
}
    export async function loginConCodigo(app: INestApplication) {
        const { usuario, codigofake } = await crearAdminFake(CATALOGOS.ROL_ADMIN);

        const respuesta = await request(app.getHttpServer())
            .post('/auth/verify-code')
            .send({ id_usuario: usuario.id_usuario, codigo: codigofake });

        if (respuesta.status !== 201 && respuesta.status !== 200) {
            throw new Error(
            `Login falló en el helper de pruebas: ${respuesta.status} - ${JSON.stringify(respuesta.body)}`,
            );
        }

        return {
            usuario,
            token: respuesta.body.token as string,
        };
    }

    // Trabajador se autentica igual que Admin: se crea con código (crearAdminFake)
    // y se verifica por /auth/verify-code.
    export async function loginComoTrabajador(app: INestApplication) {
        const { usuario, codigofake } = await crearAdminFake(CATALOGOS.ROL_TRABAJADOR);

        const respuesta = await request(app.getHttpServer())
            .post('/auth/verify-code')
            .send({ id_usuario: usuario.id_usuario, codigo: codigofake });

        if (respuesta.status !== 201 && respuesta.status !== 200) {
            throw new Error(
            `Login falló en el helper de pruebas: ${respuesta.status} - ${JSON.stringify(respuesta.body)}`,
            );
        }

        return {
            usuario,
            token: respuesta.body.token as string,
        };
    }