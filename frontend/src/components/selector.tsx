

import { useState } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'

const EXIT_DISTANCE = 420
const SWIPE_THRESHOLD = 220

const swipePower = (offset: number, velocity: number) => Math.abs(offset) + Math.abs(velocity) * 0.2

type Task = {
    id: string,
    label: string
}

const stamp =
  'pointer-events-none absolute rounded-md border-2 border-neutral-300 px-2 py-0.5 text-sm uppercase tracking-wide'

export default function Selector({ onNow, onLater, onNotToday, task }: { onNow: () => void; onLater: () => void; onNotToday: () => void; task?: Task }) {
  const [flying, setFlying] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotate = useTransform(x, [-250, 250], [-6, 6])

  const nowOpacity = useTransform(x, [-(SWIPE_THRESHOLD-100), -SWIPE_THRESHOLD], [0.5, 1])
  const notTodayOpacity = useTransform(x, [SWIPE_THRESHOLD, (SWIPE_THRESHOLD-100)], [1, 0.5])
  const laterOpacity = useTransform(y, [(SWIPE_THRESHOLD-100), SWIPE_THRESHOLD], [0.5, 1])
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
    ]).then(() => onDone?.())
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (flying) return
    const { offset, velocity } = info

    if (swipePower(offset.x, velocity.x) > SWIPE_THRESHOLD) {
      const right = offset.x > 0
      flyOff(
        right ? EXIT_DISTANCE : -EXIT_DISTANCE,
        offset.y,
        right ? onNotToday : onNow,
      )
    } else if (swipePower(offset.y, velocity.y) > SWIPE_THRESHOLD && offset.y > 0) {
      flyOff(offset.x, EXIT_DISTANCE, onLater)
    } else {
      settle()
    }
  }

  return (
    <motion.div
      drag={!flying}
      dragConstraints={{ left: -160, right: 160, top: -160, bottom: 160 }}
      dragElastic={0.25}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate }}
      className="relative grid size-92 cursor-grab select-none place-items-center rounded-2xl bg-white text-neutral-900 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] active:cursor-grabbing"
    >
      <h2 className="text-2xl font-bold">Decision</h2>
      <motion.div style={{ opacity: nowOpacity, fontWeight: nowWeight }} className={`${stamp} left-4 top-4`}>
        Now
      </motion.div>
      <motion.div style={{ opacity: notTodayOpacity, fontWeight: notTodayWeight }} className={`${stamp} right-4 top-4`}>
        Not today
      </motion.div>
      <motion.div
        style={{ opacity: laterOpacity, fontWeight: laterWeight }}
        className={`${stamp} bottom-4 left-1/2 -translate-x-1/2`}>
        Later
      </motion.div>
    </motion.div>
  )
}