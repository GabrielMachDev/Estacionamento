const { RegistroEstacionamento } = require('./registroEstacionamento');
const { TicketEstacionamento } = require('./ticketEstacionamento');
const { Estudante, Professor, Empresa, Avulso } = require('./cliente');

class RegistroEntradasSaidas {
  constructor(cadastroClientes) {
    this.cadastroClientes = cadastroClientes;
    this.registros = new Map();
    this.clientesBloqueados = new Set();
  }

  autorizarEntrada(placa, cpfCnpj) {
    const cliente = cpfCnpj ? this.cadastroClientes.buscarCliente(cpfCnpj) : null;

    // Estudante bloqueado por saldo negativo
    if (cliente instanceof Estudante && cliente.saldo < 0) {
      console.log(`Entrada negada: Estudante ${cliente.nome} com saldo negativo.`);
      return false;
    }

    // Empresa inadimplente
    if (cliente instanceof Empresa && cliente.debito > 0) {
      console.log(`Entrada negada: Empresa ${cliente.nome} inadimplente.`);
      return false;
    }

    // Avulso bloqueado
    if (!cliente && this.clientesBloqueados.has(placa)) {
      console.log(`Entrada negada: Veículo avulso ${placa} bloqueado.`);
      return false;
    }

    // Professor com veículo já estacionado
    if (cliente instanceof Professor) {
      const jaEstacionado = [...this.registros.values()]
        .some(r => r.cliente === cliente && !r.dataSaida);
      if (jaEstacionado) {
        console.log(`Entrada negada: Professor ${cliente.nome} já possui veículo estacionado.`);
        return false;
      }
    }

    // Entrada autorizada
    const registro = new RegistroEstacionamento(placa, cliente, new Date());
    this.registros.set(placa, registro);
    return true;
  }

  registrarSaida(placa) {
    const registro = this.registros.get(placa);
    if (!registro) return null;
    registro.registrarSaida(this.clientesBloqueados);
    return registro;
  }
}

module.exports = { RegistroEntradasSaidas };