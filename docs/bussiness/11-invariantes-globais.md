# Invariantes Globais da Exchange

## Objetivo

As invariantes globais representam regras fundamentais que devem permanecer verdadeiras em qualquer momento do ciclo de vida da Exchange, independentemente da operação executada.

Toda funcionalidade, processo, serviço ou integração deve preservar essas propriedades.

Este documento é o índice de **todas** as invariantes globais (financeiras e não financeiras), com ID `GLOB-NNN`. As invariantes puramente financeiras (GLOB-001, GLOB-003, GLOB-004, GLOB-020) têm versão mais detalhada, com exemplo de conta contábil, em `04-carteiras-e-ledger-financeiro.md` (IDs `INV-NNN`) — mesma regra, não duplicação divergente. Em caso de conflito de redação entre os dois documentos, `04-carteiras-e-ledger-financeiro.md` é a fonte de detalhe.

## Índice

`Aplicável hoje` indica se a funcionalidade a que a regra se refere já existe no código (✅), existe parcialmente (⚠️), ou depende de algo ainda não implementado — Order/Trade/Matching (❌ N/A hoje). A regra em si é válida desde já como design; a coluna só diz se há código para violá-la ou não hoje.

| ID | Regra | Detalhe financeiro correspondente | Aplicável hoje |
| --- | --- | --- | --- |
| GLOB-001 | Nenhum saldo pode ser negativo | INV-001, INV-002, INV-003 | ✅ |
| GLOB-002 | Nenhuma ordem pode ser executada mais de uma vez | — | ❌ N/A (Ordens/Trades não existem) |
| GLOB-003 | Nenhum ativo pode ser criado espontaneamente | INV-008 | ✅ |
| GLOB-004 | Nenhum ativo pode ser destruído espontaneamente | INV-009 | ⚠️ Parcial (saques/trades não implementados) |
| GLOB-005 | Conservação global de ativos | INV-012 | ✅ |
| GLOB-006 | Toda ordem deve possuir lastro financeiro | INV-010, INV-011 | ❌ N/A (Ordens não existem) |
| GLOB-007 | Nenhum trade pode existir sem duas ordens compatíveis | — | ❌ N/A (Trades não existem) |
| GLOB-008 | Toda execução deve atualizar os saldos correspondentes | — | ❌ N/A (Trades não existem) |
| GLOB-009 | Nenhuma ordem cancelada pode voltar ao livro | — | ❌ N/A (Ordens não existem) |
| GLOB-010 | Ordens totalmente executadas não podem receber novas execuções | — | ❌ N/A (Ordens não existem) |
| GLOB-011 | Nenhum trade pode alterar o preço original registrado | — | ❌ N/A (Trades não existem) |
| GLOB-012 | O histórico deve ser imutável | INV-014 | ✅ |
| GLOB-013 | Todo evento deve ser auditável | — | ⚠️ Parcial (auditoria via ledger, não via event store — ver `10-eventos-de-dominio-e-auditoria.md`) |
| GLOB-014 | O Matching Engine deve ser determinístico | — | ❌ N/A (Matching Engine não existe) |
| GLOB-015 | Prioridade preço-tempo deve ser preservada | — | ❌ N/A (Matching Engine não existe) |
| GLOB-016 | Nenhum usuário pode negociar consigo mesmo | — | ❌ N/A (Matching Engine não existe) |
| GLOB-017 | Toda taxa deve possuir destino contábil | INV-013 | ❌ N/A (Trades não existem) |
| GLOB-018 | Estados devem ser monotônicos | — | ✅ (ex.: status de User) |
| GLOB-019 | Identificadores devem ser globalmente únicos | — | ✅ |
| GLOB-020 | O razão contábil deve fechar (Σ débitos = Σ créditos) | INV-007 | ✅ |

---

# GLOB-001. Nenhum Saldo Pode Ser Negativo

## Regra

Nenhum usuário pode possuir saldo disponível, bloqueado ou total inferior a zero.

### Formalização

```text
SaldoDisponivel >= 0
SaldoBloqueado >= 0
SaldoTotal >= 0
```

### Justificativa

Saldos negativos indicam criação indevida de crédito, falhas de concorrência ou inconsistências contábeis.

### Exemplo Válido

