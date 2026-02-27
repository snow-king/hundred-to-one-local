<script setup lang="ts">
import type { ActiveQuestion } from '../types'

const props = defineProps<{
  currentQuestion: ActiveQuestion | null
  openedAnswersCount: number
  activePackTitle: string
  recentlyOpened: Record<string, boolean>
}>()

function answerKey(questionId: number | undefined, index: number): string {
  return `${questionId ?? 0}-${index}`
}
</script>

<template>
  <div class="board-shell rounded-3xl p-4 sm:p-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <p class="rounded-xl border border-amber-300/60 bg-[#0c2a5a] px-4 py-2 text-sm font-bold tracking-wide text-amber-100">
        ВОПРОС
      </p>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <p class="rounded-xl border border-amber-300/60 bg-[#0c2a5a] px-4 py-2 text-sm font-bold tracking-wide text-amber-100">
          {{ props.activePackTitle }}
        </p>
        <p class="rounded-xl border border-amber-300/60 bg-[#0c2a5a] px-4 py-2 text-sm font-bold text-amber-100">
          Открыто {{ props.openedAnswersCount }} / {{ props.currentQuestion?.answers.length }}
        </p>
      </div>
    </div>

    <h2 class="mb-6 rounded-2xl border border-amber-300/50 bg-[#041635] p-4 text-center text-xl font-bold text-amber-100 sm:text-2xl">
      {{ props.currentQuestion?.prompt }}
    </h2>

    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="(answer, index) in props.currentQuestion?.answers"
        :key="`${props.currentQuestion?.id}-${index}`"
        class="board-row"
        :class="[
          answer.opened ? 'board-row-opened' : 'board-row-hidden',
          props.recentlyOpened[answerKey(props.currentQuestion?.id, index)] ? 'board-row-flip' : '',
        ]"
      >
        <span class="row-index">{{ index + 1 }}</span>
        <span class="row-answer">{{ answer.opened ? answer.text : 'СКРЫТО' }}</span>
        <span class="row-score">{{ answer.opened ? answer.points : '?' }}</span>
      </div>
    </div>
  </div>
</template>
