# Estudo do gasto mensal dos clientes

**Base:** `01_cafeterias.csv` — 1.200 clientes, 20 variáveis, sem valores ausentes.
**Variável estudada:** `gasto_mensal` (R$), quantitativa contínua. Mínimo R$ 103,82 e máximo R$ 444,83.

## 1. Critério de sucesso

Cliente com **gasto mensal maior que R$ 300,00**.

- Sucesso: `gasto_mensal > 300`
- Fracasso (complementar): `gasto_mensal ≤ 300`

Nenhum cliente gasta exatamente R$ 300,00, então o limite não gera ambiguidade.

## 2. Sucessos e fracassos

| Resultado | Quantidade | Proporção |
|---|---:|---:|
| Sucesso (p) | 175 | 0,1458 (14,58%) |
| Fracasso (q) | 1.025 | 0,8542 (85,42%) |
| **Total (n)** | **1.200** | **1,0000** |

Como q é o complementar de p, vale p + q = 1.

## 3. Lei binomial

Para **n** ensaios independentes (n clientes sorteados), cada um com probabilidade de sucesso **p = 0,1458**, a probabilidade de obter exatamente **k** sucessos é:

```
P(X = k) = n! / (k! · (n − k)!) · p^k · (1 − p)^(n − k)
```

Implementada em [`02_binomial.py`](02_binomial.py), com `n` e `k` como entradas da função `binomial(n, k, p)`. O valor de `p` vem do CSV.

Exemplos (p = 0,1458):

| n | k | P(X = k) |
|---:|---:|---:|
| 10 | 0 | 0,206741 (20,67%) |
| 10 | 2 | 0,271186 (27,12%) |
| 20 | 3 | 0,242493 (24,25%) |

Conferência: para cada n, a soma de P(X = 0..n) dá 1.

## Reprodução

```
python 01_gasto_sucesso.py      # p e q
python 02_binomial.py 10 2      # n=10, k=2
```
