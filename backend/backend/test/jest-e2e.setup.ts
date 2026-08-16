// Fix de serialización de BigInt - necesario porque los tests e2e arman la app

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};