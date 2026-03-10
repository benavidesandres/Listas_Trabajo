class Pedido {
  id: number;
  nombre: string;
  precio: number;

  constructor(nombre: string, precio: number) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.nombre = nombre;
    this.precio = precio;
  }
}

class Restaurante {
  private lista: Pedido[] = [];

  agregar(p: Pedido): string {
    this.lista.push(p);
    return `"${p.nombre}" agregado 🎉`;
  }

  buscar(nombre: string): Pedido | undefined {
    return this.lista.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
  }

  eliminar(nombre: string): { ok: boolean; msg: string } {
    const antes = this.lista.length;
    this.lista = this.lista.filter(p => p.nombre.toLowerCase() !== nombre.toLowerCase());
    return this.lista.length < antes
      ? { ok: true, msg: `"${nombre}" eliminado 🗑️` }
      : { ok: false, msg: `"${nombre}" no existe` };
  }

  eliminarPorId(id: number): { ok: boolean; msg: string } {
    const p = this.lista.find(x => x.id === id);
    if (!p) return { ok: false, msg: "Pedido no encontrado" };
    this.lista = this.lista.filter(x => x.id !== id);
    return { ok: true, msg: `"${p.nombre}" eliminado 🗑️` };
  }

  modificar(nombre: string, nuevoPrecio: number): { ok: boolean; msg: string } {
    const p = this.buscar(nombre);
    if (!p) return { ok: false, msg: `"${nombre}" no existe` };
    p.precio = nuevoPrecio;
    return { ok: true, msg: `"${nombre}" actualizado a $${nuevoPrecio.toLocaleString()} ` };
  }

  ordenar(): string {
    this.lista.sort((a, b) => a.precio - b.precio);
    return "Ordenados por precio ↑";
  }

  get pedidos(): Pedido[] { return this.lista; }
  get total(): number { return this.lista.reduce((s, p) => s + p.precio, 0); }
  get promedio(): number { return this.lista.length ? this.total / this.lista.length : 0; }
}

// ── UI ────────────────────────────────────────────────────────

const restaurante = new Restaurante();

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}
function input(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value.trim();
}
function clearInputs(): void {
  (document.getElementById("nombre") as HTMLInputElement).value = "";
  (document.getElementById("precio") as HTMLInputElement).value = "";
}

// Toast
function toast(msg: string, tipo: "ok" | "err" | "info" = "ok"): void {
  const container = $("toasts");
  const el = document.createElement("div");
  el.className = `toast toast-${tipo}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.classList.add("hide"), 2600);
  setTimeout(() => el.remove(), 3000);
}

// Render
function render(): void {
  const lista = document.getElementById("lista") as HTMLUListElement;
  const pedidos = restaurante.pedidos;

  $("stat-count").textContent = String(pedidos.length);
  $("stat-total").textContent = `$${restaurante.total.toLocaleString("es-CO")}`;
  $("stat-avg").textContent = pedidos.length
    ? `$${Math.round(restaurante.promedio).toLocaleString("es-CO")}`
    : "$0";

  const empty = $("empty");
  empty.style.display = pedidos.length === 0 ? "block" : "none";
  lista.innerHTML = "";

  pedidos.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.animationDelay = `${i * 0.05}s`;
    li.innerHTML = `
      <span class="item-num">${i + 1}</span>
      <span class="item-name">${p.nombre}</span>
      <span class="item-price">$${p.precio.toLocaleString("es-CO")}</span>
      <button class="item-del" data-id="${p.id}" title="Eliminar">✕</button>
    `;
    lista.appendChild(li);
  });

  // bind del buttons
  lista.querySelectorAll<HTMLButtonElement>(".item-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const r = restaurante.eliminarPorId(id);
      toast(r.msg, r.ok ? "ok" : "err");
      render();
    });
  });
}

// Button actions
function agregar(): void {
  const nombre = input("nombre");
  const precio = parseFloat((document.getElementById("precio") as HTMLInputElement).value);
  if (!nombre) { toast("Escribe un nombre ", "err"); return; }
  if (isNaN(precio) || precio <= 0) { toast("Precio inválido ", "err"); return; }
  toast(restaurante.agregar(new Pedido(nombre, precio)), "ok");
  clearInputs();
  render();
}

function buscar(): void {
  const nombre = input("nombre");
  if (!nombre) { toast("¿Qué buscas? ", "err"); return; }
  const p = restaurante.buscar(nombre);
  p
    ? toast(`Encontrado: ${p.nombre} — $${p.precio.toLocaleString("es-CO")} `, "info")
    : toast(`"${nombre}" no está aquí `, "err");
}

function eliminar(): void {
  const nombre = input("nombre");
  if (!nombre) { toast("Escribe el nombre a eliminar", "err"); return; }
  const r = restaurante.eliminar(nombre);
  toast(r.msg, r.ok ? "ok" : "err");
  render();
}

function modificar(): void {
  const nombre = input("nombre");
  const precio = parseFloat((document.getElementById("precio") as HTMLInputElement).value);
  if (!nombre) { toast("Escribe el nombre del pedido", "err"); return; }
  if (isNaN(precio) || precio <= 0) { toast("Ingresa el nuevo precio", "err"); return; }
  const r = restaurante.modificar(nombre, precio);
  toast(r.msg, r.ok ? "ok" : "err");
  render();
}

function ordenar(): void {
  toast(restaurante.ordenar(), "info");
  render();
}

// Enter key
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") agregar();
});

// Bind buttons after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  $("btn-agregar").addEventListener("click", agregar);
  $("btn-buscar").addEventListener("click", buscar);
  $("btn-eliminar").addEventListener("click", eliminar);
  $("btn-modificar").addEventListener("click", modificar);
  $("btn-ordenar").addEventListener("click", ordenar);
  render();
});
