class RegistroEstacionamento {
  constructor(placa, cliente) {
    this.placa = placa;
    this.cliente = cliente;
    this.dataEntrada = new Date();
    this.dataSaida = null;
    this.valorCobrado = 0;
    this.descontoAplicado = "nenhum";
  }

  registrarSaida() {
    this.dataSaida = new Date();
  }
}

module.exports = { RegistroEstacionamento };