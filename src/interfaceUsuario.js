const readline = require('readline');
const { Professor, Estudante, Empresa } = require('./cliente');

// Interface de linha de comando do sistema.
// Foram adicionadas validações de dados e normalização de entrada para maior robustez.
class InterfaceUsuario {
  constructor(cadastro, movimento, relatorios, persistencia) {
    this.cadastro = cadastro;
    this.movimento = movimento;
    this.relatorios = relatorios;
    this.persistencia = persistencia;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Inicia a interface de linha de comando, exibindo a primeira tela.
  iniciar() {
    console.log('\nBem-vindo ao Sistema de Estacionamento!');
    this.menuPrincipal();
  }

  // Exibe o menu principal e redireciona para a ação escolhida pelo usuário.
  menuPrincipal() {
    console.log('\nSelecione uma opção:');
    console.log('1 - Cadastrar cliente');
    console.log('2 - Entrada de veículo');
    console.log('3 - Saída de veículo');
    console.log('4 - Relatórios');
    console.log('5 - Remover placa de cliente');
    console.log('6 - Listar clientes cadastrados');
    console.log('7 - Salvar e sair');

    this.rl.question('Opção: ', (opcao) => {
      switch (opcao.trim()) {
        case '1': this.cadastrarCliente(); break;
        case '2': this.entradaVeiculo(); break;
        case '3': this.saidaVeiculo(); break;
        case '4': this.menuRelatorios(); break;
        case '5': this.removerPlaca(); break;
        case '6': this.listarClientes(); break;
        case '7': this.encerrar(); break;
        default:
          console.log('Opção inválida. Tente novamente.');
          this.menuPrincipal();
      }
    });
  }

  // Coleta dados do usuário para cadastrar um novo cliente e chama o serviço de cadastro.
  cadastrarCliente() {
    this.rl.question('Tipo (Professor/Estudante/Empresa): ', (tipo) => {
      const tipoNormalizado = tipo.trim().toLowerCase();
      this.rl.question('CPF/CNPJ: ', (cpfCnpj) => {
        const documento = cpfCnpj.trim();
        this.rl.question('Nome: ', (nome) => {
          const nomeCliente = nome.trim();
          if (!documento || !nomeCliente) {
            console.log('CPF/CNPJ e nome são obrigatórios.');
            return this.menuPrincipal();
          }

          let cliente;
          const perguntarPlacas = (callback) => {
            this.rl.question('Placas (separadas por vírgula, ou deixe vazio): ', (placasStr) => {
              if (placasStr.trim() !== '') {
                placasStr.split(',').forEach(p => cliente.adicionarPlaca(p.trim()));
              }
              callback();
            });
          };

          if (tipoNormalizado === 'professor') {
            cliente = new Professor(documento, nomeCliente);
            return perguntarPlacas(() => {
              if (this.cadastro.cadastrarCliente(cliente)) {
                console.log('Professor cadastrado com sucesso!');
              }
              this.menuPrincipal();
            });
          }

          if (tipoNormalizado === 'estudante') {
            return this.rl.question('Saldo inicial: ', (saldo) => {
              const valorSaldo = parseFloat(saldo.replace(',', '.'));
              if (Number.isNaN(valorSaldo)) {
                console.log('Saldo inválido. Use um número válido.');
                return this.menuPrincipal();
              }

              cliente = new Estudante(documento, nomeCliente, valorSaldo);
              return perguntarPlacas(() => {
                if (this.cadastro.cadastrarCliente(cliente)) {
                  console.log('Estudante cadastrado!');
                }
                this.menuPrincipal();
              });
            });
          }

          if (tipoNormalizado === 'empresa') {
            return this.rl.question('Débito inicial: ', (debito) => {
              const valorDebito = parseFloat(debito.replace(',', '.'));
              if (Number.isNaN(valorDebito)) {
                console.log('Débito inválido. Use um número válido.');
                return this.menuPrincipal();
              }

              cliente = new Empresa(documento, nomeCliente, valorDebito);
              return perguntarPlacas(() => {
                if (this.cadastro.cadastrarCliente(cliente)) {
                  console.log('Empresa cadastrada!');
                }
                this.menuPrincipal();
              });
            });
          }

          console.log('Tipo inválido. Use Professor, Estudante ou Empresa.');
          this.menuPrincipal();
        });
      });
    });
  }

  // Lê placa e CPF/CNPJ do usuário para registrar a entrada de um veículo.
  entradaVeiculo() {
    this.rl.question('Placa: ', (placa) => {
      this.rl.question('CPF/CNPJ (ou vazio se avulso): ', (cpfCnpj) => {
        const autorizado = this.movimento.autorizarEntrada(placa.trim(), cpfCnpj.trim() || null);
        console.log(autorizado ? 'Entrada autorizada!' : 'Entrada negada.');
        this.menuPrincipal();
      });
    });
  }

  // Observação: a interface já trata CPF/CNPJ vazio como avulso e normaliza placas.

  // Lê a placa e solicita a saída do veículo, exibindo o valor cobrado.
  saidaVeiculo() {
    this.rl.question('Placa: ', (placa) => {
      const registro = this.movimento.registrarSaida(placa.trim());
      if (registro) {
        console.log(`Saída registrada para ${registro.placa}. Valor: R$ ${registro.valorCobrado.toFixed(2)}`);
      } else {
        console.log('Veículo não encontrado ou não está dentro do estacionamento.');
      }
      this.menuPrincipal();
    });
  }

  // Remove uma placa associada a um cliente existente.
  removerPlaca() {
    this.rl.question('CPF/CNPJ do cliente: ', (cpfCnpj) => {
      const cliente = this.cadastro.buscarCliente(cpfCnpj.trim());
      if (!cliente) {
        console.log('Cliente não encontrado.');
        return this.menuPrincipal();
      }
      this.rl.question('Placa a remover: ', (placa) => {
        if (cliente.removerPlaca(placa.trim())) {
          console.log(`Placa ${placa.trim()} removida do cliente ${cliente.nome}.`);
        }
        this.menuPrincipal();
      });
    });
  }

  // Exibe a lista de clientes atualmente cadastrados no sistema.
  listarClientes() {
    const clientes = this.cadastro.listarClientes();
    if (clientes.length === 0) {
      console.log('Nenhum cliente cadastrado.');
    } else {
      console.log('\nLista de clientes cadastrados:');
      clientes.forEach(c => {
        console.log(`- ${c.cpfCnpj} | ${c.nome} | ${c.constructor.name} | Placas: ${[...c.placas].join(', ')}`);
      });
    }
    this.menuPrincipal();
  }

  // Menu de relatórios com opções para análise de arrecadação e situação de clientes.
  menuRelatorios() {
    console.log('\nRelatórios disponíveis:');
    console.log('1 - Valor total arrecadado');
    console.log('2 - Valor total arrecadado por período');
    console.log('3 - Arrecadação por categoria');
    console.log('4 - Arrecadação por período e categoria');
    console.log('5 - Situação de cliente');
    console.log('6 - Registros de cliente por período');
    console.log('7 - Registros avulsos por período');
    console.log('8 - Clientes bloqueados');
    console.log('9 - Top 10 clientes frequentes');
    console.log('10 - Voltar');

    this.rl.question('Opção: ', (opcao) => {
      switch (opcao.trim()) {
        case '1':
          console.log(`Total arrecadado: R$ ${this.relatorios.gerarRelatorioArrecadacao().toFixed(2)}`);
          break;
        case '2':
          this.rl.question('Data início (YYYY-MM-DD): ', (inicio) => {
            this.rl.question('Data fim (YYYY-MM-DD): ', (fim) => {
              const total = this.relatorios.arrecadacaoPorPeriodo(new Date(inicio), new Date(fim));
              console.log(`Total arrecadado no período: R$ ${total.toFixed(2)}`);
              this.menuRelatorios();
            });
          });
          return;
        case '3':
          this.imprimirResultado(this.relatorios.arrecadacaoPorCategoria());
          break;
        case '4':
          this.rl.question('Data início (YYYY-MM-DD): ', (inicio) => {
            this.rl.question('Data fim (YYYY-MM-DD): ', (fim) => {
              this.imprimirResultado(this.relatorios.arrecadacaoPorPeriodoECategoria(new Date(inicio), new Date(fim)));
              this.menuRelatorios();
            });
          });
          return;
        case '5':
          this.rl.question('CPF/CNPJ do cliente: ', (cpfCnpj) => {
            this.imprimirResultado(this.relatorios.situacaoCliente(cpfCnpj.trim()));
            this.menuRelatorios();
          });
          return;
        case '6':
          this.rl.question('CPF/CNPJ do cliente: ', (cpfCnpj) => {
            this.rl.question('Data início (YYYY-MM-DD): ', (inicio) => {
              this.rl.question('Data fim (YYYY-MM-DD): ', (fim) => {
                this.imprimirResultado(this.relatorios.registrosClientePorPeriodo(cpfCnpj.trim(), new Date(inicio), new Date(fim)));
                this.menuRelatorios();
              });
            });
          });
          return;
        case '7':
          this.rl.question('Data início (YYYY-MM-DD): ', (inicio) => {
            this.rl.question('Data fim (YYYY-MM-DD): ', (fim) => {
              this.imprimirResultado(this.relatorios.registrosAvulsosPorPeriodo(new Date(inicio), new Date(fim)));
              this.menuRelatorios();
            });
          });
          return;
        case '8':
          this.imprimirResultado(this.relatorios.listarClientesBloqueados());
          break;
        case '9':
          this.imprimirResultado(this.relatorios.top10Frequentes());
          break;
        case '10':
          return this.menuPrincipal();
        default:
          console.log('Opção inválida.');
      }
      this.menuRelatorios();
    });
  }

  // Persiste os dados atuais de clientes e registros antes de encerrar a aplicação.
  encerrar() {
    this.persistencia.salvarClientes(this.cadastro.listarClientes());
    this.persistencia.salvarRegistros(this.movimento.registros);
    console.log('Dados salvos. Encerrando...');
    this.rl.close();
  }

  imprimirResultado(resultado) {
    if (Array.isArray(resultado)) {
      console.table(resultado);
    } else if (resultado && typeof resultado === 'object') {
      console.log(JSON.stringify(resultado, null, 2));
    } else {
      console.log(resultado);
    }
  }
}

module.exports = { InterfaceUsuario };