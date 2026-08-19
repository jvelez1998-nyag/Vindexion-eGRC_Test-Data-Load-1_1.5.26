import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, AlertTriangle, Calendar as CalendarIcon, Play } from "lucide-react";
import { format, addDays, addMonths, addYears } from "date-fns";

export default function ControlTestingScheduler({ controls }) {
  const [selectedControl, setSelectedControl] = useState(null);
  const [testDate, setTestDate] = useState(null);
  const [testType, setTestType] = useState('operating_effectiveness');

  const controlsDue = controls.filter(c => 
    c.next_test_date && new Date(c.next_test_date) <= addDays(new Date(), 30)
  ).sort((a, b) => new Date(a.next_test_date) - new Date(b.next_test_date));

  const calculateNextTestDate = (frequency) => {
    const now = new Date();
    switch (frequency) {
      case 'daily': return addDays(now, 1);
      case 'weekly': return addDays(now, 7);
      case 'monthly': return addMonths(now, 1);
      case 'quarterly': return addMonths(now, 3);
      case 'annual': return addYears(now, 1);
      default: return addMonths(now, 3);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Testing Queue */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Testing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {controlsDue.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">All testing up to date!</p>
                </div>
              ) : (
                controlsDue.map(control => {
                  const daysUntilDue = Math.ceil((new Date(control.next_test_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntilDue < 0;
                  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
                  
                  return (
                    <Card
                      key={control.id}
                      onClick={() => setSelectedControl(control)}
                      className={`cursor-pointer transition-all ${
                        selectedControl?.id === control.id 
                          ? 'bg-blue-500/10 border-blue-500/40' 
                          : 'bg-[#151d2e] border-[#2a3548] hover:border-[#3a4558]'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-white line-clamp-2">{control.name}</h4>
                          {isOverdue ? (
                            <Badge className="bg-rose-500 text-white border-0 text-[10px]">Overdue</Badge>
                          ) : isDueSoon ? (
                            <Badge className="bg-amber-500 text-white border-0 text-[10px]">Soon</Badge>
                          ) : (
                            <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">
                              {daysUntilDue}d
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400 capitalize">
                            {control.domain?.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            Due: {format(new Date(control.next_test_date), 'MMM d')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Test Scheduler */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedControl ? (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select a Control to Schedule</h3>
              <p className="text-slate-400">Choose a control from the queue to schedule testing</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{selectedControl.name}</CardTitle>
                    <p className="text-sm text-slate-400">Schedule Control Test</p>
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Schedule Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Control Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Domain</div>
                      <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                        {selectedControl.domain?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Type</div>
                      <Badge className="bg-purple-500/10 text-purple-400 text-xs capitalize">
                        {selectedControl.type}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Frequency</div>
                      <Badge className="bg-amber-500/10 text-amber-400 text-xs capitalize">
                        {selectedControl.frequency}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Last Tested</div>
                      <span className="text-sm text-white">
                        {selectedControl.last_test_date 
                          ? format(new Date(selectedControl.last_test_date), 'MMM d, yyyy')
                          : 'Never'}
                      </span>
                    </div>
                  </div>

                  {/* Test Type Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Test Type</label>
                    <Select value={testType} onValueChange={setTestType}>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="design" className="text-white">Design Effectiveness</SelectItem>
                        <SelectItem value="operating_effectiveness" className="text-white">Operating Effectiveness</SelectItem>
                        <SelectItem value="both" className="text-white">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Schedule Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-[#151d2e] border-[#2a3548] text-white hover:bg-[#1a2332]">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {testDate ? format(testDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1a2332] border-[#2a3548]">
                        <Calendar
                          mode="single"
                          selected={testDate}
                          onSelect={setTestDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Quick Schedule Buttons */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Quick Schedule</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestDate(new Date())}
                        className="border-[#2a3548] text-slate-400 hover:bg-[#2a3548] hover:text-white"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestDate(addDays(new Date(), 7))}
                        className="border-[#2a3548] text-slate-400 hover:bg-[#2a3548] hover:text-white"
                      >
                        Next Week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestDate(calculateNextTestDate(selectedControl.frequency))}
                        className="border-[#2a3548] text-slate-400 hover:bg-[#2a3548] hover:text-white"
                      >
                        By Frequency
                      </Button>
                    </div>
                  </div>

                  {/* Control Details */}
                  {selectedControl.testing_procedure && (
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Testing Procedure</h4>
                      <p className="text-xs text-slate-400 whitespace-pre-wrap">
                        {selectedControl.testing_procedure}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}