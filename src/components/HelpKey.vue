<script setup lang="ts">
withDefaults(
    defineProps<{
        extendWidth: boolean;
    }>(),
    { extendWidth: false }
);
</script>

<template>
    <div
        :class="`key inline-flex justify-center items-center p-3 mr-3 h-[10px] text-white text-md rounded-md ${
            extendWidth ? 'w-[60px]' : 'w-[40px]'
        }`"
        style="background: rgb(22, 22, 22); box-shadow: 0px 5px black"
    >
        <slot></slot>
    </div>
</template>
