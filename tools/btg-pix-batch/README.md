# btg-pix-batch

BTG Pactual Empresas - Pix Batch Payment Script.

Reads a CSV file with recipients and creates batch Pix payments via the BTG Empresas API.

## Usage

```bash
python pix_batch.py --csv recipients.csv
python pix_batch.py --csv recipients.csv --sandbox
python pix_batch.py --csv recipients.csv --dry-run
```

## CSV Format

```csv
name,tax_id,pix_key,amount,description
Joao Silva,12345678901,joao@email.com,150.00,Pagamento freelancer
Maria Santos,98765432100,11999998888,200.50,Reembolso
```

## Setup

1. Copy `.env.example` to `.env`
2. Fill in BTG API credentials
3. Install dependency: `pip install requests`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BTG_CLIENT_ID` | OAuth2 client ID |
| `BTG_CLIENT_SECRET` | OAuth2 client secret |
| `BTG_COMPANY_ID` | Company CNPJ (numbers only) |
| `BTG_DEBIT_ACCOUNT` | Debit account number |
| `BTG_REDIRECT_URI` | OAuth2 callback URL |
| `BTG_DEBIT_BRANCH` | Branch code (default: 50) |

## Flow

1. Reads and validates CSV
2. Opens browser for BTG OAuth2 login
3. Exchanges auth code for access token
4. Sends batch Pix payment to BTG API
5. Payments must be **approved in BTG app** after creation
