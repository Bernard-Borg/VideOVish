<script setup lang="ts">
import { HardDrive, Youtube, History } from "lucide-vue-next";

defineEmits(["local", "youtube", "previous", "quit"]);
</script>

<template>
    <div class="flex flex-col w-full h-full justify-center items-center bg-transparent">
        <div class="bg-charcoal p-[50px] flex gap-10 rounded-md outline-white outline-1 outline">
            <button
                class="flex flex-col justify-center items-center aspect-square w-[100px] text-md font-light font-sans rounded-md text-white hover:outline hover:outline-white hover:outline-1"
                @click="$emit('local')"
            >
                <HardDrive :size="40" color="white" strokeWidth="1" /> Local
            </button>
            <button
                class="flex flex-col justify-center items-center aspect-square w-[100px] text-md font-light font-sans rounded-md text-white hover:outline hover:outline-white hover:outline-1"
                @click="$emit('youtube')"
            >
                <Youtube :size="40" fill="red" strokeWidth="1" /> Youtube
            </button>
            <button
                class="flex flex-col justify-center items-center aspect-square w-[100px] text-md font-light font-sans rounded-md text-white hover:outline hover:outline-white hover:outline-1"
                @click="$emit('previous')"
            >
                <History :size="40" color="white" strokeWidth="1" /> Previous
            </button>
        </div>
        <button
            class="bg-charcoal outline outline-1 outline-white text-white mt-4 w-24 p-2 rounded-md hover:bg-gray-700"
            @click="$emit('quit')"
        >
            Quit
        </button>
    </div>
</template>
