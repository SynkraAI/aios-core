#!/usr/bin/env python3
"""
BTG Pactual Empresas - Pix Batch Payment Script

Reads a CSV file with recipients and creates batch Pix payments
via the BTG Empresas API. Payments must be approved in the
BTG Empresas app/internet banking after creation.

Usage:
    python pix_batch.py --csv recipients.csv
    python pix_batch.py --csv recipients.csv --sandbox
    python pix_batch.py --csv recipients.csv --dry-run

CSV format:
    name,tax_id,pix_key,amount,description
    João Silva,12345678901,joao@email.com,150.00,Pagamento freelancer
    Maria Santos,98765432100,11999998888,200.50,Reembolso
"""

import argparse
import csv
import http.server
import json
import os
import secrets
import sys
import threading
import time
import urllib.parse
import uuid
import webbrowser
from base64 import b64encode
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    print("Erro: pacote 'requests' não instalado.")
    print("Instale com: pip install requests")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ENV_FILE = Path(__file__).parent / ".env"

PRODUCTION = {
    "auth_url": "https://id.btgpactual.com/oauth2/authorize",
    "token_url": "https://id.btgpactual.com/oauth2/token",
    "api_url": "https://api.empresas.btgpactual.com",
}

SANDBOX = {
    "auth_url": "https://id.sandbox.btgpactual.com/oauth2/authorize",
    "token_url": "https://id.sandbox.btgpactual.com/oauth2/token",
    "api_url": "https://api.sandbox.empresas.btgpactual.com",
}

REDIRECT_PORT = 8765
SCOPES = "openid payments"


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class Recipient:
    name: str
    tax_id: str
    pix_key: str
    amount: float
    description: str


@dataclass
class Config:
    client_id: str
    client_secret: str
    company_id: str  # CNPJ
    debit_account: str
    redirect_uri: str
    debit_branch: str = "50"


# ---------------------------------------------------------------------------
# Config loader
# ---------------------------------------------------------------------------

