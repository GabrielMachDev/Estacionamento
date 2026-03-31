# Sistema de Controle de Estacionamento

Projeto desenvolvido para a disciplina de Programação Orientada a Objetos (PUCRS Online).  
Este sistema simula o controle de entrada, saída e cobrança em um estacionamento de veículos de passeio.

---

## Objetivos

- Modelar o domínio conforme o diagrama de classes do documento complementar.
- Implementar regras de negócio para diferentes tipos de clientes.
- Utilizar herança, polimorfismo e encapsulamento.
- Organizar o código em módulos e classes reutilizáveis.
- Simular o fluxo completo de uso do sistema via terminal.
- Persistência avançada: evoluir do uso de arquivos CSV para um banco de dados relacional ou NoSQL, garantindo maior robustez e escalabilidade.
- Validação de dados: implementar regras mais rígidas para CPF/CNPJ e placas de veículos, evitando inconsistências no cadastro.
- Gestão de múltiplas placas: permitir que clientes tenham vários veículos vinculados e controlar entradas/saídas de forma independente.
- Bloqueio automático de clientes: aplicar regras de bloqueio para clientes com saldo insuficiente ou débito elevado.
- Relatórios aprimorados: incluir filtros mais detalhados (por cliente, categoria, período) e exportação dos relatórios.
- Interface de usuário melhorada: refinar a interação no terminal e preparar para futura integração com interface gráfica ou web.
- Testes automatizados: criar uma suíte de testes unitários e de integração para validar regras de negócio e persistência.
- Documentação técnica: detalhar arquitetura, classes e fluxos de uso para facilitar manutenção e evolução do sistema.

---

## Estrutura de Pastas

estacionamento/
  ├── src/
  │   ├── app.js                    # Ponto de entrada do sistema
  │   ├── interfaceUsuario.js       # Menu e interação via terminal
  │   ├── cadastroClientes.js       # Cadastro e busca de clientes
  │   ├── cliente.js                # Classes Professor, Estudante, Empresa
  │   ├── desconto.js               # Regras de desconto
  │   ├── registroEntradasSaidas.js # Controle de entradas e saídas
  │   ├── registroEstacionamento.js # Registro de veículos estacionados
  │   ├── relatoriosGerenciais.js   # Relatórios de arrecadação e situação
  │   ├── ticketEstacionamento.js   # Ticket de cobrança
  │   ├── persistenciaCSV.js        # Persistência em arquivos CSV
  ├── data/
  │   ├── clientes.csv              # Base de clientes cadastrados
  │   ├── registros.csv             # Histórico de entradas/saídas
  ├── package.json
  └── README.md

  ---

## Funcionalidades

- Cadastro de clientes (Professor, Estudante, Empresa) já com placas vinculadas.
- Entrada e saída de veículos vinculados a clientes ou avulsos.
- Cobrança automática conforme categoria do cliente.
- Relatórios gerenciais:
  - Valor total arrecadado.
  - Arrecadação por período.
  - Arrecadação por categoria.
  - Situação de cliente (saldo, débito, bloqueio, veículos estacionados).
  - Registros por período (clientes e avulsos).
  - Clientes bloqueados.
  - Top 10 clientes mais frequentes.
- Persistência em CSV para manter clientes e registros entre execuções.

## Como executar

1. Instale o [Node.js](https://nodejs.org) (versão LTS recomendada).
2. Clone o repositório ou copie os arquivos para uma pasta local.
3. Abra o terminal na raiz do projeto.
4. Execute o sistema com:
   ```bash
   node src/app.js