const { RegistroEstacionamento } = require('./registroEstacionamento');
const { Avulso, Professor, Estudante, Empresa } = require('./cliente');

class RegistroEntradasSaidas {
  constructor(cadastroClientes) {
    this.cadastroClientes = cadastroClientes;
    this.registros = new Map(); // placa → RegistroEstacionamento
    this.clientesBloqueados = new Set(); // placas bloqueadas
  }

  // 🔹 Autorizar entrada
  autorizarEntrada(placa, cpfCnpj = null) {
    const cliente = cpfCnpj ? this.cadastroClientes.buscarCliente(cpfCnpj) : null;

    // Regras de bloqueio
    if (cliente instanceof Estudante && cliente.saldo < 0) {
      console.log("🚫 Estudante bloqueado por saldo negativo.");
      return false;
    }
    if (cliente instanceof Empresa && cliente.debito > 0) {
      console.log("🚫 Empresa inadimplente, entrada negada.");
      return false;
    }
    if (this.clientesBloqueados.has(placa)) {
      console.log("🚫 Cliente avulso bloqueado por não pagamento.");
      return false;
    }

    // Regras específicas
    if (cliente instanceof Professor) {
      if (cliente.placas.length >= 2 && !cliente.placas.includes(placa)) {
        console.log("🚫 Professores só podem cadastrar até 2 veículos.");
        return false;
      }
      // apenas 1 simultâneo
      const ocupados = [...this.registros.values()].filter(r => r.cliente === cliente && !r.dataSaida);
      if (ocupados.length >= 1) {
        console.log("🚫 Professor já possui veículo estacionado.");
        return false;
      }
    }

    if (cliente instanceof Estudante) {
      if (cliente.placas.length >= 1 && !cliente.placas.includes(placa)) {
        console.log("🚫 Estudantes só podem cadastrar 1 veículo.");
        return false;
      }
    }

    // Criar registro
    const registro = new RegistroEstacionamento(placa, cliente, new Date());
    this.registros.set(placa, registro);
    return true;
  }

  // 🔹 Registrar saída
  registrarSaida(placa) {
    const registro = this.registros.get(placa);
    if (!registro || registro.dataSaida) return null;

    registro.dataSaida = new Date();

    // Polimorfismo: cálculo de custo depende do tipo de cliente
    let valor = 0;
    if (registro.cliente) {
      valor = registro.cliente.calcularCusto(registro);
    } else {
      // Avulso
      const avulso = new Avulso(placa);
      valor = avulso.calcularCusto(registro);

      // Se não pagar, bloqueia
      if (valor > 0 && !registro.pagamentoEfetuado) {
        this.clientesBloqueados.add(placa);
      }
    }

    registro.valorCobrado = valor;
    registro.valorDevido = valor;
    registro.valorPago = valor; // simplificação: assume pagamento
    registro.valorDesconto = registro.desconto === "ClienteFrequente" ? valor * 0.2 : 0;

    return registro;
  }
}

module.exports = { RegistroEntradasSaidas };