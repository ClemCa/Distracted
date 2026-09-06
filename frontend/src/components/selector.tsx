import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Task } from '../types'

const EXIT_DISTANCE = 420
const SWIPE_THRESHOLD = 220

const swipePower = (offset: number, velocity: number) => Math.abs(offset) + Math.abs(velocity) * 0.2


const stamp =
  'pointer-events-none absolute rounded-md border-2 border-neutral-300 px-2 py-0.5 text-sm uppercase tracking-wide'

const urgencyStyles: Record<Task['urgency'], string> = {
  urgent: 'border-rose-300 bg-rose-100 text-rose-700',
  high: 'border-amber-300 bg-amber-100 text-amber-700',
  medium: 'border-sky-300 bg-sky-100 text-sky-700',
  low: 'border-neutral-300 bg-neutral-100 text-neutral-600',
}

const importanceStyles: Record<Task['importance'], string> = {
  high: 'border-violet-300 bg-violet-100 text-violet-700',
  medium: 'border-sky-300 bg-sky-100 text-sky-700',
  low: 'border-neutral-300 bg-neutral-100 text-neutral-600',
}

export default function Selector({ onNow, onLater, onNotToday, task, urgentCount }: { onNow: () => void; onLater: () => void; onNotToday: () => void; task: Task | null; urgentCount: number }) {
  const [flying, setFlying] = useState(false)
  const isLocked = !task

  useEffect(() => {
    setFlying(false) // re-enable dragging for the next task
    settle() // reset position when task changes
  }, [task?.id, isLocked]);

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotate = useTransform(x, [-250, 250], [-6, 6])

  const nowOpacity = useTransform(x, [-(SWIPE_THRESHOLD-100), -SWIPE_THRESHOLD], [0.5, 1])
  const laterOpacity = useTransform(x, [SWIPE_THRESHOLD, (SWIPE_THRESHOLD-100)], [1, 0.5])
  const notTodayOpacity = useTransform(y, [(SWIPE_THRESHOLD-100), SWIPE_THRESHOLD], [0.5, 1])
  const nowWeight = useTransform(nowOpacity, [0.5, 1], [400, 700])
  const notTodayWeight = useTransform(notTodayOpacity, [0.5, 1], [400, 700])
  const laterWeight = useTransform(laterOpacity, [0.5, 1], [400, 700])

  const settle = () => {
    animate(x, 0, { type: 'spring', stiffness: 5000, damping: 100 })
    animate(y, 0, { type: 'spring', stiffness: 5000, damping: 100 })
  }

  const flyOff = (dx: number, dy: number, onDone?: () => void) => {
    setFlying(true)
    Promise.all([
      animate(x, dx, { duration: 0.3, ease: 'easeIn' }),
      animate(y, dy, { duration: 0.3, ease: 'easeIn' }),
    ]).then(() => {
      onDone?.()
      setFlying(false)
      settle()
    })
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (flying) return
    const { offset, velocity } = info

    if (swipePower(offset.x, velocity.x) > SWIPE_THRESHOLD) {
      const right = offset.x > 0
      flyOff(
        right ? EXIT_DISTANCE : -EXIT_DISTANCE,
        offset.y,
        right ? onLater : onNow,
      )
    } else if (swipePower(offset.y, velocity.y) > SWIPE_THRESHOLD && offset.y > 0) {
      flyOff(offset.x, EXIT_DISTANCE, onNotToday)
    } else {
      settle()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="space-y-1 text-center">
        {isLocked ? (
          <>
            <p className="text-sm text-neutral-400">
              No tasks to focus on right now
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Pick a task to focus on
            </p>
            <p className="text-sm text-neutral-400">
              Drag <span className="font-semibold text-emerald-400">left</span> for{' '}
              <span className="font-semibold text-emerald-400">Now</span>
              {' · '}
              Drag <span className="font-semibold text-amber-400">right</span> for{' '}
              <span className="font-semibold text-amber-400">Later</span>
              {' · '}
              Drag <span className="font-semibold text-rose-400">down</span> for{' '}
              <span className="font-semibold text-rose-400">Not today</span>
            </p>
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-rose-400">{urgentCount}</span>{' '}
              urgent task{urgentCount === 1 ? '' : 's'}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className={`flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl border ${
          isLocked
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300/50'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
        }`}>
          <span className="text-xl leading-none">←</span>
          <span className="text-xs font-semibold uppercase tracking-wide">Now</span>
        </div>

        {task ? (
          <motion.div
            drag={!flying}
            dragConstraints={{ left: -160, right: 160, top: -160, bottom: 160 }}
            dragElastic={0.25}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x, y, rotate }}
            className="relative grid size-92 cursor-grab select-none place-items-center rounded-2xl bg-white text-neutral-900 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] active:cursor-grabbing"
          >
            <div className="flex w-full flex-col items-center gap-3 px-10 py-8 text-center">
              <h2 className="text-2xl font-bold leading-tight">{task.label}</h2>
              {task.project && (
                <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  {task.project}
                </span>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${urgencyStyles[task.urgency]}`}>
                  {task.urgency}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${importanceStyles[task.importance]}`}>
                  {task.importance} importance
                </span>
              </div>
              {task.description && (
                <p className="line-clamp-3 max-w-full text-sm leading-snug text-neutral-600">
                  {task.description}
                </p>
              )}
            </div>
            <motion.div style={{ opacity: nowOpacity, fontWeight: nowWeight }} className={`${stamp} left-4 top-4`}>
              Now
            </motion.div>
            <motion.div style={{ opacity: laterOpacity, fontWeight: laterWeight }} className={`${stamp} right-4 top-4`}>
              Later
            </motion.div>
            <motion.div
              style={{ opacity: notTodayOpacity, fontWeight: notTodayWeight }}
              className={`${stamp} bottom-4 left-1/2 -translate-x-1/2`}>
              Not today
            </motion.div>
          </motion.div>
        ) : (
          <div className="relative grid size-92 place-items-center rounded-2xl bg-neutral-100 text-neutral-400">
              <h2 className="text-xl font-semibold leading-tight text-neutral-800">You're all caught up!</h2>
          </div>
        )}

        <div className={`flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl border ${
          isLocked
            ? 'border-amber-500/20 bg-amber-500/5 text-amber-300/50'
            : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        }`}>
          <span className="text-xl leading-none">→</span>
          <span className="text-center text-xs font-semibold uppercase tracking-wide">Later</span>
        </div>
      </div>

      <div className={`flex h-32 w-32 items-center justify-center gap-2 rounded-xl border ${
        isLocked
          ? 'border-rose-500/20 bg-rose-500/5 text-rose-300/50'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      }`}>
        <span className="text-xl leading-none">↓</span>
        <span className="text-xs font-semibold uppercase tracking-wide">Not today</span>
      </div>
    </div>
  )
}