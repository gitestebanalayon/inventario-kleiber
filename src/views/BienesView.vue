<script setup>
// agrega onBeforeUnmount, computed, watch si no estaban
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import axios from 'axios';
import FooterPage from '@/components/page/footer/Component.vue';
import HeaderPage from '@/components/page/header/Component.vue';
import { IconEdit } from '@tabler/icons-vue'
import { Toast } from 'bootstrap'
const BASE_URL = import.meta.env.VITE_BASE_URL;

// === Estado ===
const bienes = ref([]);
const showCrear = ref(false)
const categorias = ref([]);
const modelos = ref([])
const loadingCrear = ref(false);
const toastSuccess = ref(null)
const errorCrear = ref(null)

//flags paginación

// NUEVO
const loadingLista = ref(false)
const errorLista = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)


// flags para editar
const isEdit = ref(false)
const idEdit = ref(null)
const toastMessage = ref('✅ Bien creado correctamente')

// formulario reactivo
const form = reactive({
  cod_bien: '',
  categoria_id: '',
  modelo_id: '',
  tipo_uso: '',
  valor_unitario: '',
  condicion: '',
  estatus: 'Incorporado',
  fecha_adquisicion: '',
  caracteristicas: ''
})

// estado inicial para limpiar/rellenar
const initialForm = {
  cod_bien: '',
  categoria_id: '',
  modelo_id: '',
  tipo_uso: '',
  valor_unitario: '',
  condicion: '',
  estatus: 'Incorporado',
  fecha_adquisicion: '',
  caracteristicas: ''
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
)

// NUEVO: pedir datos paginados
const fetchBienes = async () => {
  loadingLista.value = true
  errorLista.value = ''
  try {
    const { data } = await axios.get(`${BASE_URL}bienes/listar`, {
      params: { page: page.value, page_size: pageSize.value, q: search.value?.trim() || '' }
    })
    bienes.value = data.results
    total.value = data.total
  } catch (e) {
    errorLista.value = 'No se pudo cargar la lista'
  } finally {
    loadingLista.value = false
  }
}


// reemplaza tu onMounted original:
onMounted(async () => {
  try {
    await fetchBienes() // 👈 ahora pide página 1
    const { data: cats } = await axios.get(`${BASE_URL}categoria/`);
    categorias.value = cats;
    const { data: mods } = await axios.get(`${BASE_URL}modelo/`);
    modelos.value = mods;
  } catch (error) {
    console.error("Error al obtener datos", error);
  }
})

// cuando cambie page o pageSize, vuelve a cargar
watch([page, pageSize], fetchBienes)


// helpers de navegación
const goTo = (p) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p
}

// === Abrir modal limpio (Crear) ===
const abrirModal = () => {
  Object.assign(form, initialForm);
  errorCrear.value = '';
  isEdit.value = false;
  idEdit.value = null;
  toastMessage.value = '✅ Bien creado correctamente';
  showCrear.value = true;
};

const mostrarToast = () => {
  const toastEl = toastSuccess.value
  const toast = new Toast(toastEl, { delay: 4000 })
  toast.show()
}

// === Abrir modal con datos (Editar) ===
const editarBien = (bien) => {
  // Intenta mapear IDs si el backend devolvió textos
  const catId = bien.categoria_id ?? (categorias.value.find(c => c.descripcion === bien.categoria)?.id ?? '')
  const modId = bien.modelo_id ?? (modelos.value.find(m => m.descripcion === bien.modelo)?.id ?? '')

  Object.assign(form, {
    cod_bien: bien.cod_bien ?? '',
    categoria_id: catId,
    modelo_id: modId,
    tipo_uso: bien.tipo_uso ?? '',
    valor_unitario: bien.valor_unitario ?? '',
    condicion: bien.condicion ?? '',
    estatus: bien.estatus ?? 'Incorporado',
    fecha_adquisicion: (bien.fecha_adquisicion ?? '').slice(0, 10),
    caracteristicas: bien.caracteristicas ?? ''
  })

  errorCrear.value = ''
  isEdit.value = true
  idEdit.value = bien.id
  toastMessage.value = '✅ Bien actualizado correctamente'
  showCrear.value = true
}

