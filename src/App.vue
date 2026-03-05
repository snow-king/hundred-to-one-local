<script setup lang="ts">
import type { ActiveQuestion, AnswerAttempt, GameState, Player, QuestionPack, ViewMode } from './types'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AttemptsPanel from './components/AttemptsPanel.vue'
import BoardPanel from './components/BoardPanel.vue'
import FinishedSection from './components/FinishedSection.vue'
import ModeratorPanel from './components/ModeratorPanel.vue'
import ScorePanel from './components/ScorePanel.vue'
import SetupSection from './components/SetupSection.vue'
import ViewModeSwitch from './components/ViewModeSwitch.vue'
import rawPacks from './data/packs.json'

const STORAGE_KEY = 'hundred-to-one:v1'
const COMPLETED_PACKS_STORAGE_KEY = 'hundred-to-one:completed-packs:v1'
const DEFAULT_PACK_ID = ((rawPacks as QuestionPack[])[0]?.id ?? 'classic') as string

const toast = useToast()
const answerInput = ref('')
const setupNames = ref<string[]>(['Игрок 1', 'Игрок 2', 'Игрок 3', 'Игрок 4'])
const viewMode = ref<ViewMode>('split')
const recentlyOpened = ref<Record<string, boolean>>({})
const isApplyingRemoteState = ref(false)
const selectedPackId = ref<string>(DEFAULT_PACK_ID)
const completedPackIds = ref<string[]>([])

const state = ref<GameState>({
  status: 'setup',
  selectedPackId: DEFAULT_PACK_ID,
  players: [],
  questions: [],
  currentQuestionIndex: 0,
  selectedPlayerId: null,
  attempts: [],
})

const hasSavedGame = ref(false)

const playerOptions = computed(() =>
  state.value.players.map(player => ({ label: player.name, value: player.id })),
)

const packs = computed(() => rawPacks as QuestionPack[])

const completedPackIdSet = computed(() => new Set(completedPackIds.value))

const packOptions = computed(() =>
  packs.value.map(pack => ({
    label: `${pack.title} (${pack.questions.length})${completedPackIdSet.value.has(pack.id) ? ' · ✓ пройден' : ''}`,
    value: pack.id,
  })),
)

const activePack = computed(() => {
  const currentPackId = state.value.status === 'setup' ? selectedPackId.value : state.value.selectedPackId
  return packs.value.find(pack => pack.id === currentPackId) ?? packs.value[0]
})

const currentQuestion = computed<ActiveQuestion | null>(
  () => state.value.questions[state.value.currentQuestionIndex] ?? null,
)

const isRoundCompleted = computed(
  () => !!currentQuestion.value?.answers.every(answer => answer.opened),
)

const rankedPlayers = computed(() => [...state.value.players].sort((a, b) => b.score - a.score))

const currentRoundLabel = computed(
  () => `${state.value.currentQuestionIndex + 1} / ${state.value.questions.length}`,
)

const openedAnswersCount = computed(
  () => currentQuestion.value?.answers.filter(answer => answer.opened).length ?? 0,
)

const lastAttempts = computed(() => state.value.attempts.slice(-5).reverse())

const displayAttempts = computed(() =>
  lastAttempts.value.map((attempt, idx) => ({
    id: `${attempt.createdAt}-${idx}`,
    playerName: resolvePlayerName(attempt.playerId),
    answer: attempt.answer,
    isCorrect: attempt.isCorrect,
    pointsAwarded: attempt.pointsAwarded,
  })),
)

const hasNextQuestion = computed(
  () => state.value.currentQuestionIndex + 1 < state.value.questions.length,
)

const isBoardOnlyMode = computed(() => viewMode.value === 'board')

function parseViewMode(value: string | null): ViewMode {
  if (value === 'board' || value === 'control' || value === 'split') {
    return value
  }
  return 'split'
}

function openBoardWindow() {
  const url = new URL(window.location.href)
  url.searchParams.set('view', 'board')
  const boardWindow = window.open(url.toString(), '_blank', 'noopener,noreferrer,width=1600,height=900')
  if (!boardWindow) {
    toast.add({
      severity: 'warn',
      summary: 'Окно заблокировано',
      detail: 'Разрешите всплывающие окна для открытия табло в отдельном окне.',
      life: 2600,
    })
    return
  }
  boardWindow.focus()
}

