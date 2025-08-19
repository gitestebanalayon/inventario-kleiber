<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { Toast } from 'bootstrap'


const props = defineProps({
    message: { type: String, default: '' },
    variant: { type: String, default: 'success' }, // success | danger | info | warning
    autohide: { type: Boolean, default: true },
    delay: { type: Number, default: 4000 },
    show: { type: Boolean, default: false },
})
const emit = defineEmits(['update:show'])


const el = ref(null)
let toast


onMounted(() => {
    toast = new Toast(el.value, { autohide: props.autohide, delay: props.delay })
    if (props.show) toast.show()
})


watch(() => props.show, (val) => {
    if (!toast) return
    if (val) toast.show(); else toast.hide()
})


onBeforeUnmount(() => { toast?.hide?.(); toast = null })


function hide() { emit('update:show', false) }
</script>


<template>
    <div class="toast align-items-center text-white border-0 position-fixed top-0 end-0 m-3" :class="`bg-${variant}`"
        role="alert" aria-live="assertive" aria-atomic="true" ref="el">
        <div class="d-flex">
            <div class="toast-body">
                <slot>{{ message }}</slot>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"
                @click="hide"></button>
        </div>
    </div>
</template>