// Modelo base para clientes do estacionamento.
// Define comportamento comum como cadastro de placas e normalização de entrada.
class Cliente {
  constructor(cpfCnpj, nome) {
    this.cpfCnpj = cpfCnpj;
    this.nome = nome;
    this.placas = new Set(); // evita duplicatas
  }

  // Adiciona uma placa ao cliente após normalizá-la.
  // Garante que placas repetidas não sejam cadastradas duas vezes.
  adicionarPlaca(placa) {
    const normalizada = Cliente.normalizarPlaca(placa);
    if (!normalizada) {
      console.log(`Placa inválida: ${placa}`);
      return false;
    }

    // Normalização garante comparação consistente em todos os locais do sistema.

    if (this.placas.has(normalizada)) {
      console.log(`Placa ${normalizada} já cadastrada para ${this.nome}.`);
      return false;
    }

    this.placas.add(normalizada);
    return true;
  }

  removerPlaca(placa) {
    const normalizada = Cliente.normalizarPlaca(placa);
    if (!normalizada) {
      console.log(`Placa inválida: ${placa}`);
      return false;
    }

    if (this.placas.has(normalizada)) {
      this.placas.delete(normalizada);
      console.log(`Placa ${normalizada} removida de ${this.nome}.`);
      return true;
    }

    console.log(`Placa ${normalizada} não encontrada para ${this.nome}.`);
    return false;
  }

  calcularCusto(registro) {
    throw new Error('Método calcularCusto deve ser implementado na subclasse.');
  }

  static normalizarPlaca(placa) {
    if (typeof placa !== 'string') return null;

    const valor = placa.trim().toUpperCase();
    return /^[A-Z0-9]{5,7}$/.test(valor) ? valor : null;
  }
}

class Avulso extends Cliente {
  constructor(placa) {
    super(null, 'Avulso');
    this.placas = new Set();
    const placaNormalizada = Cliente.normalizarPlaca(placa);
    if (!placaNormalizada) {
      throw new Error('Placa inválida para cliente avulso.');
    }

    this.placas.add(placaNormalizada);
  }

  calcularCusto(registro) {
    const horas = Math.ceil((registro.dataSaida - registro.dataEntrada) / (1000 * 60 * 60));
    let valor = 0;

    if (horas <= 6) {
      valor = horas * Avulso.VALOR_HORA;
    } else {
      valor = Avulso.VALOR_DIARIA;
    }

    if (registro.dataEntrada.toDateString() !== registro.dataSaida.toDateString()) {
      valor += Avulso.VALOR_DIARIA;
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
  constructor(cpf, nome, saldo = 0) {
    super(cpf, nome);
    this.saldo = Number.isFinite(saldo) ? saldo : 0;
  }

  calcularCusto(registro) {
    const mesmaData = registro.dataEntrada.toDateString() === registro.dataSaida.toDateString();
    const valor = mesmaData ? Estudante.VALOR_INGRESSO : Estudante.VALOR_INGRESSO * 2;
    this.saldo -= valor;
    return valor;
  }
}
Estudante.VALOR_INGRESSO = 20;

class Empresa extends Cliente {
  constructor(cnpj, nome, debito = 0) {
    super(cnpj, nome);
    this.debito = Number.isFinite(debito) ? debito : 0;
  }

  calcularCusto(registro) {
    const passouMeiaNoite = registro.dataEntrada.toDateString() !== registro.dataSaida.toDateString();
    const valor = Empresa.VALOR_DIARIA + (passouMeiaNoite ? Empresa.MULTA_DIARIA : 0);
    this.debito += valor;
    return valor;
  }
}
Empresa.VALOR_DIARIA = 50;
Empresa.MULTA_DIARIA = 100;

module.exports = { Cliente, Avulso, Professor, Estudante, Empresa };