export default class SelectionBounds {
  constructor(bounds) {
    // [top, right, bottom, left] to describe outer perimeter
    this.bounds = bounds || []
  }

  update(cell) {
    // console.log(`update: ${cell}`)
    // console.log(`bounds before: ${this.bounds}`)

    let [x, y] = cell.split('-').map(n => Number(n))
    if (this.bounds.length == 0) { this.bounds = [y, x, y, x] }
    this.maxX = x > this.maxX ? x : this.maxX
    this.maxY = y > this.maxY ? y : this.maxY
    // console.log(`bounds after: ${this.bounds}`)
    // console.log(this.members)
  }

  get members() {
    let out = []
    for (let x of this.range(this.minX, this.maxX)) {
      for (let y of this.range(this.minY, this.maxY)) {
        out.push(`${x}-${y}`)
      }
    }
    return out
  }

  get minY() {
    return this.bounds[0]
  }

  get maxX() {
    return this.bounds[1]
  }

  get maxY() {
    return this.bounds[2]
  }

  get minX() {
    return this.bounds[3]
  }

  set maxX(val) {
    return this.bounds[1] = val
  }

  set maxY(val) {
    return this.bounds[2] = val
  }

  range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  } 

}