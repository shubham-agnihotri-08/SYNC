import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and download reports</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attendance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Generate detailed attendance reports for all employees</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button>Generate</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Generate leave and holiday reports</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button>Generate</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cabin Booking Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Generate cabin booking utilization reports</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button>Generate</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Employee Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Generate comprehensive employee performance summary</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date Range
              </Button>
              <Button>Generate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
