class Cliente {
  constructor(cpfCnpj, nome) {
    this.cpfCnpj = cpfCnpj;
    this.nome = nome;
    this.placas = new Set(); // evita duplicatas
  }

  adicionarPlaca(placa) {
    if (!this.placas.has(placa)) {
      this.placas.add(placa);
    } else {
      console.log(`Placa ${placa} já cadastrada para ${this.nome}.`);
    }
  }

  removerPlaca(placa) {
    if (this.placas.has(placa)) {
      this.placas.delete(placa);
      console.log(`Placa ${placa} removida de ${this.nome}.`);
    } else {
      console.log(`Placa ${placa} não encontrada para ${this.nome}.`);
    }
  }

  calcularCusto(registro) {
    return 0; // sobrescrito nas subclasses
  }
}

class Avulso extends Cliente {
  constructor(placa) {
    super(null, "Avulso");
    this.placas = new Set([placa]);
  }

  calcularCusto(registro) {
    const horas = Math.ceil((registro.dataSaida - registro.dataEntrada) / (1000 * 60 * 60));
    let valor = 0;

    if (horas <= 6) {
      valor = horas * Avulso.VALOR_HORA;
    } else {
      valor = Avulso.VALOR_DIARIA;
    }

    if (registro.dataEntrada.getDate() !== registro.dataSaida.getDate()) {
      valor += Avulso.VALOR_DIARIA;
    }

    if (registro.desconto === "ClienteFrequente") {
      valor *= 0.8;
    }

    return valor;
  }
}
Avulso.VALOR_HORA = 5;
Avulso.VALOR_DIARIA = 30;

class Professor extends Cliente {
  calcularCusto() {
    return 0; // entrada gratuita
  }
}

class Estudante extends Cliente {
  constructor(cpf, nome, saldo) {
    super(cpf, nome);
    this.saldo = saldo;
  }

  calcularCusto(registro) {
    let valor = Estudante.VALOR_INGRESSO;

    if (registro.dataEntrada.getDate() !== registro.dataSaida.getDate()) {
      valor += Estudante.VALOR_INGRESSO;
    }

    this.saldo -= valor;
    return valor;
  }
}
Estudante.VALOR_INGRESSO = 20;

class Empresa extends Cliente {
  constructor(cnpj, nome, debito) {
    super(cnpj, nome);
    this.debito = debito;
  }

  calcularCusto(registro) {
    let valor = Empresa.VALOR_DIARIA;

    if (registro.dataEntrada.getDate() !== registro.dataSaida.getDate()) {
      valor += Empresa.MULTA_DIARIA;
    }

    this.debito += valor;
    return valor;
  }
}
Empresa.VALOR_DIARIA = 50;
Empresa.MULTA_DIARIA = 100;

module.exports = { Cliente, Avulso, Professor, Estudante, Empresa };