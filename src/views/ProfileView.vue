<script setup>
import { onMounted, ref, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import Swal from "sweetalert2";

/* COMPONENTS BASE */
import HeaderPage from '@/components/page/header/Component.vue';
import FooterPage from '@/components/page/footer/Component.vue';
/* COMPONENTS GLOBALS */
import TitleGlobal from '@/components/global/TitleGlobal.vue';
import NavItemGlobal from '@/components/global/NavItemGlobal.vue';
import ButtonGlobal from '@/components/global/ButtonGlobal.vue';
import LabelGlobal from "@/components/global/LabelGlobal.vue";
import LoadingGlobal from '@/components/global/LoadingGlobal.vue'
import AlertGlobal from '@/components/global/AlertGlobal.vue'
/* COMPONENTS PLACEHOLDERS */
import LabelPlaceholder from '@/components/placeholders/LabelPlaceholder.vue';
import InputPlaceholder from '@/components/placeholders/InputPlaceholder.vue';

/* COMPONENTS MODALS */
import NewPassword from '@/components/modals/forms/NewPassword.vue';
import NewGmail from '@/components/modals/forms/NewGmail.vue';

import avatar from '@/assets/img/esteban.jpg';
import { useAccountStore } from '@/stores/account';

// Obtiene el cliente de query
const queryClient = useQueryClient();


const useAccount = useAccountStore();
// useAccount.listGmail();
onMounted(async () => {
    // await useAccount.filterProfile();
})

const handleApiError = async (error) => {
};

const { isLoading, isError, data: listgmail, error, refetch: refetchGmails } = useQuery({
    queryKey: ['gmails'],
    // queryFn: () => useAccount.listGmail(),
    onError: handleApiError,
});

const activeGmail = async (id) => {
    try {
        await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres marcar este correo como principal?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1877f2',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, activar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'custom-toast-alert'
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Mostrar loading
                Swal.fire({
                    title: 'Activando correo...',
                    allowOutsideClick: false,
                    customClass: { popup: 'custom-toast-alert' },
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                // Llamar a la API para activar
                await useAccount.activeGmail(id);
                // Invalidar la query y refrescar los datos
                await queryClient.invalidateQueries(['gmails']);
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
                    title: 'El correo ha sido marcado como principal',
                })
            }
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo activar el correo',
            confirmButtonColor: '#1877f2'
        });
    }
};

const deleteGmail = async (id) => {
    try {
        await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres eliminar este correo?",
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
                    title: 'Eliminando correo...',
                    allowOutsideClick: false,
                    customClass: { popup: 'custom-toast-alert' },
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                // Llamar a la API para activar
                await useAccount.deleteGmail(id);
                // Invalidar la query y refrescar los datos
                await queryClient.invalidateQueries(['gmails']);
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
                    title: 'El correo ha sido eliminado exitosamente',
                })
            }
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'No se pudo activar el correo',
            confirmButtonColor: '#1877f2'
        });
    }
};

const schema = ref(yup.object().shape({
    first_name: yup
        .string()
        .required('El nombre es obligatorio'),
    last_name: yup
        .string()
        .required('El apellido es obligatorio'),
    origen: yup
        .string()
        .required('El origen es obligatorio')
        .length(1, 'El origen debe tener exactamente 1 dígito')
        .oneOf(['V', 'E'], 'El origen debe ser "V" o "E"'),
    ci: yup
        .number()
        .typeError('La cédula debe ser tipo numérico')
        .required('La cédula es obligatoria')
        .test(
            'len',
            'La cédula debe tener entre 6 y 8 dígitos',
            value => String(value).length >= 6 && String(value).length <= 8
        ),
    birthdate: yup
        .string()
        .required('La fecha de nacimiento es obligatoria'),
    phone: yup
        .string()
        .required('El teléfono es obligatorio')
        .length(11, 'El teléfono debe tener exactamente 11 dígitos'),
})
);

