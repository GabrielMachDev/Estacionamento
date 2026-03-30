class Cliente {
  constructor(cpfCnpj, nome) {
    this.cpfCnpj = cpfCnpj;
    this.nome = nome;
    this.placas = new Set();
  }

  adicionarPlaca(placa) {
    this.placas.add(placa);
  }

  calcularCusto(registro) {
    throw new Error("Método abstrato deve ser implementado nas subclasses");
  }
}

class Professor extends Cliente {
  calcularCusto() {
    return 0; // gratuito
  }
}

class Estudante extends Cliente {
  constructor(cpf, nome, saldo = 0) {
    super(cpf, nome);
    this.saldo = saldo;
  }

  calcularCusto() {
    const custo = Estudante.CUSTO_FIXO_POR_INGRESSO;
    this.saldo -= custo;
    return custo;
  }
}
Estudante.CUSTO_FIXO_POR_INGRESSO = 20;

class Empresa extends Cliente {
  constructor(cnpj, nome, debito = 0) {
    super(cnpj, nome);
    this.debito = debito;
  }

  calcularCusto() {
    const custo = Empresa.CUSTO_DIARIA;
    this.debito += custo;
    return custo;
  }
}
Empresa.CUSTO_DIARIA = 70;

class Avulso extends Cliente {
  calcularCusto(registro) {
    const horas = (registro.dataSaida - registro.dataEntrada) / (1000 * 60 * 60);
    if (horas <= 6) {
      return horas * Avulso.VALOR_HORA;
    } else {
      return Avulso.VALOR_DIARIA;
    }
  }
}
Avulso.VALOR_HORA = 5;
Avulso.VALOR_DIARIA = 30;

module.exports = { Cliente, Professor, Estudante, Empresa, Avulso };