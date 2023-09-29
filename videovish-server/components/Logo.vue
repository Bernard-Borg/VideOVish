<script setup lang="ts">
const props = defineProps<{
    logoSrc: string;
    link?: string;
    description?: string;
}>();

const logo = ref<string>(props.logoSrc);
</script>

<template>
    <a :href="link" :title="description">
        <img :src="logo" :alt="description" class="aspect-square w-[45px] rounded-md" />
    </a>
</template>
