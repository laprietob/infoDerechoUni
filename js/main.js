/* InfoDerecho Colombia – Comportamiento interactivo del portal.
   Estructura bajo buenas prácticas de JavaScript y Clean Code (Ingeniería Web I):
   1. 'use strict' obligatorio.
   2. Ámbito local sin 'var' (uso estricto de 'const' y 'let').
   3. Funciones flecha (=>) para modularizar lógica, cálculos y callbacks.
   4. Parámetros y argumentos explícitos con nombres de contenedores y funciones significativos.
   5. Scripts cargados antes del cierre de </body> en el HTML.
*/

"use strict";

(() => {
  // Constantes de referencia socioeconómica (valores DANE y normatividad vigente)
  const UMBRAL_POBREZA_EXTREMA_COP = 230000; // COP por persona / mes (línea monetaria extrema DANE)
  const SALARIO_MINIMO_LEGAL_VIGENTE_COP = 1423500; // SMMLV en COP

  /* ==========================================================================
     Funciones puras de formateo y cálculo (Clean Code: parámetros y retorno)
     ========================================================================== */

  // Formatea un número al estándar monetario colombiano COP
  const formatear_moneda_cop = (valor_numerico) => {
    return "$" + Math.round(valor_numerico).toLocaleString("es-CO") + " COP";
  };

  // Parsea una cadena de texto extrayendo los dígitos a número entero
  const parsear_texto_a_cop = (texto_con_formato) => {
    const solo_digitos = String(texto_con_formato).replace(/\D/g, "");
    return solo_digitos ? parseInt(solo_digitos, 10) : 0;
  };

  // Calcula el ingreso promedio por miembro del hogar (ejemplo: const calcular_indice = (peso, altura) => ...)
  const calcular_ingreso_por_persona = (ingreso_total, cantidad_miembros) => {
    const divisor = cantidad_miembros > 0 ? cantidad_miembros : 1;
    return ingreso_total / divisor;
  };

  // Verifica si el ingreso per cápita se encuentra por debajo de la línea de pobreza extrema
  const verificar_pobreza_extrema = (ingreso_per_capita, umbral_limite) => {
    return ingreso_per_capita < umbral_limite;
  };

  // Formatea dinámicamente un input monetario con separador de miles mientras el usuario escribe
  const vincular_formato_moneda = (campo_input) => {
    if (!campo_input) return;
    campo_input.addEventListener("input", () => {
      const valor_entero = parsear_texto_a_cop(campo_input.value);
      campo_input.value = valor_entero ? valor_entero.toLocaleString("es-CO") : "";
    });
  };

  /* ==========================================================================
     Módulo 1: Menú de navegación móvil
     ========================================================================== */
  const boton_menu_movil = document.querySelector(".menu-btn");
  const barra_navegacion = document.querySelector(".nav");

  if (boton_menu_movil && barra_navegacion) {
    boton_menu_movil.addEventListener("click", () => {
      const esta_abierto = barra_navegacion.classList.toggle("is-open");
      boton_menu_movil.setAttribute("aria-expanded", String(esta_abierto));
    });
  }

  /* ==========================================================================
     Módulo 2: Menú y panel de Accesibilidad
     ========================================================================== */
  const boton_accesibilidad = document.getElementById("a11y-toggle");
  const menu_accesibilidad = document.getElementById("a11y-menu");

  if (boton_accesibilidad && menu_accesibilidad) {
    const CLAVE_ALMACENAMIENTO_A11Y = "infoderecho-a11y";
    const ESCALAS_DE_TEXTO = [0.9, 1, 1.1, 1.2, 1.3, 1.4];
    const INDICE_ESCALA_POR_DEFECTO = 1; // 100%

    const elemento_estado_a11y = document.getElementById("a11y-status");
    const elemento_raiz_documento = document.documentElement;

    const boton_aumentar_texto = menu_accesibilidad.querySelector('[data-a11y="increase"]');
    const boton_disminuir_texto = menu_accesibilidad.querySelector('[data-a11y="decrease"]');
    const boton_alto_contraste = menu_accesibilidad.querySelector('[data-a11y="contrast"]');
    const boton_restablecer_a11y = menu_accesibilidad.querySelector('[data-a11y="reset"]');

    const estado_accesibilidad = {
      paso_escala: INDICE_ESCALA_POR_DEFECTO,
      alto_contraste: false
    };

    try {
      const configuracion_guardada = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO_A11Y) || "{}");
      if (typeof configuracion_guardada.step === "number" && ESCALAS_DE_TEXTO[configuracion_guardada.step]) {
        estado_accesibilidad.paso_escala = configuracion_guardada.step;
      }
      estado_accesibilidad.alto_contraste = configuracion_guardada.contrast === true;
    } catch (error_lectura) {
      // Uso de valores por defecto si no hay almacenamiento
    }

    const aplicar_accesibilidad = (mensaje_notificacion) => {
      const escala_seleccionada = ESCALAS_DE_TEXTO[estado_accesibilidad.paso_escala];
      elemento_raiz_documento.style.setProperty("--text-scale", escala_seleccionada);
      elemento_raiz_documento.classList.toggle("high-contrast", estado_accesibilidad.alto_contraste);

      boton_alto_contraste.setAttribute("aria-pressed", String(estado_accesibilidad.alto_contraste));
      boton_aumentar_texto.setAttribute("aria-disabled", String(estado_accesibilidad.paso_escala === ESCALAS_DE_TEXTO.length - 1));
      boton_disminuir_texto.setAttribute("aria-disabled", String(estado_accesibilidad.paso_escala === 0));

      if (elemento_estado_a11y && mensaje_notificacion) {
        elemento_estado_a11y.textContent = mensaje_notificacion;
      }

      try {
        localStorage.setItem(
          CLAVE_ALMACENAMIENTO_A11Y,
          JSON.stringify({
            step: estado_accesibilidad.paso_escala,
            contrast: estado_accesibilidad.alto_contraste
          })
        );
      } catch (error_guardado) {}
    };

    const generar_mensaje_tamano_texto = () => {
      const porcentaje = Math.round(ESCALAS_DE_TEXTO[estado_accesibilidad.paso_escala] * 100);
      return `Tamaño del texto: ${porcentaje} %`;
    };

    const alternar_menu_accesibilidad = (mostrar_menu) => {
      menu_accesibilidad.hidden = !mostrar_menu;
      boton_accesibilidad.setAttribute("aria-expanded", String(mostrar_menu));
    };

    boton_accesibilidad.addEventListener("click", () => {
      alternar_menu_accesibilidad(menu_accesibilidad.hidden);
    });

    boton_aumentar_texto.addEventListener("click", () => {
      if (estado_accesibilidad.paso_escala < ESCALAS_DE_TEXTO.length - 1) {
        estado_accesibilidad.paso_escala++;
        aplicar_accesibilidad(generar_mensaje_tamano_texto());
      }
    });

    boton_disminuir_texto.addEventListener("click", () => {
      if (estado_accesibilidad.paso_escala > 0) {
        estado_accesibilidad.paso_escala--;
        aplicar_accesibilidad(generar_mensaje_tamano_texto());
      }
    });

    boton_alto_contraste.addEventListener("click", () => {
      estado_accesibilidad.alto_contraste = !estado_accesibilidad.alto_contraste;
      const estado_texto = estado_accesibilidad.alto_contraste ? "activado" : "desactivado";
      aplicar_accesibilidad(`Alto contraste ${estado_texto}`);
    });

    boton_restablecer_a11y.addEventListener("click", () => {
      estado_accesibilidad.paso_escala = INDICE_ESCALA_POR_DEFECTO;
      estado_accesibilidad.alto_contraste = false;
      aplicar_accesibilidad("Accesibilidad restablecida");
    });

    document.addEventListener("click", (evento_click) => {
      if (!menu_accesibilidad.hidden && !menu_accesibilidad.parentNode.contains(evento_click.target)) {
        alternar_menu_accesibilidad(false);
      }
    });

    document.addEventListener("keydown", (evento_teclado) => {
      if (evento_teclado.key === "Escape" && !menu_accesibilidad.hidden) {
        alternar_menu_accesibilidad(false);
        boton_accesibilidad.focus();
      }
    });

    aplicar_accesibilidad();
  }

  /* ==========================================================================
     Módulo 3: Navegación de una sola página (SPA con Hash y ScrollSpy)
     ========================================================================== */
  const pestañas_navegacion = Array.from(document.querySelectorAll(".nav__tab[href^='#']"));

  if (pestañas_navegacion.length > 0) {
    const establecer_pestaña_activa = (id_seccion_activa) => {
      pestañas_navegacion.forEach((pestaña) => {
        const es_activa = pestaña.getAttribute("href") === "#" + id_seccion_activa;
        pestaña.classList.toggle("is-active", es_activa);
        if (es_activa) {
          pestaña.setAttribute("aria-current", "page");
        } else {
          pestaña.removeAttribute("aria-current");
        }
      });
    };

    pestañas_navegacion.forEach((pestaña) => {
      pestaña.addEventListener("click", () => {
        if (barra_navegacion) barra_navegacion.classList.remove("is-open");
        if (boton_menu_movil) boton_menu_movil.setAttribute("aria-expanded", "false");
      });
    });

    const secciones_pagina = pestañas_navegacion
      .map((pestaña) => document.getElementById(pestaña.getAttribute("href").slice(1)))
      .filter(Boolean);

    const sincronizar_scroll_con_pestañas = () => {
      const linea_marcador = window.scrollY + 120;
      let seccion_actual = secciones_pagina[0];

      secciones_pagina.forEach((seccion) => {
        if (seccion.offsetTop <= linea_marcador) {
          seccion_actual = seccion;
        }
      });

      // Al llegar al final de la página, activa la última sección
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        seccion_actual = secciones_pagina[secciones_pagina.length - 1];
      }

      if (seccion_actual) {
        establecer_pestaña_activa(seccion_actual.id);
      }
    };

    window.addEventListener("scroll", sincronizar_scroll_con_pestañas, { passive: true });
    window.addEventListener("resize", sincronizar_scroll_con_pestañas);
    sincronizar_scroll_con_pestañas();
  }

  /* ==========================================================================
     Módulo 4: Directorio de programas (búsqueda y filtros interactivos)
     ========================================================================== */
  const campo_busqueda_programa = document.getElementById("program-search");
  const tarjetas_programas = Array.from(document.querySelectorAll(".program"));

  if (campo_busqueda_programa && tarjetas_programas.length > 0) {
    const botones_filtros_chips = Array.from(document.querySelectorAll(".chip"));
    const mensaje_sin_resultados = document.getElementById("programs-empty");
    let filtro_activo = "all";

    const filtrar_tarjetas_programas = () => {
      const consulta_texto = campo_busqueda_programa.value.trim().toLowerCase();
      let total_tarjetas_visibles = 0;

      tarjetas_programas.forEach((tarjeta) => {
        const etiquetas_tarjeta = (tarjeta.dataset.tags || "").split(" ");
        const coincide_filtro = filtro_activo === "all" || etiquetas_tarjeta.includes(filtro_activo);
        const coincide_texto = !consulta_texto || tarjeta.textContent.toLowerCase().includes(consulta_texto);
        const debe_mostrar = coincide_filtro && coincide_texto;

        tarjeta.hidden = !debe_mostrar;
        if (debe_mostrar) total_tarjetas_visibles++;
      });

      if (mensaje_sin_resultados) {
        mensaje_sin_resultados.hidden = total_tarjetas_visibles !== 0;
      }
    };

    campo_busqueda_programa.addEventListener("input", filtrar_tarjetas_programas);

    botones_filtros_chips.forEach((boton_chip) => {
      boton_chip.addEventListener("click", () => {
        botones_filtros_chips.forEach((chip) => chip.classList.remove("is-active"));
        boton_chip.classList.add("is-active");
        filtro_activo = boton_chip.dataset.filter;
        filtrar_tarjetas_programas();
      });
    });
  }

  /* ==========================================================================
     Módulo 5: Calculadora de línea de pobreza extrema
     ========================================================================== */
  const formulario_calculadora = document.getElementById("calc-form");

  if (formulario_calculadora) {
    const campo_ingreso_calculadora = document.getElementById("calc-income");
    const selector_miembros_calculadora = document.getElementById("calc-members");
    const contenedor_resultado_calculadora = document.getElementById("calc-result");
    const texto_monto_por_persona = document.getElementById("calc-amount");
    const titulo_mensaje_calculadora = document.getElementById("calc-message-title");
    const cuerpo_mensaje_calculadora = document.getElementById("calc-message-body");

    vincular_formato_moneda(campo_ingreso_calculadora);

    const ejecutar_simulacion_pobreza = () => {
      const ingreso_total = parsear_texto_a_cop(campo_ingreso_calculadora.value);
      const total_miembros = parseInt(selector_miembros_calculadora.value, 10) || 1;

      // Parámetros pasados a funciones de cálculo limpias
      const ingreso_per_capita = calcular_ingreso_por_persona(ingreso_total, total_miembros);
      const esta_bajo_umbral = verificar_pobreza_extrema(ingreso_per_capita, UMBRAL_POBREZA_EXTREMA_COP);

      texto_monto_por_persona.textContent = formatear_moneda_cop(ingreso_per_capita);
      contenedor_resultado_calculadora.classList.toggle("result--warn", !esta_bajo_umbral);

      if (esta_bajo_umbral) {
        titulo_mensaje_calculadora.textContent = "Su hogar se encuentra por debajo del umbral oficial de pobreza extrema.";
        cuerpo_mensaje_calculadora.textContent =
          "El costo de vida mínimo de subsistencia alimentaria por persona se calcula oficialmente por debajo de la línea establecida. Le recomendamos consultar de manera prioritaria el directorio de programas de ayuda del Estado.";
      } else {
        titulo_mensaje_calculadora.textContent = "Su hogar se encuentra por encima del umbral de pobreza extrema.";
        cuerpo_mensaje_calculadora.textContent =
          "Aun así, puede cumplir requisitos de otros programas según su perfil. Revise el directorio de programas o complete el checklist de elegibilidad.";
      }

      contenedor_resultado_calculadora.hidden = false;
    };

    formulario_calculadora.addEventListener("submit", (evento_submit) => {
      evento_submit.preventDefault();
      ejecutar_simulacion_pobreza();
    });

    ejecutar_simulacion_pobreza();
  }

  /* ==========================================================================
     Módulo 6: Checklist de elegibilidad de programas sociales
     ========================================================================== */
  const formulario_checklist = document.getElementById("checklist-form");

  if (formulario_checklist) {
    const campo_edad_checklist = document.getElementById("check-age");
    const campo_ingreso_checklist = document.getElementById("check-income");
    const campo_menores_checklist = document.getElementById("check-minors");
    const contenedor_resultado_checklist = document.getElementById("check-result");
    const lista_resultado_checklist = document.getElementById("check-result-list");
    const titulo_resultado_checklist = document.getElementById("check-result-title");
    const boton_regresar_checklist = document.getElementById("check-back");

    vincular_formato_moneda(campo_ingreso_checklist);

    // Reglas de negocio expresadas como funciones flecha puras
    const reglas_elegibilidad = [
      {
        nombre: "Renta Ciudadana (Familias en Acción)",
        evaluar: (perfil) => perfil.menores > 0 && perfil.ingreso < SALARIO_MINIMO_LEGAL_VIGENTE_COP
      },
      {
        nombre: "Devolución del IVA",
        evaluar: (perfil) => perfil.ingreso < SALARIO_MINIMO_LEGAL_VIGENTE_COP
      },
      {
        nombre: "Colombia Mayor",
        evaluar: (perfil) => perfil.edad === "60+" && perfil.ingreso < SALARIO_MINIMO_LEGAL_VIGENTE_COP
      },
      {
        nombre: "Jóvenes en Paz",
        evaluar: (perfil) => perfil.edad === "18-29"
      },
      {
        nombre: "Mi Casa Ya",
        evaluar: (perfil) => perfil.ingreso < 4 * SALARIO_MINIMO_LEGAL_VIGENTE_COP
      },
      {
        nombre: "Jóvenes Propietarios",
        evaluar: (perfil) => perfil.edad === "18-29" && perfil.ingreso < 2 * SALARIO_MINIMO_LEGAL_VIGENTE_COP
      }
    ];

    formulario_checklist.addEventListener("submit", (evento_submit) => {
      evento_submit.preventDefault();

      const perfil_usuario = {
        edad: campo_edad_checklist.value,
        ingreso: parsear_texto_a_cop(campo_ingreso_checklist.value),
        menores: parseInt(campo_menores_checklist.value, 10) || 0
      };

      const programas_coincidentes = reglas_elegibilidad.filter((regla) => regla.evaluar(perfil_usuario));

      lista_resultado_checklist.textContent = "";
      programas_coincidentes.forEach((regla) => {
        const elemento_item = document.createElement("li");
        elemento_item.textContent = regla.nombre;
        lista_resultado_checklist.appendChild(elemento_item);
      });

      titulo_resultado_checklist.textContent = programas_coincidentes.length > 0
        ? "Programas que podrían aplicar a su hogar"
        : "No encontramos programas con los datos ingresados";

      contenedor_resultado_checklist.hidden = false;
      contenedor_resultado_checklist.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    if (boton_regresar_checklist) {
      boton_regresar_checklist.addEventListener("click", () => {
        const seccion_inicio = document.getElementById("inicio");
        if (seccion_inicio) {
          seccion_inicio.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = "../index.html";
        }
      });
    }
  }
})();
