import React, { useState, useEffect } from 'react'
import p from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'

import { DEFAULT_SPIN_DELAY_MS, DEFAULT_SPIN_WAIT_MS } from '../../config'

export function useSpin(
  loading,
  { delayMs = DEFAULT_SPIN_DELAY_MS, waitMs = DEFAULT_SPIN_WAIT_MS },
) {
  const [lastStartSpin, setLastStartSpin] = useState(Date.now())
  const [lastEndSpin, setLastEndSpin] = useState(Date.now())

  const [renderSpin, setRenderSpin] = useState(!delayMs && loading) // start spinning if delayMs is 0

  const startSpinning = () => {
    if (renderSpin) return
    setRenderSpin(true)
    setLastStartSpin(Date.now())
  }
  const stopSpinning = () => {
    if (!renderSpin) return
    setRenderSpin(false)
    setLastEndSpin(Date.now())
  }

  useEffect(() => {
    if (loading) {
      const wait = lastEndSpin + delayMs - Date.now()
      if (wait < 1) return startSpinning()
      const t = setTimeout(startSpinning, wait)
      return () => clearTimeout(t)
    }

    const wait = lastStartSpin + waitMs - Date.now()
    if (wait < 1) return stopSpinning()
    const t = setTimeout(stopSpinning, wait)
    return () => clearTimeout(t)
  }, [loading])

  return renderSpin
}

export function ContainerSpinner() {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
      <CircularProgress />
    </div>
  )
}
export function TextSpinner({ value }) {
  return (
    <span style={{ height: '1em', color: 'gray' }}>
      <CircularProgress size='1em' />
      &nbsp;{value}
    </span>
  )
}

export default function Spinner({
  delayMs = DEFAULT_SPIN_DELAY_MS,
  waitMs = DEFAULT_SPIN_WAIT_MS,
  onSpin = () => {},
  onReady = () => {},
}) {
  const spin = useSpin(true, { delayMs, waitMs })
  useEffect(() => {
    const spT = setTimeout(onSpin, delayMs)
    const orT = setTimeout(onReady, delayMs + waitMs)

    return () => {
      clearTimeout(spT)
      clearTimeout(orT)
    }
  }, [])

  if (!spin) return null

  return <ContainerSpinner />
}
Spinner.propTypes = {
  // Wait `delayMs` milliseconds before rendering a spinner.
  delayMs: p.number,

  // Wait `waitMs` before calling onReady.
  waitMs: p.number,

  // onSpin is called when the spinner starts spinning.
  onSpin: p.func,

  // onReady is called once the spinner has spun for `waitMs`.
  onReady: p.func,
}
