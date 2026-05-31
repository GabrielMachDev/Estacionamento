// Modelo simples de registro de estacionamento.
// Esta classe contém apenas o estado do registro e não realiza cálculos,
// para manter a lógica de cobrança centralizada em clientes / serviços.
class RegistroEstacionamento {
  // Cria um registro de entrada com estado inicial neutro para cobrança e pagamento.
  constructor(placa, cliente, dataEntrada) {
    this.placa = placa;
    this.cliente = cliente;
    this.dataEntrada = dataEntrada;
    this.dataSaida = null;
    this.valorCobrado = 0;
    this.valorDevido = 0;
    this.valorPago = 0;
    this.descontoAplicado = 'nenhum';
    this.pagamentoEfetuado = false;
  }
}

module.exports = { RegistroEstacionamento };