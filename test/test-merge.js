const ist = require("ist")
const {doc, p, img} = require("prosemirror-test-builder")
const {Change, Span} = require("..")

describe("mergeChanges", () => {
  it("can merge simple insertions", () => test(
    [[1, 1, 1, 2]], [[1, 1, 1, 2]], [[1, 1, 1, 3]]
  ))

  it("can merge simple deletions", () => test(
    [[1, 2, 1, 1]], [[1, 2, 1, 1]], [[1, 3, 1, 1]]
  ))

  it("can merge insertion before deletion", () => test(
    [[2, 3, 2, 2]], [[1, 1, 1, 2]], [[1, 1, 1, 2], [2, 3, 3, 3]]
  ))

  it("can merge insertion after deletion", () => test(
    [[2, 3, 2, 2]], [[2, 2, 2, 3]], [[2, 3, 2, 3]]
  ))

  it("can merge deletion before insertion", () => test(
    [[2, 2, 2, 3]], [[1, 2, 1, 1]], [[1, 2, 1, 2]]
  ))

  it("can merge deletion after insertion", () => test(
    [[2, 2, 2, 3]], [[3, 4, 3, 3]], [[2, 3, 2, 3]]
  ))

  it("can merge deletion of insertion", () => test(
    [[2, 2, 2, 3]], [[2, 3, 2, 2]], []
  ))

  it("can merge insertion after replace", () => test(
    [[2, 3, 2, 3]], [[3, 3, 3, 4]], [[2, 3, 2, 4]]
  ))

  it("can merge insertion before replace", () => test(
    [[2, 3, 2, 3]], [[2, 2, 2, 3]], [[2, 3, 2, 4]]
  ))

  it("can merge replace after insert", () => test(
    [[2, 2, 2, 3]], [[2, 3, 2, 3]], [[2, 2, 2, 3]]
  ))

  describe("multiple changes", () => {

    // a single merge adjusts the fromA and toA values according to the existing changes
    it("can merge non-overlapping insertions", () => test(
      [[0, 0, 0, 2]], [[6, 6, 6, 8]], [[0, 0, 0, 2], [4, 4, 6, 8]]
    ))

    // strange output: [[0,0,0,2],[2,2,6,8],[1,1,7,9]]
    it("can merge non-overlapping insertions with initial change 1", () => test(
      [[1, 1, 1, 3]], [[0, 0, 0, 2], [2, 2, 6, 8]], [[0, 0, 0, 2], [1, 1, 3, 5], [2, 2, 6, 8]]
    ))

    // sort of expected output? startA and toA have been adjusted
    it("can merge non-overlapping insertions with initial change 2", () => test(
      [[1, 1, 1, 3]], [[0, 0, 0, 2], [4, 4, 6, 8]], [[0, 0, 0, 2], [1, 1, 3, 5], [2, 2, 6, 8]]
    ))

    // sort of expected output? startA and toA have been adjusted
    it("can merge non-overlapping insertions with initial change 3", () => test(
      [[1, 1, 1, 3]], [[0, 0, 0, 2], [6, 6, 6, 8]], [[0, 0, 0, 2], [1, 1, 3, 5], [4, 4, 6, 8]]
    ))

  })

})

function range(array, author = 0) {
  let [fromA, toA] = array
  let [fromB, toB] = array.length > 2 ? array.slice(2) : array
  return new Change(fromA, toA, fromB, toB, [new Span(toA - fromA, author)], [new Span(toB - fromB, author)])
}

function test(changeA, changeB, expected) {
  const result = Change.merge(changeA.map(range), changeB.map(range), a => a)
    .map(r => [r.fromA, r.toA, r.fromB, r.toB])
  ist(JSON.stringify(result), JSON.stringify(expected))
}
