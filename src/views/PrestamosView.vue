<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import HeaderPage from '@/components/page/header/Component.vue'
import FooterPage from '@/components/page/footer/Component.vue'
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'
import { Toast } from 'bootstrap'
import { IconEdit } from '@tabler/icons-vue'
const BASE_URL = import.meta.env.VITE_BASE_URL
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import { IconArrowBack, IconArrowBackUp, IconRotate, IconRefresh } from '@tabler/icons-vue'

// Datos simulados (pueden venir de tu API Django)
const bienesSeleccionados = ref([])



// Estado
const prestamos = ref([])
const dependencias = ref([])
const motivos = ref([])
const bienes = ref([]) // para seleccionar en el modal
const toastSuccess = ref(null)

const showCrear = ref(false)
const isEdit = ref(false)
const idEdit = ref(null)
const loadingCrear = ref(false)
const errorCrear = ref('')
const toastMessage = ref('✅ Préstamo creado correctamente')


// Estado para devolución
const showDevolucion = ref(false)
const devolucionForm = reactive({
    prestamo_id: null,
    fecha_devolucion: '',
    detalles: [] // { bien_id, condicion_devolucion }
})


// Paginación y búsqueda
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const search = ref('')

// Formulario
const form = reactive({
    fecha_inicio: '',
    fecha_final: '',
    encargado: '',
    ubicacion_departamento_id: '',
    motivo_id: '',
    bienes: [] // array de IDs de bienes seleccionados
})

const initialForm = { ...form }

// Computed
const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize.value))
)

const pageWindow = computed(() => {
    const tp = totalPages.value
    if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1)
    const start = Math.max(1, Math.min(page.value - 2, tp - 4))
    return [start, start + 1, start + 2, start + 3, start + 4]
})

// Funciones API


// Cargar datos desde API
onMounted(async () => {
    try {
        const resp = await fetch("http://127.0.0.1:8000/bienes/listar")
        if (!resp.ok) throw new Error("Error al cargar bienes")
        bienes.value = await resp.json()
    } catch (error) {
        console.error("Error:", error)
    }
})

