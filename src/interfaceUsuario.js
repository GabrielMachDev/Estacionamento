const readline = require('readline');
const { Professor, Estudante, Empresa } = require('./cliente');

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

  iniciar() {
    console.log("\n🎛️ Bem-vindo ao Sistema de Estacionamento!");
    this.menuPrincipal();
  }

  menuPrincipal() {
    console.log("\nSelecione uma opção:");
    console.log("1 - Cadastrar cliente");
    console.log("2 - Entrada de veículo");
    console.log("3 - Saída de veículo");
    console.log("4 - Relatórios");
    console.log("5 - Remover placa de cliente");
    console.log("6 - Listar clientes cadastrados");
    console.log("7 - Salvar e sair");

    this.rl.question("Opção: ", (opcao) => {
      switch (opcao) {
        case "1": this.cadastrarCliente(); break;
        case "2": this.entradaVeiculo(); break;
        case "3": this.saidaVeiculo(); break;
        case "4": this.menuRelatorios(); break;
        case "5": this.removerPlaca(); break;
        case "6": this.listarClientes(); break;
        case "7": this.encerrar(); break;
        default: console.log("❌ Opção inválida."); this.menuPrincipal();
      }
    });
  }

  cadastrarCliente() {
    this.rl.question("Tipo (Professor/Estudante/Empresa): ", (tipo) => {
      this.rl.question("CPF/CNPJ: ", (cpfCnpj) => {
        this.rl.question("Nome: ", (nome) => {
          let cliente;

          if (tipo === "Professor") {
            cliente = new Professor(cpfCnpj, nome);
            this.rl.question("Placas (separadas por vírgula, ou deixe vazio): ", (placasStr) => {
              if (placasStr.trim() !== "") {
                placasStr.split(",").forEach(p => cliente.adicionarPlaca(p.trim()));
              }
              this.cadastro.cadastrarCliente(cliente);
              console.log("✅ Professor cadastrado com sucesso!");
              this.menuPrincipal();
            });
            return;
          }

          if (tipo === "Estudante") {
            this.rl.question("Saldo inicial: ", (saldo) => {
              cliente = new Estudante(cpfCnpj, nome, parseFloat(saldo));
              this.rl.question("Placas (separadas por vírgula, ou deixe vazio): ", (placasStr) => {
                if (placasStr.trim() !== "") {
                  placasStr.split(",").forEach(p => cliente.adicionarPlaca(p.trim()));
                }
                this.cadastro.cadastrarCliente(cliente);
                console.log("✅ Estudante cadastrado!");
                this.menuPrincipal();
              });
            });
            return;
          }

          if (tipo === "Empresa") {
            this.rl.question("Débito inicial: ", (debito) => {
              cliente = new Empresa(cpfCnpj, nome, parseFloat(debito));
              this.rl.question("Placas (separadas por vírgula, ou deixe vazio): ", (placasStr) => {
                if (placasStr.trim() !== "") {
                  placasStr.split(",").forEach(p => cliente.adicionarPlaca(p.trim()));
                }
                this.cadastro.cadastrarCliente(cliente);
                console.log("✅ Empresa cadastrada!");
                this.menuPrincipal();
              });
            });
            return;
          }

          console.log("❌ Tipo inválido.");
          this.menuPrincipal();
        });
      });
    });
  }

  entradaVeiculo() {
    this.rl.question("Placa: ", (placa) => {
      this.rl.question("CPF/CNPJ (ou vazio se avulso): ", (cpfCnpj) => {
        const autorizado = this.movimento.autorizarEntrada(placa, cpfCnpj || null);
        console.log(autorizado ? "✅ Entrada autorizada!" : "🚫 Entrada negada.");
        this.menuPrincipal();
      });
    });
  }

  saidaVeiculo() {
    this.rl.question("Placa: ", (placa) => {
      const registro = this.movimento.registrarSaida(placa);
      if (registro) {
        console.log(`📤 Saída registrada para ${placa}. Valor: R$ ${registro.valorCobrado.toFixed(2)}`);
      } else {
        console.log("❌ Veículo não encontrado.");
      }
      this.menuPrincipal();
    });
  }

  removerPlaca() {
    this.rl.question("CPF/CNPJ do cliente: ", (cpfCnpj) => {
      const cliente = this.cadastro.buscarCliente(cpfCnpj);
      if (!cliente) {
        console.log("❌ Cliente não encontrado.");
        return this.menuPrincipal();
      }
      this.rl.question("Placa a remover: ", (placa) => {
        if (cliente.placas.has(placa)) {
          cliente.placas.delete(placa);
          console.log(`✅ Placa ${placa} removida do cliente ${cliente.nome}.`);
        } else {
          console.log("❌ Placa não encontrada para este cliente.");
        }
        this.menuPrincipal();
      });
    });
  }

  listarClientes() {
    const clientes = this.cadastro.listarClientes();
    if (clientes.length === 0) {
      console.log("⚠️ Nenhum cliente cadastrado.");
    } else {
      console.log("\n📋 Lista de clientes cadastrados:");
      clientes.forEach(c => {
        console.log(`- ${c.cpfCnpj} | ${c.nome} | ${c.constructor.name} | Placas: ${[...c.placas].join(', ')}`);
      });
    }
    this.menuPrincipal();
  }

  menuRelatorios() {
    console.log("\nRelatórios disponíveis:");
    console.log("1 - Valor total arrecadado");
    console.log("2 - Valor total arrecadado por período");
    console.log("3 - Arrecadação por categoria");
    console.log("4 - Arrecadação por período e categoria");
    console.log("5 - Situação de cliente");
    console.log("6 - Registros de cliente por período");
    console.log("7 - Registros avulsos por período");
    console.log("8 - Clientes bloqueados");
    console.log("9 - Top 10 clientes frequentes");
    console.log("10 - Voltar");

    this.rl.question("Opção: ", (opcao) => {
      switch (opcao) {
        case "1":
          console.log(`💰 Total arrecadado: R$ ${this.relatorios.gerarRelatorioArrecadacao().toFixed(2)}`);
          break;
        case "2":
          this.rl.question("Data início (YYYY-MM-DD): ", (inicio) => {
            this.rl.question("Data fim (YYYY-MM-DD): ", (fim) => {
              const total = this.relatorios.arrecadacaoPorPeriodo(new Date(inicio), new Date(fim));
              console.log(`💰 Total arrecadado no período: R$ ${total.toFixed(2)}`);
              this.menuRelatorios();
            });
          });
          return;
        case "3":
          console.log("📊 Arrecadação por categoria:", this.relatorios.arrecadacaoPorCategoria());
          break;
        case "4":
          this.rl.question("Data início (YYYY-MM-DD): ", (inicio) => {
            this.rl.question("Data fim (YYYY-MM-DD): ", (fim) => {
              const resultado = this.relatorios.arrecadacaoPorPeriodoECategoria(new Date(inicio), new Date(fim));
              console.log("📊 Arrecadação por período e categoria:", resultado);
              this.menuRelatorios();
            });
          });
          return;
        case "5":
          this.rl.question("CPF/CNPJ do cliente: ", (cpfCnpj) => {
            console.log("📋 Situação:", this.relatorios.situacaoCliente(cpfCnpj));
            this.menuRelatorios();
          });
          return;
        case "6":
          this.rl.question("CPF/CNPJ do cliente: ", (cpfCnpj) => {
            this.rl.question("Data início (YYYY-MM-DD): ", (inicio) => {
              this.rl.question("Data fim (YYYY-MM-DD): ", (fim) => {
                const registros = this.relatorios.registrosClientePorPeriodo(cpfCnpj, new Date(inicio), new Date(fim));
                console.log("📂 Registros:", registros);
                this.menuRelatorios();
              });
            });
          });
          return;
        case "7":
          this.rl.question("Data início (YYYY-MM-DD): ", (inicio) => {
            this.rl.question("Data fim (YYYY-MM-DD): ", (fim) => {
              const registros = this.relatorios.registrosAvulsosPorPeriodo(new Date(inicio), new Date(fim));
              console.log("📂 Registros avulsos:", registros);
              this.menuRelatorios();
            });
          });
          return;
        case "8":
          console.log("🚫 Bloqueados:", this.relatorios.listarClientesBloqueados());
          break;
        case "9":
          console.log("🏆 Top 10:", this.relatorios.top10Frequentes());
          break;
        case "10": return this.menuPrincipal();
        default: console.log("❌ Opção inválida.");
      }
      this.menuRelatorios();
    });
  }

  encerrar() {
    this.persistencia.salvarClientes(this.cadastro.listarClientes());
    this.persistencia.salvarRegistros(this.movimento.registros);
    console.log("💾 Dados salvos. Encerrando...");
    this.rl.close();
  }
}

module.exports = { InterfaceUsuario };