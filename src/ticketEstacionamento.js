class TicketEstacionamento {
  calcularTarifa(registro) {
    return registro.valorCobrado;
  }

  aplicarDesconto(valor, desconto) {
    return desconto ? desconto.aplicar(valor) : valor;
  }
}

module.exports = { TicketEstacionamento };