const test = require("tape")
const economy = require("./tokenEconomyModel")

test('should increase profit for sponsors who give money to talents', (assert) => {
  // todo: find sponsors to write unit tests
  const data = economy.randomInvestments(1000, 100, 1000)

  const datasets = economy.fullDatasets('Alex', 0.1, data)

  const firstInvestorStartAmount = datasets.diademsDatasets[0].data[0]
  const firstInvestorFinishAmount = datasets.diademsDatasets[0].data[100]

  assert.ok(firstInvestorFinishAmount > firstInvestorStartAmount)

  assert.end()
})