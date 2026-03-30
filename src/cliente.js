class Cliente {
  constructor(cpfCnpj, nome) {
    this.cpfCnpj = cpfCnpj;
    this.nome = nome;
    this.placas = [];
  }

  adicionarPlaca(placa) {
    this.placas.push(placa);
  }
}

class Professor extends Cliente {
  constructor(cpf, nome) {
    super(cpf, nome);
  }
}

class Estudante extends Cliente {
  constructor(cpf, nome, saldo = 0) {
    super(cpf, nome);
    this.saldo = saldo;
  }

  static get CUSTO_FIXO() {
    return 5; // valor fixo por diária
  }
}

class Empresa extends Cliente {
  constructor(cnpj, nome, debito = 0) {
    super(cnpj, nome);
    this.debito = debito;
  }

  static get VALOR_DIARIA() {
    return 20;
  }

  static get MULTA() {
    return 50;
  }
}

class Avulso {
  constructor(placa) {
    this.placa = placa;
  }

  static get VALOR_HORA() {
    return 10;
  }

  static get VALOR_DIARIA() {
    return 60;
  }
}

module.exports = { Professor, Estudante, Empresa, Avulso };