<script setup lang="ts">
import { HardDrive, History } from "lucide-vue-next";

defineProps<{ previousVideo?: string }>();
defineEmits(["local", "youtube", "previous", "quit"]);
</script>

<template>
    <div class="flex flex-col w-full h-full justify-center items-center bg-transparent">
        <div class="p-1 text-white z-10 px-3 font-light">Choose video source</div>
        <div class="bg-charcoal p-[50px] flex gap-10 rounded-md outline-white outline">
            <button
                class="flex flex-col cursor-pointer justify-center items-center aspect-square w-[100px] text-md font-light font-sans rounded-md text-white hover:outline hover:outline-white"
                @click="$emit('local')"
            >
                <HardDrive :size="40" color="white" strokeWidth="1" /> Local
            </button>
            <button
                class="flex flex-col cursor-pointer justify-center items-center aspect-square w-[100px] text-md font-light font-sans rounded-md text-white hover:outline hover:outline-white"
                @click="$emit('youtube')"
            >
                <svg role="img" viewBox="-0.5 0.5 25 25" scale="0.5" fill="white" class="h-[40px]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Youtube
            </button>
            <button
                v-if="previousVideo"
                class="flex flex-col cursor-pointer justify-center items-center aspect-square w-[100px] text-md font-light font-sans rounded-md text-white hover:outline hover:outline-white"
                @click="$emit('previous')"
            >
                <History :size="40" color="white" strokeWidth="1" /> Previous
            </button>
        </div>
        <button
            class="bg-charcoal cursor-pointer outline outline-white text-white mt-4 w-24 p-2 rounded-md hover:bg-gray-700"
            @click="$emit('quit')"
        >
            Quit
        </button>
    </div>
</template>
