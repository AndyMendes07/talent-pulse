"""
Converte a planilha 'Controle Recrutamento GT.xlsx' para vagas.json
e publica no Vercel automaticamente.
"""

import subprocess
import sys
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Caminhos
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).parent
EXCEL = BASE_DIR.parent / "Controle Recrutamento GT.xlsx"
JSON_OUT = BASE_DIR / "src" / "data" / "vagas.json"

# ---------------------------------------------------------------------------
# Conversão Excel → JSON
# ---------------------------------------------------------------------------
def converter():
    import openpyxl
    import json
    from datetime import date as dt_date

    def to_serial(d):
        if d is None:
            return None
        if hasattr(d, "date"):
            d = d.date()
        return (d - dt_date(1899, 12, 30)).days

    wb = openpyxl.load_workbook(EXCEL, data_only=True)
    ws = wb["Base_Geral"]

    vagas = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if all(v is None for v in row) or row[1] is None:
            continue
        vagas.append({
            "nVagas":       str(row[0]) if row[0] is not None else None,
            "status":       row[1],
            "etapa":        row[2],
            "setor":        row[3],
            "gestor":       row[4],
            "cargo":        row[5],
            "tipoVaga":     row[6],
            "local":        row[7],
            "sla":          row[9],
            "diasCorridos": row[10],
            "diasUteis":    row[11],
            "atraso":       row[12],
            "dataAbertura": to_serial(row[13]),
            "dataFechamento": to_serial(row[14]),
            "fonteAprovado": row[29],
            "recrutador":   row[30],
            "motivo":       row[19],
            "linkedin":     row[21],
            "catho":        row[22],
            "indeed":       row[23],
            "siteEmpresa":  row[24],
            "solides":      row[25],
            "indicacao":    row[26],
            "pat":          row[27],
            "outros":       row[28],
        })

    JSON_OUT.write_text(
        json.dumps(vagas, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8"
    )
    print(f"[OK] {len(vagas)} vagas convertidas -> {JSON_OUT}")
    return len(vagas)

# ---------------------------------------------------------------------------
# Deploy Vercel
# ---------------------------------------------------------------------------
def deploy():
    print("[...] Publicando no Vercel...")
    result = subprocess.run(
        "vercel --prod --yes",
        cwd=BASE_DIR,
        shell=True,
    )
    if result.returncode == 0:
        print("[OK] Deploy concluído: https://talent-pulse-omega.vercel.app")
    else:
        print("[ERRO] Falha no deploy. Verifique se o Vercel CLI está logado.")
        sys.exit(1)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if not EXCEL.exists():
        print(f"[ERRO] Planilha não encontrada: {EXCEL}")
        sys.exit(1)

    converter()
    deploy()
