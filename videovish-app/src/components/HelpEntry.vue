<script setup lang="ts">
import HelpKey from "./HelpKey.vue";
import { HelpEntry } from "../vite-env";
import { Connector } from "../views/Help";

defineProps<HelpEntry>();
</script>

<template>
    <span class="flex items-center justify-between mb-3" v-if="Array.isArray(keybind)">
        {{ description }}
        <span class="float-right">
            <template v-for="part in keybind">
                <span class="key-symbol" v-if="Object.values(Connector).includes(part)">
                    {{ part === "and" ? "+" : part === "or" ? "/" : part === "to" ? "-" : "" }}
                </span>
                <HelpKey v-else>{{ part }}</HelpKey>
            </template>
        </span>
    </span>
    <span class="flex items-center justify-between mb-3" v-else>
        {{ description }}<HelpKey class="float-right">{{ keybind }}</HelpKey>
    </span>
</template>

<style scoped>
span.key-symbol {
    margin-top: 5px;
    margin-right: 10px;
}
</style>
