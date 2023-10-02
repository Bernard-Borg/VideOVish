<script setup lang="ts">
import HelpKey from "./HelpKey.vue";
import { Connector } from "../views/Help";
import { HelpEntry } from "../types";

defineProps<HelpEntry>();
</script>

<template>
    <span class="flex items-center justify-between mb-3" v-if="Array.isArray(keybind)">
        {{ description }}
        <span class="float-right">
            <template v-for="part in keybind">
                <span class="mt-[5px] mr-[10px]" v-if="Object.values(Connector).includes(part)">
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
