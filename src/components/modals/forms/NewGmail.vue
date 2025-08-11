<script setup>
/*--------------------------------------------------------*/
// Librerias
import { ref, onMounted } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

// Componentes
import HeaderModal from "../component_base/HeaderModal.vue";
import AlertGlobal from "../../global/AlertGlobal.vue";
import LabelGlobal from "../../global/LabelGlobal.vue";
import ButtonGlobal from "../../global/ButtonGlobal.vue";

// Stores de pinia
import { useAccountStore } from "@/stores/account";
const useAccount = useAccountStore();

/*--------------------------------------------------------*/
const queryClient = useQueryClient();

const schema = ref(yup.object().shape({
  newGmail: yup
    .string()
    .email('Debe ser un correo válido')
    .required('El correo es obligatorio'),
})
);

const formData = ref({
  newGmail: '',
});

// Mutación para agregar nuevo correo
const addEmailMutation = useMutation({
  mutationFn: (email) => useAccount.newGmail(email),
  onSuccess: (success) => {
    //Invalidar la query para refrescar la lista
    queryClient.invalidateQueries(['gmails']);

    if (success === true) {
      const btnCloseModal = document.getElementById('btn-close-modal');
      if (btnCloseModal) {
        btnCloseModal.click();
      }
    }

  },
  onError: (error) => {
    console.error('Error al agregar correo:', error);
  }
});

// Manejar envío del formulario
const handleSubmit = async (values, { resetForm: resetFormHandler }) => {
  try {
    await addEmailMutation.mutateAsync(values.newGmail);
  } catch (error) {
  }
};
/*--------------------------------------------------------*/

</script>

<template>
  <div class="modal modal-blur fade" id="modal-gmail" tabindex="-1" style="display: none;" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">

      <!--------------------------------------------- Formulario --------------------------------------------->
      <Form class="modal-content" @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors }">
        <HeaderModal title="Establecer nuevo correo" />

        <div class="modal-body d-flex flex-column">
          <!-- Campo de Contraseña -->
          <div class="mb-3">
            <LabelGlobal label="Correo" />
            <Field v-model="formData.newGmail" class="form-control" :class="{ 'is-invalid': errors.newGmail }"
              type="gmail" name="newGmail" placeholder="Nuevo correo" />
            <ErrorMessage name="newGmail" class="invalid-feedback" />
          </div>

          <!-- Alerta de error -->
          <!-- <AlertGlobal scope="newGmail" /> -->
        </div>

        <div class="modal-footer d-flex justify-content-between">
          <ButtonGlobal type="button" label="Cancelar" class="btn" data-bs-dismiss="modal" />
          <ButtonGlobal class="btn btn-primary" type="submit" :disabled="useAccount.apiName === 'newGmail'"
            label="Listo" :loading="useAccount.apiName === 'newGmail'" />

          <button style="display: none;" id="btn-close-modal" type="button" data-bs-dismiss="modal"></button>
        </div>
      </Form>

    </div>
  </div>
</template>


<style scoped></style>