function getAnswerKey(questionId: number, answerIndex: number): string {
  return `${questionId}-${answerIndex}`
}

function markAnswerOpened(questionId: number, answerIndex: number) {
  const key = getAnswerKey(questionId, answerIndex)
  recentlyOpened.value[key] = true
  setTimeout(() => {
    delete recentlyOpened.value[key]
  }, 650)
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replaceAll('ё', 'е').replace(/\s+/g, ' ')
}

function mapQuestions(packId: string): ActiveQuestion[] {
  const selectedPack = packs.value.find(pack => pack.id === packId) ?? packs.value[0]
  return selectedPack.questions.map(question => ({
    id: question.id,
    prompt: question.prompt,
    answers: question.answers.map(answer => ({ ...answer, opened: false })),
  }))
}

function normalizeLoadedState(loaded: GameState): GameState {
  const packId = loaded.selectedPackId || DEFAULT_PACK_ID
  return {
    status: loaded.status,
    selectedPackId: packId,
    players: loaded.players ?? [],
    questions: loaded.questions ?? [],
    currentQuestionIndex: loaded.currentQuestionIndex ?? 0,
    selectedPlayerId: loaded.selectedPlayerId ?? null,
    attempts: loaded.attempts ?? [],
  }
}

function buildPlayers(names: string[]): Player[] {
  return names.map((name, index) => ({
    id: index + 1,
    name: name.trim() || `Игрок ${index + 1}`,
    score: 0,
  }))
}

function createNewGame() {
  const players = buildPlayers(setupNames.value)
  const packId = selectedPackId.value
  state.value = {
    status: 'playing',
    selectedPackId: packId,
    players,
    questions: mapQuestions(packId),
    currentQuestionIndex: 0,
    selectedPlayerId: players[0]?.id ?? null,
    attempts: [],
  }
  answerInput.value = ''
  viewMode.value = 'split'
  hasSavedGame.value = false
}

function loadCompletedPacks() {
  const loaded = localStorage.getItem(COMPLETED_PACKS_STORAGE_KEY)
  if (!loaded) {
    completedPackIds.value = []
    return
  }
  try {
    const parsed = JSON.parse(loaded) as unknown
    if (!Array.isArray(parsed)) {
      completedPackIds.value = []
      return
    }
    completedPackIds.value = parsed.filter(value => typeof value === 'string')
  }
  catch {
    completedPackIds.value = []
    localStorage.removeItem(COMPLETED_PACKS_STORAGE_KEY)
  }
}

function saveCompletedPacks() {
  localStorage.setItem(COMPLETED_PACKS_STORAGE_KEY, JSON.stringify(completedPackIds.value))
}

function markPackCompleted(packId: string) {
  if (completedPackIdSet.value.has(packId)) {
    return
  }
  completedPackIds.value = [...completedPackIds.value, packId]
  saveCompletedPacks()
}

function continueSavedGame() {
  const loaded = localStorage.getItem(STORAGE_KEY)
  if (!loaded) {
    return
  }
  try {
    const parsed = normalizeLoadedState(JSON.parse(loaded) as GameState)
    state.value = parsed
    if (!state.value.selectedPlayerId) {
      state.value.selectedPlayerId = state.value.players[0]?.id ?? null
    }
    selectedPackId.value = state.value.selectedPackId
    if (state.value.status === 'finished') {
      markPackCompleted(state.value.selectedPackId)
    }
    if (state.value.players.length === 4) {
      setupNames.value = state.value.players.map(player => player.name)
    }
  }
  catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY)
  state.value = {
    status: 'setup',
    selectedPackId: selectedPackId.value,
    players: [],
    questions: [],
    currentQuestionIndex: 0,
    selectedPlayerId: null,
    attempts: [],
  }
  answerInput.value = ''
  viewMode.value = 'split'
  hasSavedGame.value = false
}

