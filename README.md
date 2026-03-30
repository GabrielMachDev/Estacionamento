# Sistema de Controle de Estacionamento

Projeto desenvolvido para a disciplina de Programação Orientada a Objetos (PUCRS Online).  
Este sistema simula o controle de entrada, saída e cobrança em um estacionamento de veículos de passeio.

---

## Objetivos da Fase 1

- Modelar o domínio conforme o diagrama de classes do documento complementar.
- Implementar regras de negócio para diferentes tipos de clientes.
- Utilizar herança, polimorfismo e encapsulamento.
- Organizar o código em módulos e classes reutilizáveis.
- Simular o fluxo completo de uso do sistema via terminal.

---

## Estrutura de Pastas

estacionamento/
  ├── src/
  │   ├── app.js
  │   ├── cadastroClientes.js
  │   ├── cliente.js 
  │   ├── desconto.js
  │   ├── registroEntradasSaidas.js
  │   ├── registroEstacionamento.js
  │   ├── relatoriosGerenciais.js
  │   ├── ticketEstacionamento.js
  └── package.json
  └── README.md
  ---

## Como executar

1. Instale o [Node.js](https://nodejs.org) (versão LTS recomendada).
2. Clone o repositório ou copie os arquivos para uma pasta local.
3. Abra o terminal na raiz do projeto.
4. Execute o sistema com:
   ```bash
   node src/app.js