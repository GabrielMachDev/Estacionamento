class TicketEstacionamento {
  static calcularTarifa(registro) {
    return registro.cliente.calcularCusto(registro);
  }

  static aplicarDesconto(valor, desconto) {
    return desconto ? desconto.aplicar(valor) : valor;
  }
}

module.exports = { TicketEstacionamento };