const fs = require('fs');
const { Professor, Estudante, Empresa } = require('./cliente');
const { RegistroEstacionamento } = require('./registroEstacionamento');

class PersistenciaCSV {
  constructor(clientesFile, registrosFile) {
    this.clientesFile = clientesFile;
    this.registrosFile = registrosFile;
  }

  carregarClientes() {
    if (typeof this.clientesFile !== 'string' || !fs.existsSync(this.clientesFile)) return [];

    const linhas = fs.readFileSync(this.clientesFile, 'utf-8')
      .split('\n')
      .filter(l => l.trim() !== '');

    const clientes = [];

    for (const linha of linhas) {
      const [cpfCnpj, nome, campo3, tipo, placasStr] = linha.split(',');

      // Validação: se faltar dados, ignora a linha
      if (!cpfCnpj || !nome || !tipo) {
        console.log(`Linha inválida no CSV ignorada: ${linha}`);
        continue;
      }

      let cliente;
      if (tipo === 'Professor') {
        cliente = new Professor(cpfCnpj, nome);
      } else if (tipo === 'Estudante') {
        cliente = new Estudante(cpfCnpj, nome, parseFloat(campo3) || 0);
      } else if (tipo === 'Empresa') {
        cliente = new Empresa(cpfCnpj, nome, parseFloat(campo3) || 0);
      } else {
        console.log(`Tipo desconhecido no CSV: ${tipo}`);
        continue;
      }

      if (placasStr && placasStr.trim() !== '') {
        placasStr.split(',').forEach(p => cliente.adicionarPlaca(p));
      }

      clientes.push(cliente);
    }

    return clientes;
  }

  salvarClientes(clientes) {
    const linhas = [];

    for (const c of clientes) {
      if (!c || !c.cpfCnpj) continue; // Proteção extra

      let campo3 = '';
      const tipo = c.constructor.name;

      if (tipo === 'Professor') {
        campo3 = 'Professor';
      } else if (tipo === 'Estudante') {
        campo3 = c.saldo ?? 0;
      } else if (tipo === 'Empresa') {
        campo3 = c.debito ?? 0;
      }

      // Corrigido: transformar Set em array antes de join
      const placas = c.placas ? [...c.placas].join(',') : '';
      linhas.push(`${c.cpfCnpj},${c.nome},${campo3},${tipo},${placas}`);
    }

    fs.writeFileSync(this.clientesFile, linhas.join('\n'), 'utf-8');
  }

  carregarRegistros(clientes) {
    if (typeof this.registrosFile !== 'string' || !fs.existsSync(this.registrosFile)) return [];

    const linhas = fs.readFileSync(this.registrosFile, 'utf-8')
      .split('\n')
      .filter(l => l.trim() !== '');

    const registros = [];

    for (const linha of linhas) {
      const [placa, cpfCnpj, dataEntrada, dataSaida, valorCobrado] = linha.split(',');
      if (!placa || !dataEntrada) {
        console.log(`Linha inválida no CSV de registros ignorada: ${linha}`);
        continue;
      }

      const cliente = clientes.find(c => c.cpfCnpj === cpfCnpj) || null;

      const registro = new RegistroEstacionamento(
        placa,
        cliente,
        new Date(dataEntrada),
        dataSaida ? new Date(dataSaida) : null
      );

      registro.valorCobrado = parseFloat(valorCobrado) || 0;
      registros.push(registro);
    }

    return registros;
  }

  salvarRegistros(registros) {
    const linhas = [];

    for (const r of registros.values()) {
      if (!r || !r.placa) continue; // Proteção extra

      const cpfCnpj = r.cliente ? r.cliente.cpfCnpj : '';
      const dataEntrada = r.dataEntrada.toISOString();
      const dataSaida = r.dataSaida ? r.dataSaida.toISOString() : '';
      const valorCobrado = r.valorCobrado ?? 0;

      linhas.push(`${r.placa},${cpfCnpj},${dataEntrada},${dataSaida},${valorCobrado}`);
    }

    fs.writeFileSync(this.registrosFile, linhas.join('\n'), 'utf-8');
  }
}

module.exports = { PersistenciaCSV };