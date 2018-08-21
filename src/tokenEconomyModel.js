const randomInvestments = (numberOfInvestors, minAmount, maxAmount) => {
  let result = []

  for (let i = 0; i < numberOfInvestors; i++) {
    result.push({
      name: `Sponsor ${i}`,
      amount: randomInteger(minAmount, maxAmount)
    })
  }

  return result
}

const sampleInvestments = () => ([
  {
    name: 'Bob',
    amount: 100
  },
  {
    name: 'Dmitriy',
    amount: 900
  },
  {
    name: 'Chloe',
    amount: 800
  },
  {
    name: 'Evgeniy',
    amount: 700
  },
  {
    name: 'Fedor',
    amount: 600
  },
  {
    name: 'George',
    amount: 500
  },
  {
    name: 'Henry',
    amount: 700
  }
])

const randomColor = () => {
  const min = 0
  const max = 255

  const r = randomInteger(min, max)
  const g = randomInteger(min, max)
  const b = randomInteger(min, max)

  return `rgb(${r}, ${g}, ${b})`
}

const randomInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const labels = (investments) => {
  let labels = investments.map((item) => `${item.name} (${item.amount}`)

  labels.unshift('Begin')

  return labels
}

const initialDiadems = (investments, person) => {
  let state = {}

  investments.forEach((item) => {
    state[item.name] = item.amount
  })

  state[person] = 0

  return state
}

const initialPersonalTokens = (investments, person) => {
  let state = {}

  investments.forEach((item) => {
    state[item.name] = 0
  })

  state[person] = 0

  return state
}

let calculateCache = {}
const calculate = (person, investorsFee, investments) => {
  let result = []

  const cache =
    typeof calculateCache[investments.length - 1] === 'object' ?
      calculateCache[investments.length - 1] : false

  let diadems = { ...initialDiadems(investments, person), ...cache.diadems }
  let personalTokens = { ...initialPersonalTokens(investments, person), ...cache.personalTokens }
  let personalTokensTotal = cache ? cache.personalTokensTotal : 0
  let start = cache ? investments.length - 1 : 0

  for (let i = start; i < investments.length; i++) {
    const {name, amount} = investments[i]

    let personalTokensReward = amount

    if (i === 0) {
      diadems[person] += amount
      diadems[name] -= amount
    } else {
      const investorsDiadems = investorsFee * amount
      const personDiadems = amount - investorsDiadems

      Object.keys(personalTokens).forEach((investorName) => {
        const investorPersonalTokens = personalTokens[investorName]
        const investorStake = investorPersonalTokens / personalTokensTotal
        const investorIncreaseDiadems = investorStake * investorsDiadems
        const investorIncreaseTokens = investorStake * ( personalTokensReward / 2 )

        if (investorName !== name) {
          if (diadems[investorName] === undefined)
            diadems[investorName] = 0

          if (personalTokens[investorName] === undefined)
            personalTokens[investorName] = 0

          diadems[investorName] += investorIncreaseDiadems
          personalTokens[investorName] += investorIncreaseTokens
        }
      })

      diadems[person] += personDiadems
      diadems[name] -= amount
    }

    personalTokensTotal += personalTokensReward
    personalTokens[name] += ( personalTokensReward / 2 )
  }

  calculateCache[investments.length] = {
    diadems, personalTokens, personalTokensTotal
  }

  return {diadems, personalTokens}
}

const fullDatasets = (person, investorsFee, data, ignorePerson = true) => {
  const investments = [ ...data ]

  let diademsDatasets = [], tokensDatasets = []
  let historyDiadems = {}, historyTokens = {}
  let names = []

  investments.forEach((item) => {
    historyDiadems[item.name] = [item.amount]
    historyTokens[item.name] = [0]
    names.push(item.name)
  })

  historyDiadems[person] = [0]
  historyTokens[person] = []
  names.push(person)

  let currentInvestments = []
  let currentInvestment = null
  while(currentInvestment = investments.shift()) {
    currentInvestments.push(currentInvestment)
    let { diadems, personalTokens } = calculate(person, investorsFee, currentInvestments)

    for (let name of names) {
      if (diadems[name] !== undefined) {
        historyDiadems[name].push(diadems[name])
        historyTokens[name].push(personalTokens[name])
      } else {
        historyDiadems[name].push(historyDiadems[name][historyDiadems[name].length - 1])
        historyTokens[name].push(historyTokens[name][historyTokens[name].length - 1])
      }
    }
  }

  if (ignorePerson === true) {
    delete historyDiadems[person]
    delete historyTokens[person]
  }

  for (let name of names) {
    diademsDatasets.push({
      label: name,
      data: historyDiadems[name],
    })

    tokensDatasets.push({
      label: name,
      data: historyTokens[name]
    })
  }

  return { diademsDatasets, tokensDatasets }
}

let stylesCache = {}
const styleDatasets = (datasets) => {
  return datasets.map((dataset) => {
      const borderColor = stylesCache[dataset.label] || randomColor()
      stylesCache[dataset.label] = borderColor

      return {
        ...dataset,
        borderColor: borderColor,
        fill: false,
        steppedLine: true
      }
    }
  )
}

const lightDatasets = (person, investorsFee, investments) => {
  let diademsDatasets = []
  let personalTokensDatasets = []

  let { diadems, personalTokens } = calculate(person, investorsFee, investments)

  let startDiadems = {}
  let startPersonalTokens = {}
  investments.forEach((investment) => {
    if(startDiadems[investment.name] === undefined) {
      startDiadems[investment.name] = 0
    }

    startDiadems[investment.name] += investment.amount

    startPersonalTokens[investment.name] = 0
  })

  for (let name in diadems) {
    diademsDatasets.push({
      label: `${name} (DDM)`,
      data: [startDiadems[name], diadems[name]]
    })

    personalTokensDatasets.push({
      label: `${name} (Token)`,
      data: [startPersonalTokens[name], personalTokens[name]]
    })
  }

  return { diademsDatasets, personalTokensDatasets }
}

module.exports = {
  sampleInvestments, randomInvestments, styleDatasets,
  labels, initialDiadems, initialPersonalTokens,
  calculate, fullDatasets, lightDatasets
}