def load_config() -> Config:
    """Load configuration from environment variables or .env file."""
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())

    required = ["BTG_CLIENT_ID", "BTG_CLIENT_SECRET", "BTG_COMPANY_ID", "BTG_DEBIT_ACCOUNT", "BTG_REDIRECT_URI"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        print(f"Erro: variáveis de ambiente faltando: {', '.join(missing)}")
        print(f"\nCrie o arquivo {ENV_FILE} com:")
        print("  BTG_CLIENT_ID=seu_client_id")
        print("  BTG_CLIENT_SECRET=seu_client_secret")
        print("  BTG_COMPANY_ID=seu_cnpj (só números)")
        print("  BTG_DEBIT_ACCOUNT=sua_conta (ex: 000000050)")
        print("  BTG_DEBIT_BRANCH=50  (opcional, default 50)")
        print("  BTG_REDIRECT_URI=https://seu-dominio.ngrok-free.app/callback")
        sys.exit(1)

    return Config(
        client_id=os.environ["BTG_CLIENT_ID"],
        client_secret=os.environ["BTG_CLIENT_SECRET"],
        company_id=os.environ["BTG_COMPANY_ID"],
        debit_account=os.environ["BTG_DEBIT_ACCOUNT"],
        redirect_uri=os.environ["BTG_REDIRECT_URI"],
        debit_branch=os.environ.get("BTG_DEBIT_BRANCH", "50"),
    )


# ---------------------------------------------------------------------------
# CSV reader
# ---------------------------------------------------------------------------

def read_recipients(csv_path: str) -> list[Recipient]:
    """Read recipients from CSV file."""
    recipients = []
    path = Path(csv_path)

    if not path.exists():
        print(f"Erro: arquivo '{csv_path}' não encontrado.")
        sys.exit(1)

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        expected = {"name", "tax_id", "pix_key", "amount"}
        if not expected.issubset(set(reader.fieldnames or [])):
            print(f"Erro: CSV deve ter colunas: name, tax_id, pix_key, amount, description")
            print(f"  Encontrado: {reader.fieldnames}")
            sys.exit(1)

        for i, row in enumerate(reader, start=2):
            try:
                recipients.append(Recipient(
                    name=row["name"].strip(),
                    tax_id=row["tax_id"].strip().replace(".", "").replace("-", "").replace("/", ""),
                    pix_key=row["pix_key"].strip(),
                    amount=float(row["amount"]),
                    description=row.get("description", "").strip() or "Pix batch payment",
                ))
            except (ValueError, KeyError) as e:
                print(f"Erro na linha {i} do CSV: {e}")
                sys.exit(1)

    if not recipients:
        print("Erro: CSV está vazio (sem destinatários).")
        sys.exit(1)

    return recipients


# ---------------------------------------------------------------------------
# OAuth2 Authorization Code flow
# ---------------------------------------------------------------------------

class CallbackHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler to capture OAuth2 callback."""

    auth_code: Optional[str] = None
    error: Optional[str] = None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if parsed.path == "/callback":
            if "code" in params:
                CallbackHandler.auth_code = params["code"][0]
                self._respond("Autorização concedida! Pode fechar esta aba.")
            else:
                CallbackHandler.error = params.get("error", ["unknown"])[0]
                self._respond(f"Erro na autorização: {CallbackHandler.error}")

    def _respond(self, message: str):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        html = f"""<!DOCTYPE html><html><body style="font-family:sans-serif;
        text-align:center;padding:60px"><h2>{message}</h2></body></html>"""
        self.wfile.write(html.encode())

    def log_message(self, format, *args):
        pass  # Suppress server logs


def authenticate(config: Config, env: dict) -> str:
    """Run OAuth2 Authorization Code flow and return access token."""
    state = secrets.token_urlsafe(32)

    auth_params = urllib.parse.urlencode({
        "client_id": config.client_id,
        "response_type": "code",
        "redirect_uri": config.redirect_uri,
        "scope": SCOPES,
        "state": state,
        "prompt": "login",
    })

    auth_url = f"{env['auth_url']}?{auth_params}"

    # Start local HTTP server (ngrok handles HTTPS externally)
    server = http.server.HTTPServer(("localhost", REDIRECT_PORT), CallbackHandler)
    server_thread = threading.Thread(target=server.handle_request, daemon=True)
    server_thread.start()

    print("\n Abrindo browser para login no BTG Pactual...")
    print(f"  Se não abrir automaticamente, acesse:\n  {auth_url}\n")
    webbrowser.open(auth_url)

    # Wait for callback (timeout 120s)
    server_thread.join(timeout=120)
    server.server_close()

    if CallbackHandler.error:
        print(f"Erro na autorização: {CallbackHandler.error}")
        sys.exit(1)

    if not CallbackHandler.auth_code:
        print("Timeout: não recebeu autorização em 120 segundos.")
        sys.exit(1)

    # Exchange code for token
    print(" Trocando código por access token...")
    credentials = b64encode(f"{config.client_id}:{config.client_secret}".encode()).decode()

    resp = requests.post(
        env["token_url"],
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "grant_type": "authorization_code",
            "code": CallbackHandler.auth_code,
            "redirect_uri": config.redirect_uri,
        },
        timeout=30,
    )

    if resp.status_code != 200:
        print(f"Erro ao obter token: {resp.status_code}")
        print(f"  {resp.text}")
        sys.exit(1)

    token_data = resp.json()
    print(f" Token obtido (expira em {token_data.get('expires_in', '?')}s)")
    return token_data["access_token"]


# ---------------------------------------------------------------------------
# Pix batch payment
# ---------------------------------------------------------------------------

