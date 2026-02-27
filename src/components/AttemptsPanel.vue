<script setup lang="ts">
import Card from 'primevue/card'

interface AttemptView {
  id: string
  playerName: string
  answer: string
  isCorrect: boolean
  pointsAwarded: number
}

const props = defineProps<{
  attempts: AttemptView[]
}>()
</script>

<template>
  <Card class="panel-shell rounded-3xl border-0 shadow-panel">
    <template #title>
      <span class="font-display text-2xl uppercase text-[#fff5d5]">Лента попыток</span>
    </template>
    <template #content>
      <ul class="space-y-2">
        <li
          v-for="attempt in props.attempts"
          :key="attempt.id"
          class="rounded-xl border border-white/25 bg-[#0a2d63] px-3 py-2 text-white/90"
        >
          <span class="font-bold text-amber-200">{{ attempt.playerName }}:</span>
          {{ attempt.answer }}
          <span v-if="attempt.isCorrect" class="font-bold text-emerald-300">
            — верно (+{{ attempt.pointsAwarded }})
          </span>
          <span v-else class="font-bold text-rose-300"> — нет такого слова</span>
        </li>
        <li v-if="props.attempts.length === 0" class="text-white/75">
          Пока нет попыток.
        </li>
      </ul>
    </template>
  </Card>
</template>
