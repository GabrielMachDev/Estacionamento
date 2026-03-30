const { CadastroClientes } = require('./cadastroClientes');
const { RegistroEntradasSaidas } = require('./registroEntradasSaidas');
const { RelatoriosGerenciais } = require('./relatoriosGerenciais');
const { Professor, Estudante, Empresa } = require('./cliente');

function main() {
  console.log("Sistema de Estacionamento iniciado!\n");

  const cadastro = new CadastroClientes();
  const movimento = new RegistroEntradasSaidas(cadastro);

  // Cadastro de clientes
  const prof = new Professor("12345678901", "Bernardo Copstein");
  prof.adicionarPlaca("ABC1D23");
  cadastro.cadastrarCliente(prof);

  const est = new Estudante("23456789012", "Gabriel Mach", 20); // saldo inicial
  est.adicionarPlaca("DEF2E34");
  cadastro.cadastrarCliente(est);

  const emp = new Empresa("56789012345", "Tecnopuc S.A.", 0); // sem débito inicial
  emp.adicionarPlaca("STU7J89");
  cadastro.cadastrarCliente(emp);

  // Entradas
  console.log("Tentando autorizar entradas...");
  movimento.autorizarEntrada("ABC1D23", "12345678901"); // Professor
  movimento.autorizarEntrada("DEF2E34", "23456789012"); // Estudante
  movimento.autorizarEntrada("STU7J89", "56789012345"); // Empresa

  // Saídas simuladas
  setTimeout(() => {
    console.log("\nProcessando saídas...\n");

    const saidaProf = movimento.registrarSaida("ABC1D23");
    const saidaEst = movimento.registrarSaida("DEF2E34");
    const saidaEmp = movimento.registrarSaida("STU7J89");

    const formatarData = d => d.toLocaleString("pt-BR");

    const imprimirRegistro = (registro, tipo) => {
      console.log(`Saída registrada:\n- ${tipo} (${registro.placa})`);
      console.log(`  Entrada: ${formatarData(registro.dataEntrada)}`);
      console.log(`  Saída:   ${formatarData(registro.dataSaida)}`);
      console.log(`  Valor cobrado: R$ ${(registro.valorCobrado ?? 0).toFixed(2)}`);
      console.log(`  Desconto aplicado: ${registro.descontoAplicado}\n`);
    };

    imprimirRegistro(saidaProf, "Professor");
    imprimirRegistro(saidaEst, "Estudante");
    imprimirRegistro(saidaEmp, "Empresa");

    // Agora o relatório recebe também os bloqueados
    const relatorios = new RelatoriosGerenciais(movimento.registros, movimento.clientesBloqueados);

    console.log("Relatório de Arrecadação:");
    console.log(`Total arrecadado no período: R$ ${relatorios.gerarRelatorioArrecadacao().toFixed(2)}`);

    console.log("\nClientes bloqueados:");
    console.log(relatorios.listarClientesBloqueados());

    console.log("\nTop 10 clientes mais frequentes:");
    console.log(relatorios.top10Frequentes());
  }, 2000);
}

main();