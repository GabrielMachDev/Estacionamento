const { Cliente } = require('./cliente');

class CadastroClientes {
  constructor() {
    this.clientes = new Map();
  }

  cadastrarCliente(cliente) {
    this.clientes.set(cliente.cpfCnpj, cliente);
  }

  removerCliente(cpfCnpj) {
    this.clientes.delete(cpfCnpj);
  }

  buscarCliente(cpfCnpj) {
    return this.clientes.get(cpfCnpj);
  }
}

module.exports = { CadastroClientes };