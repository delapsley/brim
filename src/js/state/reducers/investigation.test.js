/* @flow */

import {createFinding, deleteFindingByTs, recordSearch} from "../actions"
import {getCurrentFinding, getInvestigation} from "./investigation"
import brim from "../../brim"
import initTestStore from "../../test/initTestStore"

let store
beforeEach(() => {
  store = initTestStore()
})

function get() {
  return getInvestigation(store.getState())
}

let search1 = {
  program: "search1",
  pins: [],
  spanArgs: brim.dateTuple([new Date(0), new Date(5)]).toSpan(),
  space: "default"
}

let search2 = {
  program: "search2",
  pins: [],
  spanArgs: brim.dateTuple([new Date(0), new Date(5)]).toSpan(),
  space: "default"
}

test("new finding", () => {
  const finding = {ts: brim.time().toTs()}
  store.dispatch(createFinding(finding))

  expect(get()).toEqual([
    {
      ts: {
        ns: expect.any(Number),
        sec: expect.any(Number)
      }
    }
  ])
})

test("when a new search is recorded", () => {
  expect(get()).toHaveLength(0)
  store.dispatch(recordSearch(search1))
  expect(get()).toHaveLength(1)
})

test("when a search is many times twice", () => {
  expect(get()).toHaveLength(0)
  store.dispatchAll([
    recordSearch(search1),
    recordSearch(search1),
    recordSearch(search1)
  ])
  expect(get()).toHaveLength(1)
})

test("when a search is different", () => {
  expect(get()).toHaveLength(0)
  let state = store.dispatchAll([recordSearch(search1), recordSearch(search2)])
  expect(get()).toHaveLength(2)

  expect(getCurrentFinding(state)).toEqual({
    ts: {
      ns: expect.any(Number),
      sec: expect.any(Number)
    },
    search: search2
  })
})

test("delete a single finding by ts", () => {
  let state = store.dispatchAll([recordSearch(search1), recordSearch(search2)])
  let {ts} = getCurrentFinding(state)

  state = store.dispatchAll([deleteFindingByTs(ts)])

  expect(get()[0]).toEqual({
    ts: {
      ns: expect.any(Number),
      sec: expect.any(Number)
    },
    search: search1
  })
})

test("removing several records with multiple ts", () => {
  store.dispatchAll([recordSearch(search1), recordSearch(search2)])
  let multiTs = get().map((finding) => finding.ts)
  store.dispatchAll([deleteFindingByTs(multiTs)])

  expect(get().length).toBe(0)
})
