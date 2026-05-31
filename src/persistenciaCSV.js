const fs = require('fs');
const { Professor, Estudante, Empresa } = require('./cliente');
const { RegistroEstacionamento } = require('./registroEstacionamento');

// Persistência CSV com suporte a cabeçalho, campos escapados e reconstrução de estado.
// Foi ajustada para permitir leitura e escrita mais robusta, e preservar valores adicionais
// como desconto aplicado, valor pago e estado de pagamento.
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  if (/[\n\",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  // Parser CSV simples para suportar valores entre aspas e colunas com vírgula.

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else if (char === '"') {
      inQuotes = true;
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

class PersistenciaCSV {
  constructor(clientesFile, registrosFile) {
    this.clientesFile = clientesFile;
    this.registrosFile = registrosFile;
  }

  // Lê os clientes do CSV, criando objetos de cliente adequados.
  // Suporta cabeçalho opcional e ignora linhas incompletas.
  carregarClientes() {
    if (typeof this.clientesFile !== 'string' || !fs.existsSync(this.clientesFile)) {
      return [];
    }

    // Ignora resumo vazio e cabeçalho se existir. Também valida linhas mal formadas.

    const linhas = fs.readFileSync(this.clientesFile, 'utf-8')
      .split(/\r?\n/)
      .filter((linha) => linha.trim() !== '');

    const clientes = [];

    for (let index = 0; index < linhas.length; index += 1) {
      const linha = linhas[index];
      const campos = parseCsvLine(linha);

      if (index === 0 && campos[0].toLowerCase().includes('cpf')) {
        continue;
      }

      const [cpfCnpj, nome, campo3, tipo, placasStr] = campos;

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
        placasStr.split(',').forEach((placa) => cliente.adicionarPlaca(placa.trim()));
      }

      clientes.push(cliente);
    }

    return clientes;
  }

  // Salva os clientes em CSV, preservando tipo, saldo/débito e placas.
  salvarClientes(clientes) {
    const linhas = ['cpfCnpj,nome,campo3,tipo,placas'];

    for (const c of clientes) {
      if (!c || !c.cpfCnpj) continue;

      let campo3 = '';
      const tipo = c.constructor.name;

      if (tipo === 'Estudante') {
        campo3 = c.saldo ?? 0;
      } else if (tipo === 'Empresa') {
        campo3 = c.debito ?? 0;
      }

      const placas = c.placas ? [...c.placas].join(',') : '';
      linhas.push([
        escapeCsvValue(c.cpfCnpj),
        escapeCsvValue(c.nome),
        escapeCsvValue(campo3),
        escapeCsvValue(tipo),
        escapeCsvValue(placas)
      ].join(','));
    }

    fs.writeFileSync(this.clientesFile, linhas.join('\n'), 'utf-8');
  }

  // Lê os registros de estacionamento do CSV e reconstrói o histórico completo.
  carregarRegistros(clientes) {
    if (typeof this.registrosFile !== 'string' || !fs.existsSync(this.registrosFile)) {
      return [];
    }

    const linhas = fs.readFileSync(this.registrosFile, 'utf-8')
      .split(/\r?\n/)
      .filter((linha) => linha.trim() !== '');

    const registros = [];

    for (let index = 0; index < linhas.length; index += 1) {
      const linha = linhas[index];
      const campos = parseCsvLine(linha);

      if (index === 0 && campos[0].toLowerCase() === 'placa') {
        continue;
      }

      const [placa, cpfCnpj, dataEntrada, dataSaida, valorCobrado, valorDevido, valorPago, descontoAplicado] = campos;
      if (!placa || !dataEntrada) {
        console.log(`Linha inválida no CSV de registros ignorada: ${linha}`);
        continue;
      }

      const cliente = cpfCnpj ? clientes.find((c) => c.cpfCnpj === cpfCnpj) || null : null;
      const entrada = new Date(dataEntrada);

      if (Number.isNaN(entrada.getTime())) {
        console.log(`Data de entrada inválida no CSV de registros: ${linha}`);
        continue;
      }

      const registro = new RegistroEstacionamento(
        placa,
        cliente,
        entrada
      );

      registro.dataSaida = dataSaida ? new Date(dataSaida) : null;
      registro.valorCobrado = parseFloat(valorCobrado) || 0;
      registro.valorDevido = parseFloat(valorDevido) || registro.valorCobrado;
      registro.valorPago = parseFloat(valorPago) || 0;
      registro.descontoAplicado = descontoAplicado || 'nenhum';
      registro.pagamentoEfetuado = registro.valorPago >= registro.valorDevido;

      registros.push(registro);
    }

    return registros;
  }

  // Salva os registros em CSV, incluindo informações de valor, desconto e pagamento.
  salvarRegistros(registros) {
    const linhas = ['placa,cpfCnpj,dataEntrada,dataSaida,valorCobrado,valorDevido,valorPago,descontoAplicado'];
    const registroArray = Array.isArray(registros) ? registros : [...registros.values()];

    // O formato CSV agora grava campos extras para permitir restauração completa do registro.

    for (const r of registroArray) {
      if (!r || !r.placa) continue;

      const cpfCnpj = r.cliente ? r.cliente.cpfCnpj : '';
      const dataEntrada = r.dataEntrada ? r.dataEntrada.toISOString() : '';
      const dataSaida = r.dataSaida ? r.dataSaida.toISOString() : '';
      const valorCobrado = r.valorCobrado ?? 0;
      const valorDevido = r.valorDevido ?? valorCobrado;
      const valorPago = r.valorPago ?? 0;
      const descontoAplicado = r.descontoAplicado || 'nenhum';

      linhas.push([
        escapeCsvValue(r.placa),
        escapeCsvValue(cpfCnpj),
        escapeCsvValue(dataEntrada),
        escapeCsvValue(dataSaida),
        escapeCsvValue(valorCobrado),
        escapeCsvValue(valorDevido),
        escapeCsvValue(valorPago),
        escapeCsvValue(descontoAplicado)
      ].join(','));
    }

    fs.writeFileSync(this.registrosFile, linhas.join('\n'), 'utf-8');
  }
}

module.exports = { PersistenciaCSV };
