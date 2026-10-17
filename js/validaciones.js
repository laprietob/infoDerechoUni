"use strict";

(() => {
  const INGRESO_MAXIMO_COP = 100000000;
  const PATRON_MUNICIPIO = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.' -]{2,60}$/;

  const extraer_digitos = (texto) => String(texto).replace(/\D/g, "");

  const validar_ingreso = (valor_campo) => {
    const solo_digitos = extraer_digitos(valor_campo);
    if (!solo_digitos) return "Ingrese el ingreso mensual del hogar.";
    const ingreso = parseInt(solo_digitos, 10);
    if (ingreso <= 0) return "El ingreso debe ser mayor a $0.";
    if (ingreso > INGRESO_MAXIMO_COP) return "El ingreso no puede superar $100.000.000 COP.";
    return "";
  };

  const validar_seleccion = (valor_campo) => {
    return valor_campo ? "" : "Seleccione una opción.";
  };

  const validar_municipio = (valor_campo) => {
    const municipio = valor_campo.trim();
    if (!municipio) return "";
    if (!PATRON_MUNICIPIO.test(municipio)) return "Escriba un nombre de municipio válido (solo letras).";
    return "";
  };

  const reglas_por_formulario = {
    "calc-form": {
      "calc-income": validar_ingreso,
      "calc-members": validar_seleccion
    },
    "checklist-form": {
      "check-age": validar_seleccion,
      "check-income": validar_ingreso,
      "check-minors": validar_seleccion,
      "check-dep": validar_seleccion
    },
    "office-finder": {
      "finder-type": validar_seleccion,
      "finder-department": validar_seleccion,
      "finder-town": validar_municipio
    }
  };

  const mostrar_error = (campo, mensaje_error) => {
    const contenedor_campo = campo.closest(".field");
    if (!contenedor_campo) return;

    let elemento_error = contenedor_campo.querySelector(".field__error");
    if (!elemento_error) {
      elemento_error = document.createElement("span");
      elemento_error.className = "field__error";
      elemento_error.id = campo.id + "-error";
      elemento_error.setAttribute("role", "alert");
      contenedor_campo.appendChild(elemento_error);
    }

    elemento_error.textContent = mensaje_error;
    elemento_error.hidden = !mensaje_error;

    if (mensaje_error) {
      campo.setAttribute("aria-invalid", "true");
      campo.setAttribute("aria-describedby", elemento_error.id);
    } else {
      campo.removeAttribute("aria-invalid");
      campo.removeAttribute("aria-describedby");
    }
  };

  const validar_campo = (campo, funcion_validacion) => {
    const mensaje_error = funcion_validacion(campo.value);
    mostrar_error(campo, mensaje_error);
    return !mensaje_error;
  };

  Object.keys(reglas_por_formulario).forEach((id_formulario) => {
    const formulario = document.getElementById(id_formulario);
    if (!formulario) return;

    const reglas_campos = reglas_por_formulario[id_formulario];
    const campos_con_regla = Object.keys(reglas_campos)
      .map((id_campo) => ({ campo: document.getElementById(id_campo), validacion: reglas_campos[id_campo] }))
      .filter((entrada) => entrada.campo);

    campos_con_regla.forEach(({ campo, validacion }) => {
      const evento_cambio = campo.tagName === "SELECT" ? "change" : "blur";
      campo.addEventListener(evento_cambio, () => validar_campo(campo, validacion));
      campo.addEventListener("input", () => {
        if (campo.getAttribute("aria-invalid") === "true") validar_campo(campo, validacion);
      });
    });

    // Se registra en fase de captura para correr antes que main.js y frenar el envío si hay errores.
    document.addEventListener(
      "submit",
      (evento_submit) => {
        if (evento_submit.target !== formulario) return;

        const resultados = campos_con_regla.map(({ campo, validacion }) => validar_campo(campo, validacion));
        const indice_primer_error = resultados.indexOf(false);

        if (indice_primer_error !== -1) {
          evento_submit.preventDefault();
          evento_submit.stopImmediatePropagation();
          campos_con_regla[indice_primer_error].campo.focus();
        }
      },
      true
    );
  });
})();
