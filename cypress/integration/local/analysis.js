function setCustom(settingKey, newValue, scenario = 'primary') {
  // sets a value in the "Customize Profile Request" box
  let newConfig = {}
  cy.get(`@${scenario}`)
    .findByLabelText(/Customize Profile Request/i)
    .as('profile')
    .invoke('val')
    .then((currentConfig) => {
      newConfig = JSON.parse(currentConfig)
      newConfig[settingKey] = newValue
      cy.get('@profile')
        .invoke('val', JSON.stringify(newConfig, null, 2))
        .trigger('change')
    })
}

function fetchResults() {
  cy.findByText(/Fetch Results/i).click()
  cy.findByText(/Fetch Results/i).should('not.exist')
  cy.findByText(/Fetch Results/i).should('exist')
}

context('Analysis', () => {
  before(() => {
    cy.setup('project')
    cy.setup('opportunities')
  })
  beforeEach(() => {
    cy.navTo('edit modifications') // refresh analysis page by navigating away
    cy.navTo('Analyze')
    // alias lots of things
    cy.get('div.leaflet-container').as('map')
    cy.get('div#PrimaryAnalysisSettings').as('primary')
    cy.get('div#ComparisonAnalysisSettings').as('comparison')
    // set a standard project, scenario, and opportunity dataset
    cy.get('@primary')
      .findByLabelText(/^Project$/)
      .click({force: true})
      .type('scratch{enter}')
    cy.get('@primary')
      .findByLabelText(/^Scenario$/)
      .click({force: true})
      .type('baseline{enter}')
    cy.findByLabelText(/^Opportunity Dataset$/)
      .click({force: true})
      .type('default{enter}')
  })

  context('of a point', () => {
    it('has all form elements', function () {
      cy.findByLabelText(/Time cutoff/i)
        .invoke('val', 75)
        .trigger('change', {force: true})
      cy.findByLabelText(/Travel time percentile/i) // note: hidden input
      cy.get('@primary')
        .findByRole('button', {name: 'Multi-point'})
        .should('be.disabled')
      cy.get('@primary').contains('scratch project')
      cy.get('@primary').contains('Baseline')
      cy.get('@primary').findAllByLabelText(/Bookmark/)
      cy.get('@primary').findByLabelText(/Access mode/i)
      cy.get('@primary').findByLabelText(/Transit modes/i)
      cy.get('@primary').findByLabelText(/Egress mode/i)
      cy.findByLabelText(/Walk speed/i)
      cy.findByLabelText(/Max walk time/i)
      cy.get('@primary').findByLabelText(/Date/i)
      cy.findByLabelText(/From time/i)
      cy.findByLabelText(/To time/i)
      cy.get('@primary').findByLabelText(/Simulated Schedules/i)
      cy.get('@primary').findByLabelText(/Maximum transfers/i)
      cy.findByLabelText(/Routing engine/i)
      cy.get('@primary').findAllByLabelText(/Bounds of analysis/i)
      cy.get('@primary').findByLabelText(/Customize Profile Request/i)
      cy.findByText(/Fetch Results/i).should('be.enabled')
    })

    it('runs, giving <del>reasonable</del> results', function () {
      // TODO make sure results are reasonable
      // use the default location
      fetchResults()
      // set new parameters
      cy.findByLabelText(/Time cutoff/i).invoke('val', 75)
      cy.findByLabelText(/Time cutoff/i).trigger('change', {force: true})
      cy.centerMapOn([39.08877, -84.5106])
      setCustom('fromLat', 39.08877)
      setCustom('fromLon', -84.5106) // TODO not working yet
      fetchResults()
      cy.get('@primary')
        .findByRole('button', {name: 'Multi-point'})
        .should('be.enabled')
      //cy.get('@map').matchImageSnapshot('post')
    })

    it('gives different results at different times', function () {
      // TODO move marker, compare results

      // set time window in morning rush
      cy.findByLabelText(/From time/i)
        .clear()
        .type('06:00')
      cy.findByLabelText(/To time/i)
        .clear()
        .type('08:00')
      fetchResults()
      // set time window in late evening
      cy.findByLabelText(/From time/i)
        .clear()
        .type('22:00')
      cy.findByLabelText(/To time/i)
        .clear()
        .type('23:59')
      fetchResults()
      // compare the two
    })

    it('charts accessibility')

    it('sets custom analysis bounds')

    it('sets a bookmark')

    it('handles access by walk/bike only')
  })

  context('of a region', () => {
    it('runs a regional analysis')

    it('compares two regional analyses')

    it('uploads an aggregation area')

    it('aggregates results to subregion')
  })
})