const fetchPrestamos = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}prestamos/listar`)
        prestamos.value = data         // guardar directamente el array
        total.value = data.length      // cantidad de préstamos
    } catch (err) {
        console.error('Error al cargar préstamos', err)
    }
}


const fetchAuxiliares = async () => {
    const { data: deps } = await axios.get(`${BASE_URL}auxiliares/dependencias`)
    dependencias.value = deps
    const { data: mot } = await axios.get(`${BASE_URL}auxiliares/motivos`)
    motivos.value = mot
    const { data: bns } = await axios.get(`${BASE_URL}bienes/listar`)
    bienes.value = bns.results
}

const abrirModal = () => {
    Object.assign(form, initialForm)
    form.bienes = []
    isEdit.value = false
    idEdit.value = null
    errorCrear.value = ''
    toastMessage.value = '✅ Préstamo creado correctamente'
    showCrear.value = true
}

const abrirDevolucion = (prestamo) => {
    devolucionForm.prestamo_id = prestamo.id
    devolucionForm.fecha_devolucion = new Date().toISOString().split('T')[0] // hoy
    devolucionForm.detalles = prestamo.detalles.map(d => ({
        id: d.id,
        bien_id: d.bien_id,
        bien: d.bien,
        condicion_devolucion: ''
    }))
    showDevolucion.value = true
}


const mostrarToast = () => {
    const toastEl = toastSuccess.value
    const toast = new Toast(toastEl, { delay: 4000 })
    toast.show()
}

const guardarPrestamo = async () => {
    errorCrear.value = ''
    loadingCrear.value = true
    try {
        // Mapear bienesSeleccionados a IDs
        form.bienes = bienesSeleccionados.value.map(b => ({
            bien_id: b.id   // importante: usar la clave bien_id
        }))


        if (isEdit.value && idEdit.value) {
            await axios.put(`${BASE_URL}prestamos/${idEdit.value}`, form)
        } else {
            await axios.post(`${BASE_URL}prestamos/`, form)
        }
        await fetchPrestamos()
        showCrear.value = false
        mostrarToast()
    } catch (err) {
        console.error('Error al guardar préstamo', err)
        errorCrear.value = err.response?.data?.detail || 'Error al guardar'
    } finally {
        loadingCrear.value = false
    }
}

const guardarDevolucion = async () => {
  try {
    // 1. Actualizar cada detalle con su condición
    for (const d of devolucionForm.detalles) {
      await axios.put(
        `${BASE_URL}prestamos/detalle/${d.id}/devolucion`,
        null, // body vacío porque la API usa query param
        { params: { condicion: d.condicion_devolucion } }
      )
    }

    // 2. Marcar el préstamo como devuelto
    await axios.put(`${BASE_URL}prestamos/${devolucionForm.prestamo_id}/devolucion`)

    // 3. Refrescar listado
    await fetchPrestamos()
    showDevolucion.value = false
    mostrarToast()
  } catch (err) {
    console.error("Error al guardar devolución", err)
  }
}



// Hooks
onMounted(async () => {
    await fetchPrestamos()
    await fetchAuxiliares()
})

watch([page, pageSize], fetchPrestamos)
watch(search, () => {
    page.value = 1
    fetchPrestamos()
})




</script>

<template>
    <main class="page-wrapper">
        <HeaderPage :icon="['fas', 'handshake']" text="Préstamos" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div class="card">
                    <!-- Toast -->
                    <div class="toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3"
                        ref="toastSuccess" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="d-flex">
                            <div class="toast-body">{{ toastMessage }}</div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto"
                                data-bs-dismiss="toast"></button>
                        </div>
                    </div>

                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Préstamos</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="search" />
                            <button class="btn btn-primary" @click.prevent="abrirModal">Nuevo préstamo</button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-striped table-vcenter card-table">
                            <thead>
                                <tr>
                                    <th>Encargado</th>
                                    <th>Motivo</th>
                                    <th>Fecha inicio</th>
                                    <th>Fecha fin</th>
                                    <th>Dependencia</th>
                                    <th>Bienes</th>
                                    <th>Estatus</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in prestamos" :key="p.id">
                                    <td>{{ p.encargado }}</td>
                                    <td>{{ p.motivo }}</td>
                                    <td>{{ p.fecha_inicio }}</td>
                                    <td>{{ p.fecha_final }}</td>
                                    <td>{{ p.ubicacion_departamento }}</td>
                                    <td>
                                        <ul>
                                            <li v-for="d in p.detalles" :key="d.id">
                                                {{ d.bien }}
                                            </li>
                                        </ul>
                                    </td>
                                    <td>
                                        <span :class="['badge',
                                            p.status === 'EN_PRESTAMO' ? 'bg-primary-lt' :
                                                p.status === 'DEVUELTO' ? 'bg-success-lt' :
                                                    'bg-danger-lt']">
                                            {{ p.status }}
                                        </span>
                                    </td>
                                    <td>

                                        <a class="btn btn-action" @click.prevent="abrirDevolucion(p)"
                                            title="Devolución">
                                            <IconArrowBack size="24" stroke-width="1.5" />
                                        </a>
                                    </td>
                                </tr>
                                <!-- <tr v-for="p in prestamos" :key="p.id">
                                    <td>{{ p.encargado }}</td>
                                    <td>{{ p.motivo }}</td>
                                    <td>{{ p.fecha_inicio }}</td>
                                    <td>{{ p.fecha_final }}</td>
                                    <td>{{ p.ubicacion_departamento }}</td>
                                    <td>{{ p.status }}</td>
                                    
                                    
                                </tr> -->
                            </tbody>
                        </table>
                        <Pagination v-model:page="page" v-model:pageSize="pageSize" :total="total" />
                    </div>
                </div>

                <!-- Modal Crear/Editar -->
                <div v-if="showCrear" class="modal fade show d-block">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content card">
                            <div class="card-header d-flex justify-content-between">
                                <h3 class="card-title">{{ isEdit ? 'Editar préstamo' : 'Nuevo préstamo' }}</h3>
                                <button class="btn-close" @click="showCrear = false"></button>
                            </div>

                            <div class="card-body">
                                <div v-if="errorCrear" class="alert alert-danger">{{ errorCrear }}</div>

                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <label class="form-label">Encargado *</label>
                                        <input v-model="form.encargado" class="form-control" />
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label">Dependencia *</label>
                                        <select v-model="form.ubicacion_departamento_id" class="form-select">
                                            <option v-for="d in dependencias" :key="d.id" :value="d.id">{{ d.nombre }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-md-6">
                                        <label class="form-label">Motivo *</label>
                                        <select v-model="form.motivo_id" class="form-select">
                                            <option v-for="m in motivos" :key="m.id" :value="m.id">{{ m.descripcion }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label">Fecha inicio *</label>
                                        <input v-model="form.fecha_inicio" type="date" class="form-control" />
                                    </div>

                                    <div class="col-md-3">
                                        <label class="form-label">Fecha fin *</label>
                                        <input v-model="form.fecha_final" type="date" class="form-control" />
                                    </div>

                                    <!-- Bienes múltiples -->
                                    <div class="form-group">
                                        <label for="bienes">Seleccione los bienes</label>
                                        <Multiselect v-model="bienesSeleccionados" :options="bienes" :multiple="true"
                                            :close-on-select="false" track-by="id" label="cod_bien"
                                            placeholder="Seleccione los bienes" />
                                        <!-- <p class="mt-2">
                                            Bienes seleccionados: {{ bienesSeleccionados }}
                                        </p> -->

                                    </div>


                                </div>
                            </div>

                            <div class="card-footer d-flex justify-content-end gap-2">
                                <button class="btn btn-secondary" @click="showCrear = false">Cancelar</button>
                                <button class="btn btn-primary" :disabled="loadingCrear" @click="guardarPrestamo">
                                    {{ loadingCrear ? 'Guardando…' : 'Guardar' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="showCrear" class="modal-backdrop fade show"></div>
            </div>
        </div>

        <!-- Modal Devolución -->
        <div v-if="showDevolucion" class="modal fade show d-block">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card">
                    <div class="card-header d-flex justify-content-between">
                        <h3 class="card-title">Registrar devolución</h3>
                        <button class="btn-close" @click="showDevolucion = false"></button>
                    </div>

                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Fecha de devolución</label>
                            <input v-model="devolucionForm.fecha_devolucion" type="date" class="form-control" />
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Condiciones de los bienes</label>
                            <ul class="list-group">
                                <li v-for="d in devolucionForm.detalles" :key="d.bien_id" class="list-group-item">
                                    <strong>{{ d.bien }}</strong>
                                    <input v-model="d.condicion_devolucion" placeholder="Condición al devolver"
                                        class="form-control mt-2" />
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="card-footer d-flex justify-content-end gap-2">
                        <button class="btn btn-secondary" @click="showDevolucion = false">Cancelar</button>
                        <button class="btn btn-primary" @click="guardarDevolucion">
                            Guardar devolución
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showDevolucion" class="modal-backdrop fade show"></div>


        <FooterPage />
    </main>
</template>