// === Guardar (crear/editar) ===
const guardarBien = async () => {
  errorCrear.value = '';
  loadingCrear.value = true;

  try {
    if (isEdit.value && idEdit.value) {
      // EDITAR
      const { data: actualizado } = await axios.put(`${BASE_URL}bienes/editar/${idEdit.value}`, form)
      await fetchBienes()
    } else {
      // CREAR
      const { data: creado } = await axios.post(`${BASE_URL}bienes/crear`, form);
      await fetchBienes()
    }

    showCrear.value = false;
    Object.assign(form, initialForm);
    mostrarToast();
  } catch (error) {
    console.error(isEdit.value ? "Error al actualizar bien" : "Error al crear bien", error);
    errorCrear.value = error.response?.data?.detail || 'Error al guardar';
  } finally {
    loadingCrear.value = false;
  }
};



// debajo de totalPages
const pageWindow = computed(() => {
  const tp = totalPages.value
  if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1)
  const start = Math.max(1, Math.min(page.value - 2, tp - 4))
  return [start, start + 1, start + 2, start + 3, start + 4]
})


// 🔎 búsqueda
const search = ref('')

// ⌨️ ref al input para el atajo
const searchInputEl = ref(null)

// util debounce (sin librerías)
function debounce(fn, delay = 400) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  fetchBienes()
}, 400)

watch(search, () => debouncedSearch())


</script>

