<script setup>
import Items from './NavBarOptionsItems.vue';
import ItemsSub from './NavBarOptionsItemsSub.vue';
</script>

<template>
  <div class="collapse navbar-collapse dropdown" id="sidebar-menu">
    <ul class="navbar-nav pt-lg-2 pb-lg-2 d-flex gap-1">

      <!-- Inicio -->
      <Items :icon="['fas', 'home']" name="Inicio" routs="/home" />

      <!-- Bienes -->
      <Items :icon="['fas', 'layer-group']" name="Bienes" routs="/bienes" />

      <!-- Movimientos -->
      <li>
        <ItemsSub name="Movimientos" :icon="['fas', 'exchange-alt']" active="#active3" />
        <div
          id="active3"
          class="collapse rounded-2 bg-gray-700"
          data-bs-parent="#sidebar-menu"
        >
          <ul class="navbar-nav d-flex gap-1">
            <Items class="mt-1" :icon="['fas', 'handshake']" name="Préstamos" routs="/prestamos" />
            <Items :icon="['fas', 'trash']" name="Desincorporaciones" routs="/desincorporaciones" />
            <Items :icon="['fas', 'people-arrows']" name="Reasignaciones" routs="/reasignaciones" />
          </ul>
        </div>
      </li>

      <!-- Usuarios -->
      <Items :icon="['fas', 'users']" name="Usuarios" routs="/usuarios" />

      <!-- Configuraciones -->
      <Items :icon="['fas', 'gear']" name="Configuraciones" routs="/configuraciones" />

    </ul>
  </div>
</template>