function checkAnswer() {
  const activeQuestion = currentQuestion.value
  if (!activeQuestion || state.value.selectedPlayerId === null) {
    return
  }

  const normalizedInput = normalizeText(answerInput.value)
  if (!normalizedInput) {
    toast.add({ severity: 'warn', summary: 'Пустой ответ', detail: 'Введите ответ', life: 2000 })
    return
  }

  const matchedAnswerIndex = activeQuestion.answers.findIndex(
    answer => normalizeText(answer.text) === normalizedInput,
  )
  const matchedAnswer = matchedAnswerIndex >= 0 ? activeQuestion.answers[matchedAnswerIndex] : undefined

  if (!matchedAnswer) {
    registerAttempt({
      questionId: activeQuestion.id,
      playerId: state.value.selectedPlayerId,
      answer: answerInput.value,
      isCorrect: false,
      pointsAwarded: 0,
      createdAt: new Date().toISOString(),
    })
    toast.add({ severity: 'error', summary: 'Промах', detail: 'Нет такого слова', life: 2200 })
    answerInput.value = ''
    return
  }

  if (matchedAnswer.opened) {
    toast.add({
      severity: 'info',
      summary: 'Уже открыто',
      detail: `Ответ "${matchedAnswer.text}" уже открыт`,
      life: 2200,
    })
    answerInput.value = ''
    return
  }

  matchedAnswer.opened = true
  markAnswerOpened(activeQuestion.id, matchedAnswerIndex)
  const currentPlayer = state.value.players.find(player => player.id === state.value.selectedPlayerId)
  if (currentPlayer) {
    currentPlayer.score += matchedAnswer.points
  }

  registerAttempt({
    questionId: activeQuestion.id,
    playerId: state.value.selectedPlayerId,
    answer: answerInput.value,
    isCorrect: true,
    matchedText: matchedAnswer.text,
    pointsAwarded: matchedAnswer.points,
    createdAt: new Date().toISOString(),
  })

  toast.add({
    severity: 'success',
    summary: 'Есть совпадение',
    detail: `${matchedAnswer.text} (+${matchedAnswer.points})`,
    life: 2200,
  })
  answerInput.value = ''
}

function registerAttempt(attempt: AnswerAttempt) {
  state.value.attempts.push(attempt)
}

function nextQuestion() {
  if (state.value.currentQuestionIndex + 1 < state.value.questions.length) {
    state.value.currentQuestionIndex += 1
    answerInput.value = ''
    return
  }
  state.value.status = 'finished'
  markPackCompleted(state.value.selectedPackId)
}

function resolvePlayerName(playerId: number): string {
  return state.value.players.find(player => player.id === playerId)?.name ?? 'Игрок'
}

function loadSavedFlag() {
  const loaded = localStorage.getItem(STORAGE_KEY)
  if (!loaded) {
    hasSavedGame.value = false
    return
  }
  try {
    const parsed = normalizeLoadedState(JSON.parse(loaded) as GameState)
    hasSavedGame.value = parsed.status !== 'setup'
  }
  catch {
    hasSavedGame.value = false
    localStorage.removeItem(STORAGE_KEY)
  }
}

loadCompletedPacks()
loadSavedFlag()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  viewMode.value = parseViewMode(params.get('view'))

  window.addEventListener('storage', handleStorageSync)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageSync)
})

function handleStorageSync(event: StorageEvent) {
  if (event.key === COMPLETED_PACKS_STORAGE_KEY) {
    loadCompletedPacks()
    return
  }

  if (event.key !== STORAGE_KEY) {
    return
  }

  if (!event.newValue) {
    isApplyingRemoteState.value = true
    state.value = {
      status: 'setup',
      selectedPackId: selectedPackId.value,
      players: [],
      questions: [],
      currentQuestionIndex: 0,
      selectedPlayerId: null,
      attempts: [],
    }
    answerInput.value = ''
    hasSavedGame.value = false
    isApplyingRemoteState.value = false
    return
  }

  try {
    const remoteState = normalizeLoadedState(JSON.parse(event.newValue) as GameState)
    isApplyingRemoteState.value = true
    state.value = remoteState
    selectedPackId.value = remoteState.selectedPackId
    hasSavedGame.value = remoteState.status !== 'setup'
    if (remoteState.players.length === 4) {
      setupNames.value = remoteState.players.map(player => player.name)
    }
    isApplyingRemoteState.value = false
  }
  catch {
    isApplyingRemoteState.value = false
  }
}

