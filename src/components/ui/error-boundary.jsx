import { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { createPageUrl } from "@/utils";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f1623] flex items-center justify-center p-6">
          <Card className="bg-[#1a2332] border-rose-500/30 max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
                  <AlertTriangle className="h-6 w-6 text-rose-400" />
                </div>
                <CardTitle className="text-white">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm">
                We encountered an unexpected error. Please try refreshing the page or return to the dashboard.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs text-rose-400 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => window.location.href = createPageUrl('Dashboard')} 
                  variant="outline"
                  className="border-[#2a3548] text-slate-400 hover:text-white hover:bg-[#2a3548]"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}