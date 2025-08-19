<script setup>
import { computed } from 'vue'


const props = defineProps({
    page: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true },
    pageSizes: { type: Array, default: () => [5, 10, 20, 50] },
    showPageWindow: { type: Number, default: 5 },
})
const emit = defineEmits(['update:page', 'update:pageSize'])


const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const showingFrom = computed(() => (props.total ? (props.page - 1) * props.pageSize + 1 : 0))
const showingTo = computed(() => Math.min(props.page * props.pageSize, props.total))


const pageWindow = computed(() => {
    const tp = totalPages.value
    const span = Math.max(1, props.showPageWindow)
    if (tp <= span) return Array.from({ length: tp }, (_, i) => i + 1)
    const start = Math.max(1, Math.min(props.page - Math.floor(span / 2), tp - (span - 1)))
    return Array.from({ length: span }, (_, i) => start + i)
})


function goTo(p) {
    const next = Math.min(Math.max(1, p), totalPages.value)
    if (next !== props.page) emit('update:page', next)
}
function setPageSize(n) {
    if (n !== props.pageSize) {
        emit('update:pageSize', n)
        emit('update:page', 1) // reset
    }
}
</script>


<template>
    <div class="d-flex align-items-center justify-content-between p-3">
        <div class="d-flex gap-2 align-items-center">
            <span>Mostrar:</span>
            <select class="form-select w-auto" :value="pageSize" @change="setPageSize(Number($event.target.value))">
                <option v-for="n in pageSizes" :key="n" :value="n">{{ n }}</option>
            </select>
            <span class="text-secondary">{{ showingFrom }}–{{ showingTo }} de {{ total }}</span>
        </div>
        <nav aria-label="Paginación">
            <ul class="pagination m-0">
                <li class="page-item" :class="{ disabled: page === 1 }">
                    <a class="page-link" href="#" @click.prevent="goTo(page - 1)">«</a>
                </li>
                <li v-for="p in pageWindow" :key="p" class="page-item" :class="{ active: p === page }">
                    <a class="page-link" href="#" @click.prevent="goTo(p)">{{ p }}</a>
                </li>
                <li class="page-item" :class="{ disabled: page === totalPages }">
                    <a class="page-link" href="#" @click.prevent="goTo(page + 1)">»</a>
                </li>
            </ul>
        </nav>
    </div>
</template>