watch(viewMode, (mode) => {
  const url = new URL(window.location.href)
  url.searchParams.set('view', mode)
  window.history.replaceState({}, '', url)
})

watch(
  state,
  (newState) => {
    if (isApplyingRemoteState.value) {
      return
    }
    if (newState.status === 'setup') {
      return
    }
    const serialized = JSON.stringify(newState)
    if (localStorage.getItem(STORAGE_KEY) === serialized) {
      return
    }
    localStorage.setItem(STORAGE_KEY, serialized)
    hasSavedGame.value = true
  },
  { deep: true },
)
</script>

<template>
  <Toast position="top-right" />

  <main
    class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    :class="isBoardOnlyMode && state.status === 'playing' ? 'max-w-[1500px] py-3' : ''"
  >
    <header
      v-if="!(isBoardOnlyMode && state.status === 'playing')"
      class="show-header mb-6 rounded-3xl border border-white/30 p-6 text-white shadow-panel"
    >
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="font-display text-sm uppercase tracking-[0.2em] text-amber-200">
            телевизионный формат
          </p>
          <h1 class="font-display text-4xl uppercase sm:text-5xl">
            100 к 1
          </h1>
          <p class="mt-2 text-base text-white/85">
            Ведущий выбирает игрока, проверяет ответы и управляет раундами.
          </p>
        </div>
        <div class="show-counter rounded-2xl px-4 py-2 text-right">
          <p class="text-xs uppercase tracking-[0.2em] text-amber-200">
            Раунд
          </p>
          <p class="font-display text-3xl leading-none">
            {{ currentRoundLabel }}
          </p>
        </div>
      </div>
    </header>

    <SetupSection
      v-if="state.status === 'setup'"
      :setup-names="setupNames"
      :selected-pack-id="selectedPackId"
      :pack-options="packOptions"
      :active-pack-description="activePack?.description ?? ''"
      :has-saved-game="hasSavedGame"
      @update-name="(index, value) => (setupNames[index] = value)"
      @update-pack="(value) => (selectedPackId = value)"
      @start="createNewGame"
      @continue="continueSavedGame"
    />

    <section v-else-if="state.status === 'playing'" class="space-y-4">
      <ViewModeSwitch
        v-if="!isBoardOnlyMode"
        :view-mode="viewMode"
        @update="(mode) => (viewMode = mode)"
        @open-board-window="openBoardWindow"
      />

      <div class="grid gap-6" :class="viewMode === 'control' ? 'grid-cols-1' : 'lg:grid-cols-[2.1fr_1fr]'">
        <div class="space-y-6">
          <BoardPanel
            v-show="viewMode !== 'control'"
            :current-question="currentQuestion"
            :opened-answers-count="openedAnswersCount"
            :active-pack-title="activePack?.title ?? ''"
            :recently-opened="recentlyOpened"
          />

          <ModeratorPanel
            v-show="viewMode !== 'board'"
            :player-options="playerOptions"
            :selected-player-id="state.selectedPlayerId"
            :answer-input="answerInput"
            :is-round-completed="isRoundCompleted"
            :has-next-question="hasNextQuestion"
            @update-player-id="(value) => (state.selectedPlayerId = value)"
            @update-answer="(value) => (answerInput = value)"
            @check="checkAnswer"
            @next="nextQuestion"
          />

          <AttemptsPanel v-show="viewMode !== 'board'" :attempts="displayAttempts" />
        </div>

        <ScorePanel
          v-show="viewMode !== 'control'"
          :players="rankedPlayers"
          title="Табло"
          :show-reset="viewMode !== 'board'"
          @reset="resetGame"
        />
      </div>
    </section>

    <FinishedSection v-else :ranked-players="rankedPlayers" @reset="resetGame" @replay="createNewGame" />
  </main>
</template>
