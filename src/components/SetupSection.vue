<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

interface Option {
  label: string
  value: string
}

const props = defineProps<{
  setupNames: string[]
  selectedPackId: string
  packOptions: Option[]
  activePackDescription: string
  hasSavedGame: boolean
}>()

const emit = defineEmits<{
  updateName: [index: number, value: string]
  updatePack: [value: string]
  start: []
  continue: []
}>()
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
    <Card class="panel-shell rounded-3xl border-0 shadow-panel">
      <template #title>
        <span class="font-display text-2xl uppercase text-[#fff5d5]">Новая игра</span>
      </template>
      <template #content>
        <div class="space-y-4">
          <div class="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
            <label class="font-bold text-white/90">Пакет</label>
            <Select
              :model-value="props.selectedPackId"
              :options="props.packOptions"
              option-label="label"
              option-value="value"
              placeholder="Выберите набор из 2 вопросов"
              fluid
              @update:model-value="(value) => emit('updatePack', value)"
            />
          </div>

          <p class="rounded-xl border border-amber-300/40 bg-[#0a2d63] px-3 py-2 text-sm text-white/85">
            {{ props.activePackDescription }}
          </p>

          <p class="text-xs text-amber-100/80">
            Пакеты с отметкой "✓ пройден" уже были сыграны в этом браузере.
          </p>

          <div
            v-for="(name, index) in props.setupNames"
            :key="index"
            class="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center"
          >
            <label class="font-bold text-white/90" :for="`player-${index}`">Игрок {{ index + 1 }}</label>
            <InputText
              :id="`player-${index}`"
              :model-value="name"
              fluid
              @update:model-value="(value) => emit('updateName', index, value ?? '')"
            />
          </div>

          <Button label="Начать игру" class="mt-2" icon="pi pi-play" severity="warn" @click="emit('start')" />
        </div>
      </template>
    </Card>

    <Card class="panel-shell rounded-3xl border-0 shadow-panel">
      <template #title>
        <span class="font-display text-2xl uppercase text-[#fff5d5]">Сохранение</span>
      </template>
      <template #content>
        <div class="space-y-4">
          <p class="text-base text-white/85">
            Игра автоматически сохраняется в браузере и доступна после перезагрузки страницы.
          </p>
          <Button
            label="Продолжить прошлую игру"
            icon="pi pi-history"
            severity="contrast"
            :disabled="!props.hasSavedGame"
            @click="emit('continue')"
          />
        </div>
      </template>
    </Card>
  </section>
</template>
