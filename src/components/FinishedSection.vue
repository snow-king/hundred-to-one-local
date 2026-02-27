<script setup lang="ts">
import type { Player } from '../types'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ScorePanel from './ScorePanel.vue'

const props = defineProps<{
  rankedPlayers: Player[]
}>()

const emit = defineEmits<{
  reset: []
  replay: []
}>()
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
    <Card class="panel-shell rounded-3xl border-0 shadow-panel">
      <template #title>
        <span class="font-display text-3xl uppercase text-[#fff5d5]">Игра завершена</span>
      </template>
      <template #content>
        <p class="text-xl text-white/85">
          Победитель:
          <span class="font-display text-3xl text-amber-200">{{ props.rankedPlayers[0]?.name }}</span>
        </p>
        <p class="mt-2 text-white/80">
          Финальный счет сохранен в браузере, можно вернуться позже.
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <Button label="Новая игра" icon="pi pi-replay" severity="warn" @click="emit('reset')" />
          <Button label="Сыграть тем же составом" icon="pi pi-play" severity="contrast" @click="emit('replay')" />
        </div>
      </template>
    </Card>

    <ScorePanel :players="props.rankedPlayers" title="Таблица" compact />
  </section>
</template>
