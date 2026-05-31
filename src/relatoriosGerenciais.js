// Geração de relatórios gerenciais a partir do histórico de registros.
// Foi adicionado tratamento para datas inválidas e categorias definidas.
class RelatoriosGerenciais {
  constructor(registros, clientesBloqueados) {
    this.registros = Array.isArray(registros) ? registros : [];
    this.clientesBloqueados = clientesBloqueados;
  }

  // Calcula a arrecadação total de todos os registros disponíveis.
  gerarRelatorioArrecadacao() {
    return this.registros.reduce((total, r) => total + (r.valorCobrado ?? 0), 0);
  }

  // Calcula a arrecadação de registros com saída entre duas datas.
  arrecadacaoPorPeriodo(inicio, fim) {
    if (!(inicio instanceof Date) || Number.isNaN(inicio) || !(fim instanceof Date) || Number.isNaN(fim)) {
      return 0;
    }

    return this.registros.reduce((total, r) => {
      if (r.dataSaida && r.dataSaida >= inicio && r.dataSaida <= fim) {
        return total + (r.valorCobrado ?? 0);
      }
      return total;
    }, 0);
  }

  // Agrupa a arrecadação por categoria de cliente (Professor, Estudante, Empresa, Avulso).
  arrecadacaoPorCategoria() {
    const categorias = { Professor: 0, Estudante: 0, Empresa: 0, Avulso: 0 };
    this.registros.forEach((r) => {
      const tipo = r.cliente ? r.cliente.constructor.name : 'Avulso';
      categorias[tipo] += r.valorCobrado ?? 0;
    });
    return categorias;
  }

  // Calcula arrecadação segmentada por categoria dentro de um período.
  arrecadacaoPorPeriodoECategoria(inicio, fim) {
    const categorias = { Professor: 0, Estudante: 0, Empresa: 0, Avulso: 0 };
    if (!(inicio instanceof Date) || Number.isNaN(inicio) || !(fim instanceof Date) || Number.isNaN(fim)) {
      return categorias;
    }

    this.registros.forEach((r) => {
      if (r.dataSaida && r.dataSaida >= inicio && r.dataSaida <= fim) {
        const tipo = r.cliente ? r.cliente.constructor.name : 'Avulso';
        categorias[tipo] += r.valorCobrado ?? 0;
      }
    });

    return categorias;
  }

  // Retorna um resumo da situação de um cliente específico, incluindo veículos estacionados e bloqueios.
  situacaoCliente(cpfCnpj) {
    const registrosCliente = this.registros.filter((r) => r.cliente && r.cliente.cpfCnpj === cpfCnpj);
    if (registrosCliente.length === 0) {
      return 'Cliente não encontrado ou sem registros.';
    }

    const cliente = registrosCliente[0].cliente;
    const veiculosEstacionados = registrosCliente
      .filter((r) => !r.dataSaida)
      .map((r) => r.placa);

    return {
      nome: cliente.nome,
      tipo: cliente.constructor.name,
      saldo: cliente.saldo ?? null,
      debito: cliente.debito ?? null,
      bloqueado: [...this.clientesBloqueados].some((placa) => cliente.placas.has(placa)),
      veiculosEstacionados
    };
  }

  // Retorna o histórico de registros de um cliente em um intervalo de datas.
  registrosClientePorPeriodo(cpfCnpj, inicio, fim) {
    if (!(inicio instanceof Date) || Number.isNaN(inicio) || !(fim instanceof Date) || Number.isNaN(fim)) {
      return [];
    }

    return this.registros.filter((r) =>
      r.cliente &&
      r.cliente.cpfCnpj === cpfCnpj &&
      r.dataEntrada >= inicio &&
      r.dataEntrada <= fim
    );
  }

  // Retorna apenas os registros avulsos no intervalo de datas informado.
  registrosAvulsosPorPeriodo(inicio, fim) {
    if (!(inicio instanceof Date) || Number.isNaN(inicio) || !(fim instanceof Date) || Number.isNaN(fim)) {
      return [];
    }

    return this.registros.filter((r) =>
      !r.cliente &&
      r.dataEntrada >= inicio &&
      r.dataEntrada <= fim
    );
  }

  // Lista as placas / clientes atualmente bloqueados por não pagamento ou débito.
  listarClientesBloqueados() {
    return [...this.clientesBloqueados];
  }

  // Retorna os 10 clientes ou avulsos mais frequentes no ano informado.
  top10Frequentes(ano = new Date().getFullYear()) {
    const frequencia = new Map();

    this.registros.forEach((r) => {
      if (!r.dataEntrada || r.dataEntrada.getFullYear() !== ano) {
        return;
      }

      const id = r.cliente ? r.cliente.cpfCnpj : `Avulso:${r.placa}`;
      frequencia.set(id, (frequencia.get(id) || 0) + 1);
    });

    return [...frequencia.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, qtd]) => ({ id, qtd }));
  }
}

module.exports = { RelatoriosGerenciais };