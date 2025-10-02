<script setup>
import { ref, onMounted } from "vue";
import HeaderPage from '@/components/page/header/Component.vue'
import FooterPage from '@/components/page/footer/Component.vue'
import svg from '../assets/svg/icons-svg.json';
const BASE_URL = import.meta.env.VITE_BASE_URL

const indicadores = ref({});

// Cargar datos de la API Django
const fetchIndicadores = async () => {
  try {
    const res = await fetch(`${BASE_URL}indicadores/bienes/condiciones`);
    
    indicadores.value = await res.json();
  } catch (error) {
    console.error("Error al cargar indicadores:", error);
  }
};

onMounted(() => {
  fetchIndicadores();
});
</script>

<template>
  <main class="page-wrapper">
    <!-- Page header -->
    <HeaderPage :icon="['fas', 'home']" text="Inicio" />

    <!-- Page body -->
    <div class="page-body mt-3 mb-3">
      <div class="ps-3 pe-3">
        <div class="row row-deck row-cards">
          <div class="col-12">
            <div class="row row-cards">

              <!-- Bienes Nuevos -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-green text-white avatar">
                          <div v-html="svg.appliances"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          Nuevos
                        </div>
                        <div class="text-muted">
                          {{ indicadores['Nuevo'] || 0 }} bienes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bienes Usados -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-primary text-white avatar">
                          <div v-html="svg.client"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          Usados
                        </div>
                        <div class="text-muted">
                          {{ indicadores['Usado'] || 0 }} bienes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bienes Deteriorados -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-warning text-white avatar">
                          <div v-html="svg.customers"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          Deteriorados
                        </div>
                        <div class="text-muted">
                          {{ indicadores['Deteriorado'] || 0 }} bienes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bienes en reparación -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-danger text-white avatar">
                          <div v-html="svg.repaired"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          En reparación
                        </div>
                        <div class="text-muted">
                          {{ indicadores['En reparación'] || 0 }} bienes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page footer -->
    <FooterPage />
  </main>
</template>

<style scoped></style>
