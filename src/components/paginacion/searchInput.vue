<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'


const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Buscar… (Ctrl/⌘ + K)' },
    debounce: { type: Number, default: 400 },
})
const emit = defineEmits(['update:modelValue'])
const inputEl = ref(null)
let t


function onInput(e) {
    const val = e.target.value
    clearTimeout(t)
    t = setTimeout(() => emit('update:modelValue', val.trim()), props.debounce)
}


function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); inputEl.value?.focus?.()
    }
}


onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>


<template>
    <div class="input-group input-group-flat w-auto">
        <span class="input-group-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="icon icon-1">
                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                <path d="M21 21l-6 -6" />
            </svg>
        </span>
        <input :placeholder="placeholder" type="text" class="form-control" :value="modelValue" @input="onInput"
            ref="inputEl" />
        <button class="input-group-text btn btn-link px-2" v-if="modelValue"
            @click.prevent="$emit('update:modelValue', '')" title="Limpiar">×</button>
        <span class="input-group-text"><kbd>ctrl + K</kbd></span>
    </div>
</template>