import { defineStore } from 'pinia';

import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useRolesStore = defineStore('roles', {
    state: () => ({

    }),
    actions: {
        async listRoles() {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };

                // Simular retraso para testing (opcional)
                // const simulateDelay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
                const response = await axios.get(`${BASE_URL}api/v1/group/read`, { headers });
                // await simulateDelay(3000); // Solo para desarrollo, quitar en producción

                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.data.data;
            } catch (error) {
                // Re-lanzamos el error para que Vue Query lo capture
                throw error;
            }
        },
        async deleteRole(id) {
            try {
               

                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };

                // Realizar la solicitud PUT con axios
                // const simulateDelay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
                const response = await axios.put(`${BASE_URL}api/v1/group/delete/${id}`,
                    {
                        'id': id,
                    },
                    {
                        headers
                    });
                // await simulateDelay(2000); // Solo para desarrollo, quitar en producción

                if (response.data.statusCode === 200) {
                    return true;
                }
                return false;
            } catch (error) {
             
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 409:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;

                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                // return false;
            } finally {
                
            }
        }
    }
});