<template>
  <main class="page-wrapper">
    <!-- Page header -->
    <HeaderPage :icon="['fas', 'box']" text="Bienes" />

    <div class="page-body mt-3 mb-3">
      <div class="container-xl">
        <div class="card">
          <!-- Toast -->
          <div class="toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3"
            role="alert" aria-live="assertive" aria-atomic="true" ref="toastSuccess">
            <div class="d-flex">
              <div class="toast-body">
                {{ toastMessage }}
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                aria-label="Close"></button>
            </div>
          </div>

          <div class="alert alert-danger alert-dismissible" role="alert" v-if="errorCrear">
            <div class="d-flex">
              <div>
                ⚠️ {{ errorCrear }}
              </div>
              <a class="btn-close" data-bs-dismiss="alert" aria-label="close" @click="errorCrear = false"></a>
            </div>
          </div>

          <div class="card-header">
            <div class="row w-full">
              <div class="col">
                <p class="text-secondary m-0">Listado de Bienes</p>
              </div>
              <div class="col-md-auto col-sm-12">
                <div class="ms-auto d-flex flex-wrap btn-list">
                  <div class="input-group input-group-flat w-auto">
                    <span class="input-group-text">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="icon icon-1">
                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                        <path d="M21 21l-6 -6" />
                      </svg>
                    </span>

                    <!-- 🔎 conecta v-model y ref para Ctrl/⌘+K -->
                    <input id="advanced-table-search" type="text" class="form-control" autocomplete="off"
                      placeholder="Buscar… (Ctrl/⌘ + K)" v-model.trim="search" ref="searchInputEl" />

                    <!-- botón limpiar -->
                    <button class="input-group-text btn btn-link px-2" v-if="search" @click.prevent="search = ''"
                      title="Limpiar búsqueda">
                      ×
                    </button>

                    <span class="input-group-text">
                      <kbd>ctrl + K</kbd>
                    </span>
                  </div>

                  <a href="#" class="btn btn-icon" aria-label="Button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-1">
                      <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    </svg>
                  </a>
                  <a href="#" class="btn btn-0" title="Agregar bien" @click.prevent="abrirModal">Agregar</a>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-vcenter card-table table-striped">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Modelo</th>
                  <th>Condición</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="bien in bienes" :key="bien.id">
                  <td>{{ bien.cod_bien }}</td>
                  <td>{{ bien.categoria }}</td>
                  <td>{{ bien.modelo }}</td>
                  <td>{{ bien.condicion }}</td>
                  <td>
                    <span :class="[
                      'badge',
                      bien.estatus === 'Asignado'
                        ? 'bg-success-lt'
                        : bien.estatus === 'Incorporado'
                          ? 'bg-primary-lt'
                          : bien.estatus === 'Desincorporado'
                            ? 'bg-danger-lt'
                            : 'bg-warning-lt'
                    ]">
                      {{ bien.estatus }}
                    </span>
                  </td>
                  <td>{{ bien.fecha_adquisicion }}</td>
                  <td>
                    <a class="btn btn-action" @click.prevent="editarBien(bien)" title="Editar">
                      <IconEdit size="20" stroke-width="1.5" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex align-items-center justify-content-between p-3">
              <div class="d-flex gap-2 align-items-center">
                <span>Mostrar:</span>
                <select class="form-select w-auto" v-model.number="pageSize">
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
                <span class="text-secondary">
                  {{ bienes.length ? (page - 1) * pageSize + 1 : 0 }}–{{ (page - 1) * pageSize + bienes.length }}
                  de {{ total }}
                </span>
              </div>

              <nav aria-label="Paginación">
                <ul class="pagination m-0">
                  <li class="page-item" :class="{ disabled: page === 1 }">
                    <a class="page-link" href="#" @click.prevent="goTo(page - 1)">«</a>
                  </li>

                  <!-- ventana corta de páginas: actual ±2 -->
                  <li v-for="p in pageWindow" :key="p" class="page-item" :class="{ active: p === page }">
                    <a class="page-link" href="#" @click.prevent="goTo(p)">{{ p }}</a>
                  </li>


                  <li class="page-item" :class="{ disabled: page === totalPages }">
                    <a class="page-link" href="#" @click.prevent="goTo(page + 1)">»</a>
                  </li>
                </ul>
              </nav>
            </div>

          </div>
        </div>

        <!-- Modal reutilizable Crear/Editar -->
        <div v-if="showCrear" class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
          <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content card">
              <div class="card-header">
                <h3 class="card-title m-0">{{ isEdit ? 'Editar bien' : 'Nuevo bien' }}</h3>
                <button type="button" class="btn-close" aria-label="Close" @click="showCrear = false"></button>
              </div>

              <div class="card-body">
                <div v-if="errorCrear" class="alert alert-danger">{{ errorCrear }}</div>

                <div class="row g-2">
                  <!-- Código -->
                  <div class="col-md-4">
                    <label class="form-label">Código *</label>
                    <input v-model="form.cod_bien" class="form-control" />
                  </div>

                  <!-- Categoría -->
                  <div class="col-md-4">
                    <label class="form-label">Categoría *</label>
                    <select v-model="form.categoria_id" class="form-select">
                      <option value="" disabled>Selecciona…</option>
                      <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.descripcion }}</option>
                    </select>
                  </div>

                  <!-- Modelo -->
                  <div class="col-md-4">
                    <label class="form-label">Modelo</label>
                    <select v-model="form.modelo_id" class="form-select">
                      <option value="">(Ninguno)</option>
                      <option v-for="m in modelos" :key="m.id" :value="m.id">
                        {{ m.descripcion }} - {{ m.marca }}
                      </option>
                    </select>
                  </div>

                  <!-- Tipo de uso -->
                  <div class="col-md-4">
                    <label class="form-label">Tipo de uso *</label>
                    <select v-model="form.tipo_uso" class="form-select">
                      <option value="" disabled>Selecciona…</option>
                      <option>Individual</option>
                      <option>Colectivo</option>
                    </select>
                  </div>

                  <!-- Valor unitario -->
                  <div class="col-md-4">
                    <label class="form-label">Valor unitario *</label>
                    <input v-model="form.valor_unitario" type="number" step="0.01" class="form-control" />
                  </div>

                  <!-- Condición -->
                  <div class="col-md-4">
                    <label class="form-label">Condición *</label>
                    <select v-model="form.condicion" class="form-select">
                      <option value="" disabled>Selecciona…</option>
                      <option>Nuevo</option>
                      <option>Usado</option>
                      <option>Deteriorado</option>
                      <option>Obsoleto</option>
                      <option>En reparación</option>
                    </select>
                  </div>

                  <!-- Estado -->
                  <div class="col-md-4">
                    <label class="form-label">Estado *</label>
                    <select v-model="form.estatus" class="form-select">
                      <option>Incorporado</option>
                      <option>Asignado</option>
                      <option>En traslado</option>
                      <option>Prestado</option>
                      <option>Desincorporado</option>
                      <option>Mantenimiento</option>
                    </select>
                  </div>

                  <!-- Fecha -->
                  <div class="col-md-4">
                    <label class="form-label">Fecha de adquisición *</label>
                    <input v-model="form.fecha_adquisicion" type="date" class="form-control" />
                  </div>

                  <!-- Características -->
                  <div class="col-md-12">
                    <label class="form-label">Características</label>
                    <textarea v-model="form.caracteristicas" class="form-control" rows="3"></textarea>
                  </div>
                </div>
              </div>

              <div class="card-footer d-flex gap-2 justify-content-end">
                <button class="btn btn-secondary" :disabled="loadingCrear" @click="showCrear = false">Cancelar</button>
                <button class="btn btn-primary" :disabled="loadingCrear" @click="guardarBien">
                  {{ loadingCrear ? (isEdit ? 'Guardando cambios…' : 'Guardando…') : (isEdit ? 'Guardar cambios' :
                  'Guardar') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showCrear" class="modal-backdrop fade show"></div>
        <!-- Fin modal -->
      </div>
    </div>

    <!-- Page footer -->
    <FooterPage />
  </main>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}
</style>
