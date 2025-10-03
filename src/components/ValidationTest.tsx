import {
  validateGameForm,
  validateGameStatForm,
  validateDate,
  validateTeamSelection,
  validateScore,
  validateShootingStats,
  validateRebounds,
  type GameFormData,
  type GameStatFormData,
} from '@/lib/formValidation'

export function ValidationTest() {
  // Test game form validation
  const testGameValidation = () => {
    console.log('Testing Game Form Validation...')

    // Test valid game data
    const validGameData: GameFormData = {
      date: '2024-01-15',
      home_team_id: 1,
      away_team_id: 2,
      home_team_total_score: 85,
      away_team_total_score: 78,
    }

    const validResult = validateGameForm(validGameData)
    console.log('Valid game data:', validResult.isValid ? 'PASS' : 'FAIL', validResult.errors)

    // Test invalid game data
    const invalidGameData: GameFormData = {
      date: '2025-12-31', // Future date
      home_team_id: 1,
      away_team_id: 1, // Same team
      home_team_total_score: -5, // Negative score
      away_team_total_score: 78,
    }

    const invalidResult = validateGameForm(invalidGameData)
    console.log('Invalid game data:', !invalidResult.isValid ? 'PASS' : 'FAIL', invalidResult.errors)
  }

  // Test game stat validation
  const testGameStatValidation = () => {
    console.log('Testing Game Stat Form Validation...')

    // Test valid stat data
    const validStatData: GameStatFormData = {
      team_id: 1,
      game_id: 1,
      points: 85,
      field_goals_made: 30,
      field_goals_attempted: 65,
      offensive_rebounds: 12,
      defensive_rebounds: 35,
      total_rebounds: 47,
    }

    const validResult = validateGameStatForm(validStatData, [])
    console.log('Valid stat data:', validResult.isValid ? 'PASS' : 'FAIL', validResult.errors)

    // Test invalid stat data
    const invalidStatData: GameStatFormData = {
      team_id: 0, // Missing team
      game_id: 1,
      points: -5, // Negative points
      field_goals_made: 40, // More made than attempted
      field_goals_attempted: 30,
      offensive_rebounds: 10,
      defensive_rebounds: 20,
      total_rebounds: 35, // Wrong total (should be 30)
    }

    const invalidResult = validateGameStatForm(invalidStatData, [])
    console.log('Invalid stat data:', !invalidResult.isValid ? 'PASS' : 'FAIL', invalidResult.errors)
  }

  // Test individual validators
  const testIndividualValidators = () => {
    console.log('Testing Individual Validators...')

    // Test date validation
    const futureDateResult = validateDate('2025-12-31')
    console.log('Future date validation:', !futureDateResult.isValid ? 'PASS' : 'FAIL')

    const validDateResult = validateDate('2024-01-15')
    console.log('Valid date validation:', validDateResult.isValid ? 'PASS' : 'FAIL')

    // Test team selection
    const sameTeamResult = validateTeamSelection(1, 1)
    console.log('Same team validation:', !sameTeamResult.isValid ? 'PASS' : 'FAIL')

    const differentTeamResult = validateTeamSelection(1, 2)
    console.log('Different team validation:', differentTeamResult.isValid ? 'PASS' : 'FAIL')

    // Test score validation
    const negativeScoreResult = validateScore(-5, 'Test Score')
    console.log('Negative score validation:', !negativeScoreResult.isValid ? 'PASS' : 'FAIL')

    const validScoreResult = validateScore(85, 'Test Score')
    console.log('Valid score validation:', validScoreResult.isValid ? 'PASS' : 'FAIL')

    // Test shooting stats
    const invalidShootingResult = validateShootingStats(40, 30, 'Test Shooting')
    console.log('Invalid shooting stats:', !invalidShootingResult.isValid ? 'PASS' : 'FAIL')

    const validShootingResult = validateShootingStats(30, 40, 'Test Shooting')
    console.log('Valid shooting stats:', validShootingResult.isValid ? 'PASS' : 'FAIL')

    // Test rebounds
    const invalidReboundsResult = validateRebounds(10, 20, 35)
    console.log('Invalid rebounds total:', !invalidReboundsResult.isValid ? 'PASS' : 'FAIL')

    const validReboundsResult = validateRebounds(10, 20, 30)
    console.log('Valid rebounds total:', validReboundsResult.isValid ? 'PASS' : 'FAIL')
  }

  const runAllTests = () => {
    console.log('=== Running Form Validation Tests ===')
    testGameValidation()
    testGameStatValidation()
    testIndividualValidators()
    console.log('=== Tests Complete ===')
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Form Validation Test</h3>
      <button onClick={runAllTests} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Run Validation Tests
      </button>
      <p className="text-sm text-gray-600 mt-2">Check the browser console for test results</p>
    </div>
  )
}
