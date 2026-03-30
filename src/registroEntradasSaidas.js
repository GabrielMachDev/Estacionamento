const { RegistroEstacionamento } = require('./registroEstacionamento');
const { TicketEstacionamento } = require('./ticketEstacionamento');

class RegistroEntradasSaidas {
  constructor(cadastroClientes) {
    this.cadastroClientes = cadastroClientes;
    this.registros = new Map();
  }

  autorizarEntrada(placa, cpfCnpj) {
    const cliente = this.cadastroClientes.buscarCliente(cpfCnpj);
    if (!cliente) return false;

    const registro = new RegistroEstacionamento(placa, cliente);
    this.registros.set(placa, registro);
    return true;
  }

  registrarSaida(placa) {
    const registro = this.registros.get(placa);
    if (!registro) return null;

    registro.registrarSaida();
    registro.valorCobrado = TicketEstacionamento.calcularTarifa(registro);
    return registro;
  }
}

module.exports = { RegistroEntradasSaidas };