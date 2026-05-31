const path = require('path');
const { CadastroClientes } = require('./cadastroClientes');
const { RegistroEntradasSaidas } = require('./registroEntradasSaidas');
const { RelatoriosGerenciais } = require('./relatoriosGerenciais');
const { PersistenciaCSV } = require('./persistenciaCSV');
const { InterfaceUsuario } = require('./interfaceUsuario');

// Inicialização do sistema:
// - Define os arquivos CSV de clientes e registros usados pelo aplicativo
// - Carrega dados persistidos antes de iniciar a interface
// - Cria os serviços de cadastro, movimento e relatórios que orquestram o fluxo

const clientesFile = path.join(__dirname, '../data/clientes.csv');
const registrosFile = path.join(__dirname, '../data/registros.csv');

const persistencia = new PersistenciaCSV(clientesFile, registrosFile);

const cadastro = new CadastroClientes();
const clientes = persistencia.carregarClientes();
clientes.forEach(c => cadastro.cadastrarCliente(c));

const movimento = new RegistroEntradasSaidas(cadastro);
const registros = persistencia.carregarRegistros(clientes);
movimento.restaurarRegistros(registros);

const relatorios = new RelatoriosGerenciais(movimento.registros, movimento.clientesBloqueados);

console.log('Sistema de Estacionamento iniciado!\n');
const ui = new InterfaceUsuario(cadastro, movimento, relatorios, persistencia);
ui.iniciar();