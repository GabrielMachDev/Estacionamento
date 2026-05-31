const { RegistroEstacionamento } = require('./registroEstacionamento');
const { Avulso, Professor, Estudante, Empresa } = require('./cliente');
const { ClienteFrequente } = require('./desconto');

// Controle de entradas e saídas do estacionamento.
// Agora mantém histórico completo de registros e um mapa separado de entradas ativas.
class RegistroEntradasSaidas {
  constructor(cadastroClientes) {
    this.cadastroClientes = cadastroClientes;
    this.registros = [];
    this.registrosAtivos = new Map();
    this.clientesBloqueados = new Set();
  }

  // Reconstrói o estado atual a partir do histórico de registros carregado do CSV.
  // Mantém o conjunto de veículos ativos e clientes bloqueados em memória.
  restaurarRegistros(registros) {
    this.registros = Array.isArray(registros) ? registros : [];
    this.registrosAtivos.clear();
    this.clientesBloqueados.clear();

    // Restaura estado de registros abertos e clientes/placas bloqueadas ao iniciar o app.

    for (const registro of this.registros) {
      if (!registro || !registro.placa) {
        continue;
      }

      if (!registro.dataSaida) {
        this.registrosAtivos.set(registro.placa, registro);
      }

      if (!registro.cliente && registro.valorPago < registro.valorDevido) {
        this.clientesBloqueados.add(registro.placa);
      }
    }
  }

  // Valida e autoriza a entrada de um veículo.
  // Verifica placas, bloqueios, estado de cliente e cria o registro de entrada.
  autorizarEntrada(placa, cpfCnpj = null) {
    const placaNormalizada = RegistroEntradasSaidas.normalizarPlaca(placa);

    // Entrada recebe validações de placa, cliente e regras específicas de cada tipo.
    if (!placaNormalizada) {
      console.log('Placa inválida.');
      return false;
    }

    if (this.clientesBloqueados.has(placaNormalizada)) {
      console.log('Placa bloqueada por não pagamento anterior.');
      return false;
    }

    if (this.registrosAtivos.has(placaNormalizada)) {
      console.log('Veículo já está dentro do estacionamento.');
      return false;
    }

    const cliente = cpfCnpj ? this.cadastroClientes.buscarCliente(cpfCnpj.trim()) : null;
    if (cpfCnpj && !cliente) {
      console.log('Cliente não encontrado.');
      return false;
    }

    if (cliente instanceof Estudante && cliente.saldo < 0) {
      console.log('Estudante bloqueado por saldo negativo.');
      return false;
    }

    if (cliente instanceof Empresa && cliente.debito > 0) {
      console.log('Empresa inadimplente, entrada negada.');
      return false;
    }

    if (cliente instanceof Professor) {
      if (!cliente.placas.has(placaNormalizada)) {
        if (cliente.placas.size >= 2) {
          console.log('Professores só podem cadastrar até 2 veículos.');
          return false;
        }
        cliente.adicionarPlaca(placaNormalizada);
      }

      const ocupados = [...this.registrosAtivos.values()].filter((r) => r.cliente === cliente);
      if (ocupados.length >= 1) {
        console.log('Professor já possui veículo estacionado.');
        return false;
      }
    }

    if (cliente instanceof Estudante) {
      if (!cliente.placas.has(placaNormalizada)) {
        if (cliente.placas.size >= 1) {
          console.log('Estudantes só podem cadastrar 1 veículo.');
          return false;
        }
        cliente.adicionarPlaca(placaNormalizada);
      }
    }

    const registro = new RegistroEstacionamento(placaNormalizada, cliente, new Date());
    this.registros.push(registro);
    this.registrosAtivos.set(placaNormalizada, registro);
    return true;
  }

  // Registra a saída de um veículo, calculando o valor devido e removendo-o do mapa de ativos.
  registrarSaida(placa) {
    const placaNormalizada = RegistroEntradasSaidas.normalizarPlaca(placa);
    if (!placaNormalizada) {
      return null;
    }

    const registro = this.registrosAtivos.get(placaNormalizada);
    if (!registro) {
      return null;
    }

    registro.dataSaida = new Date();

    let valor = 0;
    if (registro.cliente) {
      valor = registro.cliente.calcularCusto(registro);
    } else {
      const avulso = new Avulso(placaNormalizada);
      valor = avulso.calcularCusto(registro);

      if (this.ehClienteFrequente(placaNormalizada)) {
        registro.descontoAplicado = 'ClienteFrequente';
        valor = new ClienteFrequente().aplicar(valor);
      }

      if (valor > 0 && !registro.pagamentoEfetuado) {
        this.clientesBloqueados.add(placaNormalizada);
      }
    }

    registro.valorCobrado = valor;
    registro.valorDevido = valor;
    registro.valorPago = valor;
    registro.pagamentoEfetuado = valor === 0 || valor === registro.valorPago;

    this.registrosAtivos.delete(placaNormalizada);
    return registro;
  }

  // Verifica se uma placa tem histórico de pelo menos 3 entradas no ano atual.
  // Usado para aplicar desconto ao avulso frequente.
  ehClienteFrequente(placa) {
    const anoAtual = new Date().getFullYear();
    const historico = this.registros.filter((r) =>
      r.placa === placa && r.dataSaida && r.dataSaida.getFullYear() === anoAtual
    );
    return historico.length >= 3;
  }

  // Normaliza placas para comparação e armazenamento consistente.
  static normalizarPlaca(placa) {
    if (!placa || typeof placa !== 'string') {
      return null;
    }

    return placa.trim().toUpperCase();
  }
}

module.exports = { RegistroEntradasSaidas };