const schemaUsername = ref(yup.object().shape({
    username: yup
        .string()
        .required('El nombre es obligatorio'),
})
);

async function updateProfile() {
    await useAccount.updateProfile(useAccount.profile);
}

async function updateNameUser() {
    await useAccount.updateNameUser(useAccount.profile.username);
}

</script>

<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'gear']" text="Configuración" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">

                <div class="card">
                    <div class="row g-0">
                        <div class="col-3 d-none d-md-block border-right">
                            <div class="card-body">
                                <ul v-if="useAccount.apiName === 'filterProfile'"
                                    class="nav list-group list-group-transparent placeholder-glow" data-bs-toggle="tabs"
                                    role="tablist">
                                    <LabelPlaceholder class="subheader ms-3 mb-3" style="height: 15px; width: 142px;"
                                        type="h4" text="Configuración general" />

                                    <li class="nav-item" role="presentation">
                                        <a href="#" class="list-group-item list-group-item-action active"
                                            style="cursor: wait;">
                                            <LabelPlaceholder style="height: 16px; width: 35px; margin: 2px 0px;" />
                                        </a>
                                    </li>

                                    <li class="nav-item" role="presentation">
                                        <a href="#" class="list-group-item list-group-item-action"
                                            style="cursor: wait;">
                                            <LabelPlaceholder style="height: 16px; width: 47px; margin: 2px 0px;" />
                                        </a>
                                    </li>

                                    <LabelPlaceholder class="subheader mt-3 mb-3 ms-3"
                                        style="height: 15px; width: 70px;" type="h4" text="Experiencia" />
                                    <li class="nav-item" role="presentation">
                                        <a href="#" class="list-group-item list-group-item-action"
                                            style="cursor: wait;">
                                            <LabelPlaceholder style="height: 16px; width: 85px; margin: 2px 0px;" />
                                        </a>
                                    </li>
                                </ul>
                                <ul v-else class="nav list-group list-group-transparent" data-bs-toggle="tabs"
                                    role="tablist">
                                    <TitleGlobal class="subheader ms-3 mb-3" type="h4" text="Configuración general" />
                                    <NavItemGlobal href="#tabs-profile" text="Perfil" :active="true"
                                        :ariaSelected="true" :wait="useAccount.apiName === 'filterProfile'"
                                        :deactive="useAccount.apiName === 'filterProfile'" />
                                    <NavItemGlobal href="#tabs-account" text="Cuenta" :active="false"
                                        :ariaSelected="false" :wait="useAccount.apiName === 'filterProfile'"
                                        :deactive="useAccount.apiName === 'filterProfile'" />

                                    <TitleGlobal class="subheader mt-3 mb-3 ms-3" type="h4" text="Experiencia" />
                                    <NavItemGlobal href="#tabs-comment" text="Comentarios" :active="false"
                                        :ariaSelected="false" :wait="useAccount.apiName === 'filterProfile'"
                                        :deactive="useAccount.apiName === 'filterProfile'" />
                                </ul>
                            </div>
                        </div>

                        <div class="col d-flex flex-column">
                            <div class="tab-content">

                                <!-- Componente de carga -->
                                <div v-if="useAccount.apiName === 'filterProfile'" id="tabs-profile"
                                    class="tab-pane active show placeholder-glow" role="tabpanel">
                                    <div class="card-header border-0 pb-0">
                                        <div class="placeholder" style="height: 20px; width: 50px;"></div>
                                    </div>
                                    <div class="card-body pb-0">
                                        <div class="row align-items-center">
                                            <div class="col-auto">
                                                <span class="avatar avatar-xl shadow-none">
                                                    <div class="avatar avatar-xl placeholder shadow-none"></div>
                                                </span>
                                            </div>
                                            <div class="col-auto">
                                                <div class="btn btn-primaryy placeholder"
                                                    style="height: 40px; width: 126px;"></div>
                                            </div>
                                            <div class="col-auto">
                                                <div class="btn btn-dangerr placeholder"
                                                    style="height: 40px; width: 126px;"></div>
                                            </div>
                                        </div>

                                        <Form id="update-profile" class="g-3 mt-3">

                                            <div class="row">
                                                <div class="col-md mb-3">
                                                    <LabelPlaceholder
                                                        style="height: 16px; width: 59px; margin-bottom: 12px;" />
                                                    <InputPlaceholder />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelPlaceholder
                                                        style="height: 16px; width: 59px; margin-bottom: 12px;" />
                                                    <InputPlaceholder />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelPlaceholder
                                                        style="height: 16px; width: 144px; margin-bottom: 12px;" />
                                                    <InputPlaceholder />
                                                </div>
                                            </div>

                                            <div class="row">
                                                <div class="col-md mb-3">
                                                    <LabelPlaceholder
                                                        style="height: 16px; width: 51px; margin-bottom: 12px;" />
                                                    <InputPlaceholder />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelPlaceholder
                                                        style="height: 16px; width: 51px; margin-bottom: 12px;" />
                                                    <InputPlaceholder />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelPlaceholder
                                                        style="height: 16px; width: 59px; margin-bottom: 12px;" />
                                                    <InputPlaceholder />
                                                </div>
                                            </div>

                                            <div class="row">
                                                <div class="col-md-2 mb-3 m-auto">
                                                    <div class="btn btn-primaryy placeholder"
                                                        style="height: 40px; width: 100%;"></div>
                                                </div>
                                            </div>


                                        </Form>
                                    </div>

                                </div>
                                <!-- Componente cargado -->
                                <div v-else id="tabs-profile" class="tab-pane active show" role="tabpanel">
                                    <div class="card-header border-0 pb-0">
                                        <TitleGlobal type="h2" style="height: 20px;" text="Perfil" />
                                    </div>
                                    <div class="card-body pb-0">
                                        <div class="row align-items-center">
                                            <div class="col-auto">
                                                <span class="avatar avatar-xl"
                                                    :style="{ backgroundImage: `url(${avatar})` }"></span>
                                            </div>
                                            <div class="col-auto">
                                                <ButtonGlobal class="btn btn-outline-primary" type="button"
                                                    label="Cambiar avatar" />
                                            </div>
                                            <div class="col-auto">
                                                <ButtonGlobal class="btn btn-outline-danger" type="button"
                                                    label="Eliminar avatar" />
                                            </div>
                                        </div>

                                        <Form id="update-profile" class="g-3 mt-3" @submit="updateProfile"
                                            :validation-schema="schema" v-slot="{ errors }">

                                            <div class="row">
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Nombre" style="height: 20px;" />
                                                    <Field v-model="useAccount.profile.first_name" class="form-control"
                                                        :class="{ 'is-invalid': errors.first_name }" type="text"
                                                        name="first_name" />
                                                    <ErrorMessage name="first_name" class="invalid-feedback" />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Apellido" />
                                                    <Field v-model="useAccount.profile.last_name" class="form-control"
                                                        :class="{ 'is-invalid': errors.last_name }" type="text"
                                                        name="last_name" />
                                                    <ErrorMessage name="last_name" class="invalid-feedback" />
                                                </div>

                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Fecha de nacimiento" />
                                                    <Field v-model="useAccount.profile.birthdate" class="form-control"
                                                        :class="{ 'is-invalid': errors.birthdate }" type="date"
                                                        name="birthdate" />
                                                    <ErrorMessage name="birthdate" class="invalid-feedback" />
                                                </div>
                                            </div>

                                            <div class="row">
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Origen" />

                                                    <Field v-model="useAccount.profile.origen" class="form-control"
                                                        :class="{ 'is-invalid': errors.origen }" type="text"
                                                        name="origen" />
                                                    <ErrorMessage name="origen" class="invalid-feedback" />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Cédula" />
                                                    <Field v-model="useAccount.profile.ci" class="form-control"
                                                        :class="{ 'is-invalid': errors.ci }" type="number" name="ci" />
                                                    <ErrorMessage name="ci" class="invalid-feedback" />
                                                </div>


                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Teléfono" />
                                                    <Field v-model="useAccount.profile.phone" class="form-control"
                                                        :class="{ 'is-invalid': errors.phone }" type="text"
                                                        name="phone" />
                                                    <ErrorMessage name="phone" class="invalid-feedback" />
                                                </div>

                                            </div>

                                            <div class="row">
                                                <div class="col-md-2 mb-3 m-auto">
                                                    <button type="submit" class="btn btn-primary"
                                                        :disabled="useAccount.apiName === 'updateProfile'"
                                                        style="width: 100%;">
                                                        <LoadingGlobal v-if="useAccount.apiName === 'updateProfile'" />
                                                        <span v-else>Entregar</span>
                                                    </button>

                                                    <AlertGlobal scope="updateProfile" />
                                                </div>
                                            </div>

                                        </Form>
                                    </div>

                                </div>


                                <div v-if="useAccount.apiName === 'filterProfile'" id="tabs-account" class="tab-pane"
                                    role="tabpanel">
                                    <div class="card-header border-0 pb-0">
                                        <div class="placeholder" style="height: 20px; width: 50px;"></div>
                                    </div>
                                    <div class="card-body">
                                        <Form id="update-profile" class="g-3 mt-3" @submit="updateProfile"
                                            :validation-schema="schema" v-slot="{ errors }">

                                            <div class="row">
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Correo" style="height: 20px;" />
                                                    <Field v-model="useAccount.profile.email" class="form-control"
                                                        :class="{ 'is-invalid': errors.email }" type="email"
                                                        name="email" />
                                                    <ErrorMessage name="email" class="invalid-feedback" />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Nombre de usuario" style="height: 20px;" />
                                                    <Field v-model="useAccount.profile.username" class="form-control"
                                                        :class="{ 'is-invalid': errors.email }" type="text"
                                                        name="username" />
                                                    <ErrorMessage name="username" class="invalid-feedback" />
                                                </div>
                                                <div class="col-md mb-3">
                                                    <LabelGlobal label="Contraseña" style="height: 20px;" />
                                                    <ButtonGlobal label="Establecer una nueva" type="button"
                                                        class="btn w-100" />
                                                </div>
                                            </div>

                                            <div class="row">
                                                <div class="col-md-2 mb-3 m-auto">
                                                    <button type="submit" class="btn btn-primary"
                                                        :disabled="useAccount.apiName === 'updateProfile'"
                                                        style="width: 100%;">
                                                        <LoadingGlobal v-if="useAccount.apiName === 'updateProfile'" />
                                                        <span v-else>Entregar</span>
                                                    </button>

                                                    <AlertGlobal scope="updateProfile" />
                                                </div>
                                            </div>

                                        </Form>
                                    </div>
                                </div>
                                <div v-else id="tabs-account" class="tab-pane" role="tabpanel">

                                    <div class="card-header border-0 pb-0">
                                        <TitleGlobal type="h2" text="Cuenta" />
                                    </div>
                                    <div class="card-body">
                                        <Form id="update-username" class="g-3 mt-3" @submit="updateNameUser"
                                            :validation-schema="schemaUsername" v-slot="{ errors }">

                                            <div class="row">
                                                <div class="col">
                                                    <div class="input-icon mb-3">
                                                        <div class="input-group">
                                                            <span class="input-icon-addon" style="z-index: 9999;">
                                                                <!-- Download SVG icon from http://tabler.io/icons/icon/user -->
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                    height="24" viewBox="0 0 24 24" fill="none"
                                                                    stroke="currentColor" stroke-width="2"
                                                                    stroke-linecap="round" stroke-linejoin="round"
                                                                    class="icon icon-1">
                                                                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0">
                                                                    </path>
                                                                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2">
                                                                    </path>
                                                                </svg>
                                                            </span>
                                                            <Field v-model="useAccount.profile.username"
                                                            class="form-control rounded-start"
                                                            :class="{ 'is-invalid': errors.username }" type="text"
                                                            name="username" />
                                                            



                                                            <button type="submit" class="btn btn-6 btn-primary border-0"
                                                                :disabled="useAccount.apiName === 'updateNameUser'"
                                                                style="box-shadow: none;">
                                                                <LoadingGlobal
                                                                v-if="useAccount.apiName === 'updateNameUser'" />
                                                                <span v-else>Ok</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <ErrorMessage name="username" class="invalid-feedback" />
                                                </div>

                                                <div class="col">
                                                    <div class="input-icon">
                                                        <ButtonGlobal label="Cambiar contraseña" type="button"
                                                            class="btn btn-6 btn-outline-primary w-100"
                                                            data-bs-toggle="modal" data-bs-target="#modal-simple" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>

                                        <div
                                            class="mt-4 d-flex flex-column gap-3 align-items-center justify-content-center">
                                            <TitleGlobal type="h2" text="Correos electrónicos" />
                                            <ButtonGlobal label="Agregar nuevo correo" type="button"
                                                class="btn btn-6 btn-primary" data-bs-toggle="modal"
                                                data-bs-target="#modal-gmail" />
                                        </div>



                                        <div class="table-responsive mt-4 d-flex justify-content-center">

                                            <div class="d-flex justify-content-center align-items-center"
                                                v-if="isLoading" style="height: 120px;">
                                                <div class="spinner-border" style="width: 3rem; height: 3rem;"
                                                    role="status"></div>
                                            </div>

                                            <!-- Error state (solo si no es 503, porque 503 ya muestra Swal) -->
                                            <div v-else-if="error" class="">
                                                {{ error.response?.data?.message }}
                                            </div>

                                            <table v-else
                                                class="table table-vcenter table-bordered table-nowrap card-table">
                                                <thead class="border-thead">
                                                    <tr>
                                                        <th class="bg-transparent ps-2 text-start border-0">Correo</th>
                                                        <th class="bg-transparent ps-2 text-start border-0">Principal
                                                        </th>
                                                        <th class="bg-transparent border-0"></th>
                                                    </tr>
                                                </thead>
                                                <tbody class="border-tbody">
                                                    <tr v-for="gmail in listgmail" :key="gmail.id">
                                                        <td class="bg-transparent">
                                                            <div class="text-start">
                                                                {{ gmail.gmail }}
                                                            </div>
                                                        </td>
                                                        <td class="bg-transparent">
                                                            <div class="text-start">
                                                                <font-awesome-icon v-if="gmail.status === true"
                                                                    icon="fa-solid fa-check" />
                                                                <font-awesome-icon v-else icon="fa-solid fa-minus" />
                                                            </div>
                                                        </td>

                                                        <td class="bg-transparent">
                                                            <div class="text-center">
                                                                <button class="border-0 bg-transparent me-3"
                                                                    title="Marcar como principal"
                                                                    :class="{ 'd-none': gmail.status === true }"
                                                                    @click="activeGmail(gmail.id)">
                                                                    <font-awesome-icon icon="fa-solid fa-arrow-up" />
                                                                </button>
                                                                <button class="border-0 bg-transparent text-danger"
                                                                    :class="{ 'd-none': gmail.status === true }"
                                                                    @click="deleteGmail(gmail.id)">
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

                                <div id="tabs-comment" class="tab-pane" role="tabpanel">
                                    <div class="card-header border-0 pb-0">
                                        <TitleGlobal type="h2" text="Comentarios" />
                                    </div>
                                    <div class="card-body">
                                        <p class="text-secondary">En construcción...</p>
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


    <NewPassword />
    <NewGmail />
</template>
