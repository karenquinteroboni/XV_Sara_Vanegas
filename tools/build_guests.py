"""Lee INVITADOS.xlsx y genera guests.json (para la web) y links.csv (para enviar)."""
import csv, hashlib, json, sys
import openpyxl

SALT = "sara-xv-2026"
# Invitados renombrados: el código se sigue calculando con el nombre anterior para que su enlace personal no cambie.
NOMBRE_ANTERIOR = {
    "Sr. Andrey Vergara, esposa, hijo e hija": "Sr. Andrey Vergara y esposa",
    "Sr. Nelson Botero, esposa e hija": "Sr. Nelson Botero y esposa",
    "Sr. Gabriel Pérez, esposa e hijo": "Sr. Gabriel Pérez y esposa",
    "Sr. Fernando Valderrama, esposa e hijos": "Sr. Fernando Valderrama y esposa",
}
BASE = sys.argv[1] if len(sys.argv) > 1 else "https://www.xn--saravalentinamisxvaos-ubc.com/"

ws = openpyxl.load_workbook("INVITADOS.xlsx").active
guests, rows, seen = {}, [], set()
for nombre, cupos in list(ws.iter_rows(values_only=True))[1:]:
    if not nombre:
        continue
    nombre, cupos = str(nombre).strip(), int(cupos or 1)
    code = hashlib.sha256(f"{SALT}|{NOMBRE_ANTERIOR.get(nombre, nombre)}".encode()).hexdigest()[:6]
    assert code not in seen, f"colisión: {nombre}"
    seen.add(code)
    guests[code] = {"n": nombre, "c": cupos}
    rows.append([nombre, cupos, code, f"{BASE}?i={code}"])

json.dump(guests, open("guests.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open("links.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f)
    w.writerow(["Nombre", "Cupos", "Código", "Enlace personal"])
    w.writerows(rows)
print(len(rows), "invitados,", sum(g["c"] for g in guests.values()), "cupos")
