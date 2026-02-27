<script setup lang="ts">
import type { Player } from '../types'
import Button from 'primevue/button'
import Card from 'primevue/card'

const props = withDefaults(
  defineProps<{
    players: Player[]
    title: string
    showReset?: boolean
    compact?: boolean
  }>(),
  {
    showReset: false,
    compact: false,
  },
)

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <Card class="panel-shell rounded-3xl border-0 shadow-panel" :class="props.compact ? '' : 'h-fit'">
    <template #title>
      <div class="flex items-center justify-between gap-3">
        <span class="font-display text-2xl uppercase text-[#fff5d5]">{{ props.title }}</span>
        <Button
          v-if="props.showReset"
          label="Сброс"
          icon="pi pi-refresh"
          text
          severity="danger"
          @click="emit('reset')"
        />
      </div>
    </template>
    <template #content>
      <div class="space-y-3">
        <div
          v-for="(player, index) in props.players"
          :key="player.id"
          class="score-row"
          :class="index === 0 ? 'score-row-leading' : ''"
        >
          <p class="font-bold">
            {{ index + 1 }}. {{ player.name }}
          </p>
          <p class="font-display text-3xl">
            {{ player.score }}
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>