| Ativo | Disponível | Bloqueado |
| ----- | ---------- | --------- |
| BRL   | 1000       | 500       |

### Exemplo Inválido

| Ativo | Disponível | Bloqueado |
| ----- | ---------- | --------- |
| BRL   | -100       | 500       |

---

# GLOB-002. Nenhuma Ordem Pode Ser Executada Mais de Uma Vez

## Regra

Cada parcela executada de uma ordem deve possuir identificador único e ser registrada apenas uma vez.

### Justificativa

Evita:

* Duplicação de trades.
* Créditos indevidos.
* Divergência contábil.

### Exemplo

Uma ordem de compra de 1 BTC pode gerar:

```text
Trade #1001 → 0.4 BTC
Trade #1002 → 0.6 BTC
```

Nunca:

```text
Trade #1001 executado novamente
```

---

# GLOB-003. Nenhum Ativo Pode Ser Criado Espontaneamente

## Regra

Toda movimentação deve possuir origem rastreável.

### Formalização

```text
Entradas = Saídas + Saldos Existentes
```

### Justificativa

A Exchange não pode gerar BTC, ETH, USDT ou BRL sem evento legítimo.

### Eventos Permitidos

| Evento                 | Permite criação |
| ---------------------- | --------------- |
| Depósito               | Sim             |
| Airdrop administrativo | Sim             |
| Trade                  | Não             |
| Cancelamento de ordem  | Não             |

---

# GLOB-004. Nenhum Ativo Pode Ser Destruído Espontaneamente

## Regra

Ativos não podem desaparecer do sistema.

### Justificativa

Toda redução de saldo deve possuir causa explícita.

### Eventos Permitidos

| Evento            | Consome ativo |
| ----------------- | ------------- |
| Saque             | Sim           |
| Trade             | Sim           |
| Taxa              | Sim           |
| Falha operacional | Não           |

---

# GLOB-005. Conservação Global de Ativos

## Regra

A soma global de cada ativo deve permanecer constante, exceto em operações autorizadas de entrada ou saída.

### Formalização

Para cada ativo:

```text
TotalSistema =
SaldosUsuarios +
SaldosBloqueados +
SaldosOperacionais
```

### Exemplo

BTC existente:

| Local      | Quantidade |
| ---------- | ---------- |
| Usuários   | 80 BTC     |
| Bloqueado  | 15 BTC     |
| Tesouraria | 5 BTC      |

```text
Total BTC = 100 BTC
```

Após um trade:

```text
Total BTC = 100 BTC
```

O trade apenas redistribui propriedade.

---

# GLOB-006. Toda Ordem Deve Possuir Lastro Financeiro

## Regra

Nenhuma ordem pode existir sem que os ativos necessários estejam previamente bloqueados.

### Compra

```text
Saldo BRL >= Valor da Ordem
```

### Venda

```text
Saldo BTC >= Quantidade da Ordem
```

### Justificativa

Impede:

* Ordens descobertas.
* Alavancagem implícita.
* Fraudes operacionais.

---

# GLOB-007. Nenhum Trade Pode Existir Sem Duas Ordens Compatíveis

## Regra

Todo trade deve derivar do encontro entre:

* Uma ordem de compra.
* Uma ordem de venda.

### Formalização

```text
Trade = BuyOrder + SellOrder
```

### Justificativa

Trades não podem ser criados manualmente pelo sistema.

---

# GLOB-008. Toda Execução Deve Atualizar os Saldos Correspondentes

## Regra

Após a execução de um trade, os saldos envolvidos devem refletir imediatamente a negociação.

### Exemplo

Compra:

```text
0.5 BTC
Preço = 500.000 BRL
```

Resultado obrigatório:

| Participante | Alteração    |
| ------------ | ------------ |
| Comprador    | +0.5 BTC     |
| Comprador    | -250.000 BRL |
| Vendedor     | -0.5 BTC     |
| Vendedor     | +250.000 BRL |

---

# GLOB-009. Nenhuma Ordem Cancelada Pode Voltar ao Livro

## Regra

Uma ordem cancelada torna-se imutável.

### Estados Permitidos

```text
OPEN
 ├─► PARTIALLY_FILLED
 ├─► FILLED
 └─► CANCELLED
```

### Estado Proibido

```text
CANCELLED → OPEN
```

