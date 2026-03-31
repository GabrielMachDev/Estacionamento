const { CadastroClientes } = require('./cadastroClientes');
const { RegistroEntradasSaidas } = require('./registroEntradasSaidas');
const { RelatoriosGerenciais } = require('./relatoriosGerenciais');
const { PersistenciaCSV } = require('./persistenciaCSV');
const { InterfaceUsuario } = require('./interfaceUsuario');

// Defina os caminhos dos arquivos CSV como strings
const persistencia = new PersistenciaCSV(
  './data/clientes.csv',
  './data/registros.csv'
);

// Carregar dados existentes
const clientes = persistencia.carregarClientes();
const cadastro = new CadastroClientes();
clientes.forEach(c => cadastro.cadastrarCliente(c));

const registros = persistencia.carregarRegistros(clientes);
const movimento = new RegistroEntradasSaidas(cadastro);
registros.forEach(r => movimento.registros.set(r.placa, r));

const relatorios = new RelatoriosGerenciais(movimento.registros, movimento.clientesBloqueados);

// Iniciar interface
console.log("Sistema de Estacionamento iniciado!\n");
const ui = new InterfaceUsuario(cadastro, movimento, relatorios, persistencia);
ui.iniciar();