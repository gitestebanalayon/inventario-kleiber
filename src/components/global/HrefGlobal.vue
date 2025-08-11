<script setup>

defineProps({
    to: {
        type: [String, Object],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    }
});

</script>

<template>
    <li class="nav-item" role="presentation">
        <router-link :to="to" class="list-group-item list-group-item-action" :class="{ 'active': active }">
            {{ text }}
        </router-link>
    </li>
</template>

<style scoped>
/* .wait {
    pointer-events: none !important;
    cursor: wait !important;
} */
</style>