---

# GLOB-010. Ordens Totalmente Executadas Não Podem Receber Novas Execuções

## Regra

Após atingir sua quantidade total:

```text
ExecutedQuantity = OriginalQuantity
```

A ordem deve ser encerrada definitivamente.

### Estado Proibido

```text
FILLED → PARTIALLY_FILLED
FILLED → FILLED novamente
```

---

# GLOB-011. Nenhum Trade Pode Alterar o Preço Original Registrado

## Regra

Após persistido, o preço de execução torna-se imutável.

### Justificativa

Preserva:

* Auditoria.
* Reconciliação financeira.
* Integridade histórica.

---

# GLOB-012. O Histórico Deve Ser Imutável

## Regra

Eventos financeiros nunca podem ser apagados ou alterados.

### Eventos

* Trade
* Depósito
* Saque
* Taxa
* Ajuste
* Cancelamento

### Estratégia

Correções devem gerar novos eventos.

Nunca:

```text
UPDATE trade
DELETE trade
```

Sempre:

```text
INSERT correction_event
```

---

# GLOB-013. Todo Evento Deve Ser Auditável

## Regra

Toda alteração relevante deve possuir rastreabilidade.

### Informações Mínimas

| Campo     | Obrigatório |
| --------- | ----------- |
| EventId   | Sim         |
| Timestamp | Sim         |
| Usuário   | Sim         |
| Origem    | Sim         |
| Tipo      | Sim         |

---

# GLOB-014. O Matching Engine Deve Ser Determinístico

## Regra

Dado o mesmo livro de ofertas e mesma sequência de entrada, o resultado deve ser sempre idêntico.

### Justificativa

Permite:

* Reprocessamento.
* Auditoria.
* Recuperação de desastres.

---

# GLOB-015. Prioridade Preço-Tempo Deve Ser Preservada

## Regra

O algoritmo de matching deve respeitar:

1. Melhor preço.
2. Menor timestamp.

### Exemplo

Livro:

| Ordem | Preço | Hora  |
| ----- | ----- | ----- |
| A     | 100   | 10:00 |
| B     | 100   | 10:01 |

Execução obrigatória:

```text
A antes de B
```

---

# GLOB-016. Nenhum Usuário Pode Negociar Consigo Mesmo

## Regra

Uma ordem não pode casar com outra ordem pertencente ao mesmo usuário.

### Justificativa

Evita:

* Wash trading.
* Manipulação de volume.
* Dados de mercado artificiais.

---

# GLOB-017. Toda Taxa Deve Possuir Destino Contábil

## Regra

Toda cobrança deve ser creditada explicitamente em uma conta de receita.

### Formalização

```text
Taxa Debitada =
Taxa Creditada
```

### Proibido

```text
Taxa desaparece do sistema
```

---

# GLOB-018. Estados Devem Ser Monotônicos

## Regra

Uma entidade nunca pode retornar para um estado anterior.

### Exemplo

Ordem:

```text
OPEN
→ PARTIALLY_FILLED
→ FILLED
```

Nunca:

```text
FILLED → OPEN
```

---

# GLOB-019. Identificadores Devem Ser Globalmente Únicos

## Regra

Não podem existir dois registros com o mesmo identificador lógico.

### Entidades

* UserId
* OrderId
* TradeId
* DepositId
* WithdrawalId
* EventId

---

# GLOB-020. O Razão Contábil Deve Fechar

## Regra

Toda movimentação financeira deve obedecer ao princípio das partidas dobradas.

### Formalização

```text
Σ Débitos = Σ Créditos
```

### Exemplo

Compra de BTC:

| Conta         | Valor   |
| ------------- | ------- |
| BRL Comprador | -50.000 |
| BRL Vendedor  | +50.000 |

Resultado:

```text
Débitos = Créditos
```

---

# Invariante Suprema

## Integridade Patrimonial Global

A qualquer instante do sistema:

```text
Σ Ativos Existentes
=
Σ Ativos Depositados
+
Σ Ajustes Administrativos
-
Σ Saques
```

E simultaneamente:

```text
Σ Débitos
=
Σ Créditos
```

Essa é a propriedade máxima da Exchange. Se ela for preservada, o patrimônio digital da plataforma permanece íntegro, auditável e consistente.
