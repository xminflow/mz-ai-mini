import { describe, it, expect } from 'vitest'
import { parseManifest, flattenSections, findAdjacent } from './manifest'

const valid = {
  title: '课程',
  chapters: [
    { id: 'c1', title: '章1', sections: [
      { id: '1.1', title: 's11', file: 'c1/1.html' },
      { id: '1.2', title: 's12', file: 'c1/2.html' },
    ] },
    { id: 'c2', title: '章2', sections: [
      { id: '2.1', title: 's21', file: 'c2/1.html' },
    ] },
  ],
}

describe('parseManifest', () => {
  it('接受合法结构', () => {
    expect(parseManifest(valid).chapters.length).toBe(2)
  })
  it('结构非法时抛错', () => {
    expect(() => parseManifest({ title: 'x' })).toThrow()
    expect(() => parseManifest({ title: 'x', chapters: [{ id: 'c', title: 't' }] })).toThrow()
    expect(() => parseManifest(null)).toThrow()
  })
  it('小节缺少 file 时抛错', () => {
    expect(() =>
      parseManifest({ title: 'x', chapters: [{ id: 'c', title: 't', sections: [{ id: 's', title: 't' }] }] }),
    ).toThrow()
  })
})

describe('flattenSections', () => {
  it('按章节顺序扁平化，并带上 chapterId', () => {
    const flat = flattenSections(parseManifest(valid))
    expect(flat.map((s) => s.id)).toEqual(['1.1', '1.2', '2.1'])
    expect(flat[2].chapterId).toBe('c2')
  })
})

describe('findAdjacent', () => {
  const flat = flattenSections(parseManifest(valid))
  it('首项无上一节', () => {
    const r = findAdjacent(flat, 'c1', '1.1')
    expect(r.prev).toBeNull()
    expect(r.next?.id).toBe('1.2')
    expect(r.current?.id).toBe('1.1')
  })
  it('中间项前后都有', () => {
    const r = findAdjacent(flat, 'c1', '1.2')
    expect(r.prev?.id).toBe('1.1')
    expect(r.next?.id).toBe('2.1')
  })
  it('末项无下一节', () => {
    const r = findAdjacent(flat, 'c2', '2.1')
    expect(r.prev?.id).toBe('1.2')
    expect(r.next).toBeNull()
  })
  it('未找到时 current 为 null', () => {
    const r = findAdjacent(flat, 'c9', '9.9')
    expect(r.current).toBeNull()
  })
})
