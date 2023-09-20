<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { refThrottled, useTimeoutFn, useTimestamp, useClipboard } from "@vueuse/core";
import { ref, computed } from "vue";
import { NotificationType } from "../vite-env";
import { Info, CheckCircle, AlertTriangle, XOctagon, Copy } from "lucide-vue-next";

const props = withDefaults(defineProps<{ message: string; type?: NotificationType; expiryTime?: number }>(), {
    type: "info"
});

const emit = defineEmits(["close"]);

const { copy } = useClipboard();

const myAlert = ref<HTMLElement>();
const initialTime = new Date().getTime();

const currentTime = refThrottled(useTimestamp(), 3);
const timeFinished = initialTime + (props.expiryTime ?? 0);
const width = computed(() => {
    return ((timeFinished - currentTime.value) / (props.expiryTime ?? 1)) * 100;
});

if (props.expiryTime) {
    useTimeoutFn(() => {
        if (myAlert.value) {
            emit("close");
        }
    }, props.expiryTime);
}
</script>

<template>
    <div
        ref="myAlert"
        :class="`max-w-[300px] rounded-lg flex flex-col p-0 overflow-hidden custom-alert-${type}`"
        role="alert"
    >
        <div class="flex justify-between px-6 py-3">
            <span class="inline-flex text-md">
                <span v-if="type == 'info'" class="me-2">
                    <Info />
                </span>
                <span v-else-if="type == 'success'" class="me-2">
                    <CheckCircle />
                </span>
                <span v-else-if="type == 'warning'" class="me-2">
                    <AlertTriangle />
                </span>
                <span v-else class="me-2">
                    <XOctagon />
                </span>
                {{ message }}
            </span>
            <button
                v-if="type === 'warning' || type === 'error'"
                type="button"
                class="p-0 text-md ms-3"
                aria-label="Copy"
                @click="copy(message)"
            >
                <Copy />
            </button>
            <button
                type="button"
                class="p-0 text-md ms-3 underline underline-offset-2"
                aria-label="Close"
                @click="$emit('close')"
            >
                OK
            </button>
        </div>
        <div v-if="expiryTime" class="h-[4px] bg-white rounded-b-lg" :style="`width: ${width}%`"></div>
    </div>
</template>

<style scoped>
.custom-alert-warning {
    background-color: #f8bd89;
    border: 1px solid orangered;
    color: rgb(168, 50, 7);

    i {
        color: orangered;
    }
}

.custom-alert-success {
    background-color: #a5dc86;
    border: 1px solid green;
    color: green;

    i {
        color: green;
    }
}

.custom-alert-info {
    background-color: #6bb1c9;
    border: 1px solid var(--kt-primary);
    color: rgba(21, 21, 163, 0.895);

    i {
        color: rgba(21, 21, 163, 0.697);
    }
}

.custom-alert-error {
    background-color: #f8b4b4;
    border: 1px solid red;
    color: maroon;

    i {
        color: rgb(131, 0, 0);
    }
}
</style>
