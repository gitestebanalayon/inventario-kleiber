<script setup>
import FooterPage from '@/components/page/footer/Component.vue';
import HeaderPage from '@/components/page/header/Component.vue';

import { useRolesStore } from '@/stores/roles';
import { onMounted } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import Swal from "sweetalert2";

const storeRole = useRolesStore()

const queryClient = useQueryClient();

const handleApiError = async (error) => {
};

const { isLoading, isError, data: listrole, error, refetch: refetchRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => storeRole.listRoles(),
    onError: handleApiError,
});

const deleteRoles = async (id) => {
    try {
        await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres eliminar este rol?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1877f2',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'custom-toast-alert'
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Mostrar loading
                Swal.fire({
                    title: 'Eliminando rol...',
                    allowOutsideClick: false,
                    customClass: { popup: 'custom-toast-alert' },
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                // Llamar a la API para activar
                await storeRole.deleteRole(id);
                // Invalidar la query y refrescar los datos
                await queryClient.invalidateQueries(['roles']);
                // Cerrar loading y mostrar éxito
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    customClass: {
                        popup: 'custom-toast'
                    },
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                Toast.fire({
                    icon: 'success',
                    title: 'El rol ha sido eliminado exitosamente',
                })
            }
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo eliminar el rol',
            confirmButtonColor: '#1877f2'
        });
    }
};

</script>

<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'users-viewfinder']" text="Roles" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">

                <div class="table-responsive mt-4 d-flex justify-content-center">

                    <div class="d-flex justify-content-center align-items-center" v-if="isLoading"
                        style="height: 120px;">
                        <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>
                    </div>

                    <!-- Error state (solo si no es 503, porque 503 ya muestra Swal) -->
                    <div v-else-if="error" class="">
                        {{ error.response?.data?.message }}
                    </div>

                    <table v-else class="table table-vcenter table-bordered table-nowrap card-table">
                        <thead class="border-thead">
                            <tr>
                                <th class="bg-transparent ps-2 text-start border-0">Rol</th>
                                <th class="bg-transparent ps-2 text-start border-0">Crear
                                </th>
                                <th class="bg-transparent ps-2 text-start border-0">Leer
                                </th>
                                <th class="bg-transparent ps-2 text-start border-0">Actualizar
                                </th>
                                <th class="bg-transparent ps-2 text-start border-0">Borrar
                                </th>
                                <th class="bg-transparent border-0">Acción</th>
                            </tr>
                        </thead>
                        <tbody class="border-tbody">
                            <tr v-for="role in listrole" :key="role.id">
                                <td class="bg-transparent">
                                    <div class="text-start">
                                        {{ role.description }}
                                    </div>
                                </td>
                                <td class="bg-transparent">
                                    <div class="text-start">
                                        <font-awesome-icon v-if="role.groupPermission[0].create === true" icon="fa-solid fa-check" />
                                        <font-awesome-icon v-else icon="fa-solid fa-times" />
                                    </div>
                                </td>
                                <td class="bg-transparent">
                                    <div class="text-start">
                                        <font-awesome-icon v-if="role.groupPermission[0].read === true" icon="fa-solid fa-check" />
                                        <font-awesome-icon v-else icon="fa-solid fa-times" />
                                    </div>
                                </td>
                                <td class="bg-transparent">
                                    <div class="text-start">
                                        <font-awesome-icon v-if="role.groupPermission[0].update === true" icon="fa-solid fa-check" />
                                        <font-awesome-icon v-else icon="fa-solid fa-times" />
                                    </div>
                                </td>
                                <td class="bg-transparent">
                                    <div class="text-start">
                                        <font-awesome-icon v-if="role.groupPermission[0].delete === true" icon="fa-solid fa-check" />
                                        <font-awesome-icon v-else icon="fa-solid fa-times" />
                                    </div>
                                </td>

                                <td class="bg-transparent">
                                    <div class="text-center">
                                        <button v-if="role.description != 'administrador'" class="border-0 bg-transparent text-danger"
                                            :class="{ 'd-none': role.status === true }" @click="deleteRoles(role.id)">
                                            <font-awesome-icon icon="fa-solid fa-trash" />
                                        </button>
                                    </div>
                                </td>
                            </tr>


                        </tbody>
                    </table>

                </div>

            </div>
        </div>

        <!-- Page footer -->
        <FooterPage />
    </main>

</template>
