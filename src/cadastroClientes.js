class CadastroClientes {
  constructor() {
    this.clientes = new Map(); // CPF/CNPJ → Cliente
  }

  cadastrarCliente(cliente) {
    if (!this.clientes.has(cliente.cpfCnpj)) {
      this.clientes.set(cliente.cpfCnpj, cliente);
    } else {
      console.log(`Cliente ${cliente.nome} já cadastrado.`);
    }
  }

  buscarCliente(cpfCnpj) {
    return this.clientes.get(cpfCnpj) || null;
  }

  listarClientes() {
    return [...this.clientes.values()];
  }

  removerCliente(cpfCnpj) {
    if (this.clientes.has(cpfCnpj)) {
      this.clientes.delete(cpfCnpj);
      console.log(`Cliente ${cpfCnpj} removido.`);
    } else {
      console.log("Cliente não encontrado.");
    }
  }
}

module.exports = { CadastroClientes };