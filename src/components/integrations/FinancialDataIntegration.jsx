import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";

const dataSources = [
  {
    name: "Bloomberg Terminal",
    type: "Market Data",
    status: "connected",
    dataPoints: ["Stock prices", "Market indices", "Volatility data", "Credit ratings"],
    lastSync: "Real-time",
    riskFactors: 15
  },
  {
    name: "Reuters Eikon",
    type: "Financial News & Data",
    status: "disconnected",
    dataPoints: ["Market news", "Economic indicators", "Company financials", "Commodities"],
    lastSync: "Never",
    riskFactors: 0
  },
  {
    name: "Federal Reserve Economic Data (FRED)",
    type: "Economic Indicators",
    status: "connected",
    dataPoints: ["Interest rates", "GDP", "Unemployment", "Inflation"],
    lastSync: "2 hours ago",
    riskFactors: 8
  },
  {
    name: "S&P Capital IQ",
    type: "Company & Industry Data",
    status: "disconnected",
    dataPoints: ["Company profiles", "Industry analysis", "M&A data", "Credit metrics"],
    lastSync: "Never",
    riskFactors: 0
  }
];

const riskIndicators = [
  {
    indicator: "Market Volatility (VIX)",
    currentValue: "18.5",
    threshold: "20.0",
    status: "Normal",
    linkedRisks: 5
  },
  {
    indicator: "Interest Rate Changes",
    currentValue: "5.25%",
    threshold: "5.50%",
    status: "Watch",
    linkedRisks: 8
  },
  {
    indicator: "Credit Default Spreads",
    currentValue: "125 bps",
    threshold: "150 bps",
    status: "Normal",
    linkedRisks: 3
  },
  {
    indicator: "Currency Volatility",
    currentValue: "12.3%",
    threshold: "15.0%",
    status: "Normal",
    linkedRisks: 6
  }
];

export default function FinancialDataIntegration() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <div>
              <CardTitle className="text-white">Financial Market Data Integration</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Incorporate real-time financial data for enhanced risk assessment</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Financial Risk Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {riskIndicators.map((indicator, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-white text-sm">{indicator.indicator}</div>
                  <Badge className={
                    indicator.status === "Alert" ? "bg-rose-500/20 text-rose-400" :
                    indicator.status === "Watch" ? "bg-amber-500/20 text-amber-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  }>
                    {indicator.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Current:</span>
                    <span className="text-slate-300 ml-2 font-semibold">{indicator.currentValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Threshold:</span>
                    <span className="text-slate-300 ml-2">{indicator.threshold}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Linked to {indicator.linkedRisks} risk assessments
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {dataSources.map((source, idx) => (
          <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{source.name}</h3>
                    <Badge className={
                      source.status === "connected" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-500/20 text-slate-400"
                    }>
                      {source.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{source.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-xs">
                  <span className="text-slate-500">Last Sync:</span>
                  <span className="text-slate-300 ml-2">{source.lastSync}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500">Risk Factors:</span>
                  <span className="text-slate-300 ml-2">{source.riskFactors}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Data Points:</div>
                <div className="flex flex-wrap gap-1">
                  {source.dataPoints.map((point, pIdx) => (
                    <Badge key={pIdx} className="bg-teal-500/20 text-teal-400 text-xs">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Financial Data Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Real-time market data sync</Label>
              <p className="text-xs text-slate-400">Update financial indicators continuously</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-adjust risk scores</Label>
              <p className="text-xs text-slate-400">Automatically update risk scores based on market data</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Alert on threshold breaches</Label>
              <p className="text-xs text-slate-400">Notify when financial indicators exceed thresholds</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Include in executive reports</Label>
              <p className="text-xs text-slate-400">Add financial risk data to dashboards and reports</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}