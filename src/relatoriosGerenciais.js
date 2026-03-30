class RelatoriosGerenciais {
  constructor(registros, clientesBloqueados) {
    this.registros = registros;
    this.clientesBloqueados = clientesBloqueados; // agora recebe do movimento
  }

  gerarRelatorioArrecadacao() {
    let total = 0;
    for (const r of this.registros.values()) {
      total += r.valorCobrado ?? 0; // proteção extra
    }
    return total;
  }

  listarClientesBloqueados() {
    return [...this.clientesBloqueados];
  }

  top10Frequentes() {
    const frequencia = new Map();
    for (const r of this.registros.values()) {
      const id = r.cliente ? r.cliente.cpfCnpj : r.placa;
      frequencia.set(id, (frequencia.get(id) || 0) + 1);
    }
    return [...frequencia.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);
  }
}

module.exports = { RelatoriosGerenciais };