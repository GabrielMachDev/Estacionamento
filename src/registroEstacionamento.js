const { Professor, Estudante, Empresa, Avulso } = require('./cliente');

class RegistroEstacionamento {
  constructor(placa, cliente, dataEntrada) {
    this.placa = placa;
    this.cliente = cliente;
    this.dataEntrada = dataEntrada;
    this.dataSaida = null;
    this.valorCobrado = 0; // valor inicial sempre numérico
    this.descontoAplicado = "nenhum";
  }

  registrarSaida(clientesBloqueados) {
    this.dataSaida = new Date();
    const horas = Math.ceil((this.dataSaida - this.dataEntrada) / (1000 * 60 * 60));

    if (this.cliente instanceof Professor) {
      this.valorCobrado = 0;
    } else if (this.cliente instanceof Estudante) {
      const mesmaData = this.dataEntrada.toDateString() === this.dataSaida.toDateString();
      this.valorCobrado = mesmaData ? Estudante.CUSTO_FIXO : Estudante.CUSTO_FIXO * 2;
      this.cliente.saldo -= this.valorCobrado;
    } else if (this.cliente instanceof Empresa) {
      const passouMeiaNoite = this.dataEntrada.getDate() !== this.dataSaida.getDate();
      this.valorCobrado = Empresa.VALOR_DIARIA;
      if (passouMeiaNoite) this.valorCobrado += Empresa.MULTA;
      this.cliente.debito += this.valorCobrado;
    } else {
      // Avulso
      if (horas <= 6) {
        this.valorCobrado = horas * Avulso.VALOR_HORA;
      } else {
        this.valorCobrado = Avulso.VALOR_DIARIA;
      }
      const passouMeiaNoite = this.dataEntrada.getDate() !== this.dataSaida.getDate();
      if (passouMeiaNoite) this.valorCobrado += Avulso.VALOR_DIARIA;

      // Desconto ClienteFrequente
      if (this.clienteFrequente()) {
        this.valorCobrado *= 0.8;
        this.descontoAplicado = "ClienteFrequente";
      }

      // Se não pagar → bloqueio
      if (this.valorCobrado > 0) {
        clientesBloqueados.add(this.placa);
      }
    }

    // Garantia extra: nunca deixar valorCobrado indefinido
    if (typeof this.valorCobrado !== "number") {
      this.valorCobrado = 0;
    }
  }

  clienteFrequente() {
    // Implementar lógica real com histórico de registros
    return false;
  }
}

module.exports = { RegistroEstacionamento };