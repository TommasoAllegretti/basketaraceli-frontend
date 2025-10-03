import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, FormSelect } from '@/components/ui/form-field'

export function ResponsiveTest() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Responsive Design Test</h1>

      {/* Button Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Button Responsiveness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button className="w-full sm:w-auto">Primary Button</Button>
            <Button variant="outline" className="w-full sm:w-auto">
              Outline Button
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto">
              Destructive Button
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Form Responsiveness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="test-input" label="Test Input" value="" onChange={() => {}} placeholder="Test placeholder" />
            <FormSelect
              id="test-select"
              label="Test Select"
              value=""
              onChange={() => {}}
              options={[
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
