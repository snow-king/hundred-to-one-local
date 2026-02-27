<script setup lang="ts">
import type { ViewMode } from '../types'
import Button from 'primevue/button'

const props = defineProps<{
  viewMode: ViewMode
}>()

const emit = defineEmits<{
  update: [mode: ViewMode]
}>()
</script>

<template>
  <div class="mode-switch rounded-2xl border border-white/20 p-2">
    <div class="flex flex-wrap gap-2">
      <Button
        label="Общий вид"
        icon="pi pi-th-large"
        size="small"
        :severity="props.viewMode === 'split' ? 'warn' : 'secondary'"
        @click="emit('update', 'split')"
      />
      <Button
        label="Только табло"
        icon="pi pi-desktop"
        size="small"
        :severity="props.viewMode === 'board' ? 'warn' : 'secondary'"
        @click="emit('update', 'board')"
      />
      <Button
        label="Только пульт"
        icon="pi pi-sliders-h"
        size="small"
        :severity="props.viewMode === 'control' ? 'warn' : 'secondary'"
        @click="emit('update', 'control')"
      />
    </div>
  </div>
</template>
