<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

interface PlayerOption {
  label: string
  value: number
}

const props = defineProps<{
  playerOptions: PlayerOption[]
  selectedPlayerId: number | null
  answerInput: string
  isRoundCompleted: boolean
  hasNextQuestion: boolean
}>()

const emit = defineEmits<{
  updatePlayerId: [value: number | null]
  updateAnswer: [value: string]
  check: []
  next: []
}>()
</script>

<template>
  <Card class="panel-shell rounded-3xl border-0 shadow-panel">
    <template #title>
      <span class="font-display text-2xl uppercase text-[#fff5d5]">Пульт ведущего</span>
    </template>
    <template #content>
      <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Select
          :model-value="props.selectedPlayerId"
          :options="props.playerOptions"
          option-label="label"
          option-value="value"
          placeholder="Кто отвечает"
          fluid
          @update:model-value="(value) => emit('updatePlayerId', value)"
        />
        <InputText
          :model-value="props.answerInput"
          placeholder="Ответ игрока"
          fluid
          @keyup.enter="emit('check')"
          @update:model-value="(value) => emit('updateAnswer', value ?? '')"
        />
        <Button label="Проверить" icon="pi pi-check" severity="warn" @click="emit('check')" />
      </div>

      <Divider class="!my-4" />

      <div v-if="props.isRoundCompleted" class="rounded-2xl border border-emerald-300/60 bg-emerald-500/15 p-4">
        <p class="font-bold text-emerald-100">
          Все ответы открыты. Переходим к следующему вопросу.
        </p>
        <Button
          class="mt-3"
          :label="props.hasNextQuestion ? 'Следующий вопрос' : 'Завершить игру'"
          icon="pi pi-arrow-right"
          severity="success"
          @click="emit('next')"
        />
      </div>
    </template>
  </Card>
</template>