def build_payment_items(
    recipients: list[Recipient],
    config: Config,
    batch_id: str,
    payment_date: str,
) -> list[dict]:
    """Build API payment items from recipient list."""
    items = []
    for r in recipients:
        item = {
            "type": "PIX_KEY",
            "detail": {
                "creditParty": {
                    "name": r.name,
                    "taxId": r.tax_id,
                },
                "key": {
                    "value": r.pix_key,
                },
            },
            "amount": r.amount,
            "debitParty": {
                "branchCode": config.debit_branch,
                "number": config.debit_account,
            },
            "paymentDate": payment_date,
            "description": r.description,
            "agreementId": "INDIVIDUAL_APPROVE",
            "batchId": batch_id,
            "tags": {
                "externalId": str(uuid.uuid4()),
            },
        }
        items.append(item)
    return items


def send_batch(
    token: str,
    config: Config,
    recipients: list[Recipient],
    env: dict,
    payment_date: str,
) -> dict:
    """Send batch Pix payment to BTG API."""
    batch_id = str(uuid.uuid4())
    items = build_payment_items(recipients, config, batch_id, payment_date)

    url = f"{env['api_url']}/{config.company_id}/banking/payments"

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "x-idempotency-key": str(uuid.uuid4()),
        },
        json={"items": items},
        timeout=60,
    )

    if resp.status_code == 201:
        return resp.json()

    print(f"\nErro ao criar pagamentos: {resp.status_code}")
    print(f"  {resp.text}")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="BTG Pactual - Pix Batch Payment",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--csv", required=True, help="CSV file with recipients")
    parser.add_argument("--sandbox", action="store_true", help="Use sandbox environment")
    parser.add_argument("--dry-run", action="store_true", help="Validate CSV without sending")
    parser.add_argument("--date", default=None, help="Payment date (YYYY-MM-DD, default: today)")
    args = parser.parse_args()

    env = SANDBOX if args.sandbox else PRODUCTION
    env_label = "SANDBOX" if args.sandbox else "PRODUCAO"

    # Load config
    config = load_config()

    # Read CSV
    recipients = read_recipients(args.csv)

    # Payment date
    if args.date:
        payment_date = args.date
    else:
        from datetime import date
        payment_date = date.today().isoformat()

    # Summary
    total = sum(r.amount for r in recipients)
    print(f"\n{'='*50}")
    print(f"  BTG Pix Batch - {env_label}")
    print(f"{'='*50}")
    print(f"  Destinatários: {len(recipients)}")
    print(f"  Total:         R$ {total:,.2f}")
    print(f"  Data:          {payment_date}")
    print(f"  Conta débito:  {config.debit_branch}/{config.debit_account}")
    print(f"{'='*50}")

    print("\n  Destinatários:")
    for i, r in enumerate(recipients, 1):
        print(f"    {i}. {r.name} ({r.pix_key}) - R$ {r.amount:,.2f}")

    if args.dry_run:
        print(f"\n  [DRY-RUN] CSV válido. Nenhum pagamento enviado.")
        return

    # Confirm
    print(f"\n  ATENÇÃO: Isso criará {len(recipients)} iniciações de Pix.")
    print("  Você ainda precisará APROVAR no app/internet banking do BTG.")
    confirm = input("\n  Confirmar envio? (s/N): ").strip().lower()
    if confirm != "s":
        print("  Cancelado.")
        return

    # Authenticate
    token = authenticate(config, env)

    # Send batch
    print(f"\n Enviando lote com {len(recipients)} pagamentos...")
    result = send_batch(token, config, recipients, env, payment_date)

    print(f"\n{'='*50}")
    print(f"  LOTE CRIADO COM SUCESSO")
    print(f"{'='*50}")
    print(f"  Batch ID:    {result.get('batchId', 'N/A')}")
    print(f"  Contract:    {result.get('contractGuid', 'N/A')}")
    print(f"  Aprovação:   {'Necessária' if result.get('operationNeedsApproval') else 'Não'}")
    print(f"{'='*50}")
    print(f"\n  Próximo passo: aprovar o lote no app BTG Empresas.")


if __name__ == "__main__":
    main()
