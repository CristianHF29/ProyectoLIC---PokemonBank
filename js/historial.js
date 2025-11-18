// Este archivo se encarga de leer las transacciones guardadas
// en localStorage y mostrarlas en la tabla del historial, con
// la opción de filtrarlas por tipo y por rango de fechas.

function cargarTransacciones() {
    const data = localStorage.getItem("transacciones");
    return data ? JSON.parse(data) : [];
}

function formatearFecha(iso) {
    if (!iso) return "Sin fecha";
    const fecha = new Date(iso);
    return fecha.toLocaleString("es-SV", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function crearFilaTransaccion(t) {
    const tr = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = formatearFecha(t.fecha);

    const tdTipo = document.createElement("td");
    tdTipo.textContent = t.tipo || "Sin tipo";

    const tdMonto = document.createElement("td");
    tdMonto.classList.add("text-end");

    let textoMonto = `$ ${Number(t.monto || 0).toFixed(2)}`;

    // Depósitos en verde con +
    if (t.tipo && t.tipo.toLowerCase().includes("depósito")) {
        tdMonto.classList.add("text-success");
        textoMonto = `+ $ ${Number(t.monto || 0).toFixed(2)}`;
    }

    // Retiros y pagos en rojo con -
    if (t.tipo && (t.tipo.toLowerCase().includes("retiro") || t.tipo.toLowerCase().includes("pago"))) {
        tdMonto.classList.add("text-danger");
        textoMonto = `- $ ${Number(t.monto || 0).toFixed(2)}`;
    }

    tdMonto.textContent = textoMonto;

    const tdDetalle = document.createElement("td");
    tdDetalle.textContent = t.detalle || "";

    tr.appendChild(tdFecha);
    tr.appendChild(tdTipo);
    tr.appendChild(tdMonto);
    tr.appendChild(tdDetalle);

    return tr;
}

// Renderiza en la tabla la lista que reciba.
// Si no se le pasa nada, usa todas las transacciones.
function poblarHistorial(listaTransacciones) {
    const cuerpo = document.getElementById("tbodyHistorial");
    if (!cuerpo) return;

    cuerpo.innerHTML = "";

    const transacciones = listaTransacciones && listaTransacciones.length >= 0
        ? listaTransacciones
        : cargarTransacciones();

    if (!transacciones || transacciones.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.classList.add("text-center", "text-muted");
        td.textContent = "No hay transacciones para mostrar.";
        tr.appendChild(td);
        cuerpo.appendChild(tr);
        return;
    }

    // De más reciente a más antigua
    transacciones.sort((a, b) => {
        const fechaA = new Date(a.fecha).getTime();
        const fechaB = new Date(b.fecha).getTime();
        return fechaB - fechaA;
    });

    transacciones.forEach((t) => {
        const fila = crearFilaTransaccion(t);
        cuerpo.appendChild(fila);
    });
}

// Aplica los filtros de tipo y fecha y vuelve a dibujar la tabla
function aplicarFiltros() {
    const todas = cargarTransacciones();

    const selectTipo = document.getElementById("filtroTipo");
    const inputDesde = document.getElementById("filtroDesde");
    const inputHasta = document.getElementById("filtroHasta");

    const tipoSeleccionado = selectTipo ? selectTipo.value : "";
    const desdeStr = inputDesde ? inputDesde.value : "";
    const hastaStr = inputHasta ? inputHasta.value : "";

    // Convierto las fechas del filtro a objetos Date para poder comparar
    const fechaDesde = desdeStr ? new Date(desdeStr + "T00:00:00") : null;
    const fechaHasta = hastaStr ? new Date(hastaStr + "T23:59:59") : null;

    const filtradas = todas.filter((t) => {
        const fechaTransaccion = t.fecha ? new Date(t.fecha) : null;

        // --- Filtro por tipo ---
        if (tipoSeleccionado) {
            const tipoLower = (t.tipo || "").toLowerCase();

            if (tipoSeleccionado === "deposito" && !tipoLower.includes("depósito")) {
                return false;
            }
            if (tipoSeleccionado === "retiro" && !tipoLower.includes("retiro")) {
                return false;
            }
        }

        // --- Filtro por fechas ---
        if (fechaDesde && fechaTransaccion && fechaTransaccion < fechaDesde) {
            return false;
        }
        if (fechaHasta && fechaTransaccion && fechaTransaccion > fechaHasta) {
            return false;
        }

        // Si pasa todos los filtros, se queda
        return true;
    });

    poblarHistorial(filtradas);
}

// Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
    // Primero mostrarmos todo sin filtros
    poblarHistorial();

    const btnBuscar = document.getElementById("btnBuscar");
    if (btnBuscar) {
        btnBuscar.addEventListener("click", (e) => {
            e.preventDefault(); // por si acaso
            aplicarFiltros();
        });
    }
});

