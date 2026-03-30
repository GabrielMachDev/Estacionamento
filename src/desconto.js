class Desconto {
  aplicar(valor) {
    throw new Error("Método abstrato");
  }
}

class ClienteFrequente extends Desconto {
  aplicar(valor) {
    return valor * 0.8; // 20% desconto
  }
}

module.exports = { Desconto, ClienteFrequente };