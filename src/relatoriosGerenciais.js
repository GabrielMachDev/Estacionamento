class RelatoriosGerenciais {
  constructor(registros) {
    this.registros = registros;
  }

  gerarRelatorioArrecadacao() {
    let total = 0;
    for (const registro of this.registros.values()) {
      total += registro.valorCobrado;
    }
    return total;
  }

  listarClientesBloqueados() {
    // lógica futura
    return [];
  }

  top10Frequentes() {
    // lógica futura
    return [];
  }
}

module.exports = { RelatoriosGerenciais };