// Classe responsável pelo cadastro e consulta de clientes.
// Foi atualizado para devolver booleano em vez de apenas imprimir mensagens,
// facilitando o controle de fluxo em quem chama o método.
class CadastroClientes {
  constructor() {
    this.clientes = new Map(); // CPF/CNPJ → Cliente
  }

  // Registra um novo cliente, garantindo CPF/CNPJ único.
  // Retorna true se o cadastro foi realizado e false em caso de erro.
  cadastrarCliente(cliente) {
    if (!cliente || !cliente.cpfCnpj) {
      console.log('Cliente inválido. CPF/CNPJ obrigatório.');
      return false;
    }

    if (this.clientes.has(cliente.cpfCnpj)) {
      console.log(`Cliente ${cliente.nome} já cadastrado.`);
      return false;
    }

    this.clientes.set(cliente.cpfCnpj, cliente);
    return true;
  }

  // Recupera um cliente pelo CPF/CNPJ cadastrado.
  buscarCliente(cpfCnpj) {
    return this.clientes.get(cpfCnpj) || null;
  }

  // Retorna todos os clientes cadastrados como lista.
  listarClientes() {
    return [...this.clientes.values()];
  }

  // Remove um cliente do cadastro, se existir.
  // Retorna true quando removido com sucesso.
  removerCliente(cpfCnpj) {
    if (this.clientes.has(cpfCnpj)) {
      this.clientes.delete(cpfCnpj);
      console.log(`Cliente ${cpfCnpj} removido.`);
      return true;
    }

    console.log('Cliente não encontrado.');
    return false;
  }
}

module.exports = { CadastroClientes };