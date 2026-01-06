import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function PipelineDebugger() {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    const diagnostics = {
      timestamp: new Date().toISOString(),
      stages: []
    };

    try {
      // Stage 1: Database
      console.log('🔍 [DIAGNOSTIC] Stage 1: Database');
      const dbApartments = await base44.entities.Apartment.list('-updated_date', 99999);
      diagnostics.stages.push({
        name: 'Database Fetch',
        count: dbApartments.length,
        status: dbApartments.length === 20 ? 'error' : 'success',
        details: `Fetched ${dbApartments.length} apartments from DB`
      });

      // Stage 2: Valid coordinates
      const validCoords = dbApartments.filter(a => 
        a.lat && a.lng && !isNaN(a.lat) && !isNaN(a.lng)
      );
      diagnostics.stages.push({
        name: 'Valid Coordinates',
        count: validCoords.length,
        status: validCoords.length === 20 ? 'error' : 'success',
        details: `${validCoords.length} apartments have valid coordinates`
      });

      // Stage 3: Rent vs Sale
      const rentCount = dbApartments.filter(a => a.listing_type === 'rent').length;
      const saleCount = dbApartments.filter(a => a.listing_type === 'sale').length;
      diagnostics.stages.push({
        name: 'Listing Types',
        count: dbApartments.length,
        status: 'info',
        details: `Rent: ${rentCount}, Sale: ${saleCount}`
      });

      // Stage 4: Price ranges
      const priceRanges = {
        under1000: dbApartments.filter(a => a.price < 1000).length,
        '1000-1500': dbApartments.filter(a => a.price >= 1000 && a.price < 1500).length,
        '1500-2000': dbApartments.filter(a => a.price >= 1500 && a.price < 2000).length,
        over2000: dbApartments.filter(a => a.price >= 2000).length
      };
      diagnostics.stages.push({
        name: 'Price Distribution',
        count: dbApartments.length,
        status: 'info',
        details: `<1000€: ${priceRanges.under1000}, 1000-1500€: ${priceRanges['1000-1500']}, 1500-2000€: ${priceRanges['1500-2000']}, >2000€: ${priceRanges.over2000}`
      });

      // CRITICAL CHECK
      if (dbApartments.length === 20) {
        diagnostics.critical = {
          detected: true,
          message: 'CRITICAL: Exactly 20 apartments detected - implicit limit suspected',
          location: 'Database layer or Base44 SDK entity.list() method'
        };
      }

      setPipelineData(diagnostics);
    } catch (error) {
      console.error('Diagnostic error:', error);
      diagnostics.error = error.message;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (!pipelineData) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Running Pipeline Diagnostic...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-red-500 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Pipeline Diagnostic Report
          </span>
          <Button size="sm" variant="outline" onClick={runDiagnostic} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Re-run
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Timestamp: {new Date(pipelineData.timestamp).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pipelineData.critical && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">🚨 CRITICAL ISSUE DETECTED</h3>
                <p className="text-sm text-red-800 mb-2">{pipelineData.critical.message}</p>
                <p className="text-xs text-red-700 font-mono bg-red-200 p-2 rounded">
                  Location: {pipelineData.critical.location}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {pipelineData.stages.map((stage, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-lg border ${
                stage.status === 'error' ? 'bg-red-50 border-red-300' :
                stage.status === 'success' ? 'bg-green-50 border-green-300' :
                'bg-blue-50 border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={stage.status === 'error' ? 'destructive' : 'default'}>
                    {stage.count} items
                  </Badge>
                  {stage.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                  {stage.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
              </div>
              <p className="text-xs text-gray-600">{stage.details}</p>
            </div>
          ))}
        </div>

        {pipelineData.error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800 font-mono">{pipelineData.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}