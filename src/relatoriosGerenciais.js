class RelatoriosGerenciais {
  constructor(registros, clientesBloqueados) {
    this.registros = registros;              // Map de placa → RegistroEstacionamento
    this.clientesBloqueados = clientesBloqueados; // Set de placas bloqueadas
  }

  // Valor total arrecadado (todos os registros)
  gerarRelatorioArrecadacao() {
    let total = 0;
    for (const r of this.registros.values()) {
      total += r.valorCobrado ?? 0;
    }
    return total;
  }

  // Valor total arrecadado por período
  arrecadacaoPorPeriodo(inicio, fim) {
    let total = 0;
    for (const r of this.registros.values()) {
      if (r.dataSaida && r.dataSaida >= inicio && r.dataSaida <= fim) {
        total += r.valorCobrado ?? 0;
      }
    }
    return total;
  }

  // Valor arrecadado por categoria
  arrecadacaoPorCategoria() {
    const categorias = { Professor: 0, Estudante: 0, Empresa: 0, Avulso: 0 };
    for (const r of this.registros.values()) {
      const tipo = r.cliente ? r.cliente.constructor.name : "Avulso";
      categorias[tipo] += r.valorCobrado ?? 0;
    }
    return categorias;
  }

  // Valor arrecadado por período e categoria
  arrecadacaoPorPeriodoECategoria(inicio, fim) {
    const categorias = { Professor: 0, Estudante: 0, Empresa: 0, Avulso: 0 };
    for (const r of this.registros.values()) {
      if (r.dataSaida && r.dataSaida >= inicio && r.dataSaida <= fim) {
        const tipo = r.cliente ? r.cliente.constructor.name : "Avulso";
        categorias[tipo] += r.valorCobrado ?? 0;
      }
    }
    return categorias;
  }

  // Situação de um cliente cadastrado (saldo/débito + veículos estacionados)
  situacaoCliente(cpfCnpj) {
    const registrosCliente = [...this.registros.values()].filter(r => r.cliente && r.cliente.cpfCnpj === cpfCnpj);
    if (registrosCliente.length === 0) return "Cliente não encontrado ou sem registros.";

    const cliente = registrosCliente[0].cliente;
    const veiculosEstacionados = registrosCliente
      .filter(r => !r.dataSaida)
      .map(r => r.placa);

    return {
      nome: cliente.nome,
      tipo: cliente.constructor.name,
      saldo: cliente.saldo ?? null,
      debito: cliente.debito ?? null,
      bloqueado: [...this.clientesBloqueados].some(p => cliente.placas.includes(p)),
      veiculosEstacionados
    };
  }

  // Registros de estacionamento de cliente cadastrado por período (todos os veículos vinculados)
  registrosClientePorPeriodo(cpfCnpj, inicio, fim) {
    return [...this.registros.values()].filter(r =>
      r.cliente && r.cliente.cpfCnpj === cpfCnpj &&
      r.dataEntrada >= inicio && r.dataEntrada <= fim
    );
  }

  // Registros de estacionamento de cliente não cadastrado (avulso) por período
  registrosAvulsosPorPeriodo(inicio, fim) {
    return [...this.registros.values()].filter(r =>
      !r.cliente && r.dataEntrada >= inicio && r.dataEntrada <= fim
    );
  }

  // Relação de clientes bloqueados (saldo negativo, inadimplência, avulso que não pagou)
  listarClientesBloqueados() {
    return [...this.clientesBloqueados];
  }

  // Top 10 clientes mais frequentes do ano
  top10Frequentes(ano = new Date().getFullYear()) {
    const frequencia = new Map();
    for (const r of this.registros.values()) {
      if (r.dataEntrada.getFullYear() === ano) {
        const id = r.cliente ? r.cliente.cpfCnpj : r.placa;
        frequencia.set(id, (frequencia.get(id) || 0) + 1);
      }
    }
    return [...frequencia.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, qtd]) => ({ id, qtd }));
  }
}

module.exports = { RelatoriosGerenciais };