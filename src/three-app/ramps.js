export const linearRamps = (blocks, tick) => {
  const seed = {
    runningTotal: 0,
    kvps: []
  }
  const finalAcc = blocks.reduce((acc, block) => {
    const newRunningTotal = acc.runningTotal + block.span
    const range = [acc.runningTotal, newRunningTotal]
    const kvp = [range, block]
    return {
      runningTotal: newRunningTotal,
      kvps: [...acc.kvps, kvp]
    }
  }, seed)
  const totalTicks = finalAcc.runningTotal
  const kvps = finalAcc.kvps
  const modTick = tick % totalTicks
  const [range, block] = kvps.find(([[fromTick, toTick]]) => modTick >= fromTick && modTick <= toTick)
  const blockStartTick = range[0]
  const { span, from, to } = block
  const progress = (modTick - blockStartTick) / span
  return from + (to - from) * progress
}
