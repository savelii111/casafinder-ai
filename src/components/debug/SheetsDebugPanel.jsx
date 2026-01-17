import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, FileSpreadsheet } from 'lucide-react';

export default function SheetsDebugPanel({ language = 'ru' }) {
  return null; // Disabled
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const spreadsheetId = localStorage.getItem('rentai_spreadsheet_id');
      
      if (!spreadsheetId) {
        setStatus({
          type: 'warning',
          message: 'Google Sheets не настроен',
          action: 'Нажмите "Создать Google Sheet"'
        });
        setLoading(false);
        return;
      }

      // Проверяем доступ к таблице
      const result = await base44.functions.invoke('getListingsFromGoogleSheets', { 
        spreadsheetId 
      });

      setStatus({
        type: 'success',
        message: `✅ Google Sheets работает`,
        details: `Документ: ${result.data.documentTitle || 'Unknown'}`,
        rows: `Строк: ${result.data.rawCount || 0}`,
        spreadsheetId: spreadsheetId
      });

    } catch (error) {
      setStatus({
        type: 'error',
        message: '❌ Ошибка доступа к Google Sheets',
        error: error.message
      });
    }
    setLoading(false);
  };

  const createSheet = async () => {
    setLoading(true);
    setLogs([]);
    const addLog = (msg) => setLogs(prev => [...prev, msg]);
    
    setStatus({
      type: 'warning',
      message: '⏳ Создаём Google Sheets...',
    });
    
    try {
      addLog('1️⃣ Вызываем syncListingsToGoogleSheets...');
      
      const result = await base44.functions.invoke('syncListingsToGoogleSheets', {
        sheetName: 'Listings',
        city: 'Madrid'
      });

      addLog(`2️⃣ Получен ответ: ${result.status}`);
      addLog(`3️⃣ Данные: ${JSON.stringify(result.data).substring(0, 200)}`);

      if (result.data?.error) {
        addLog(`❌ ОШИБКА: ${result.data.error}`);
        if (result.data.details) addLog(`Детали: ${result.data.details}`);
        if (result.data.rowsCount) addLog(`Строк: ${result.data.rowsCount}`);
        if (result.data.dataSize) addLog(`Размер: ${(result.data.dataSize / 1024).toFixed(2)} KB`);
        if (result.data.stack) addLog(`Stack: ${result.data.stack.substring(0, 300)}`);
        
        setStatus({
          type: 'error',
          message: '❌ Ошибка от сервера',
          error: result.data.error,
          details: result.data.details || ''
        });
        setLoading(false);
        return;
      }

      if (result.data.spreadsheetId) {
        localStorage.setItem('rentai_spreadsheet_id', result.data.spreadsheetId);
        addLog(`✅ ID сохранён: ${result.data.spreadsheetId}`);
        
        setStatus({
          type: 'success',
          message: '✅ Google Sheets создан!',
          details: `Строк: ${result.data.rows || 0}`,
          spreadsheetId: result.data.spreadsheetId,
          url: result.data.spreadsheetUrl
        });
        
        setTimeout(() => window.location.reload(), 2000);
      } else {
        addLog('❌ spreadsheetId не найден в ответе');
        setStatus({
          type: 'error',
          message: '❌ Не получен spreadsheetId',
          error: JSON.stringify(result.data)
        });
      }
    } catch (error) {
      addLog(`❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`);
      if (error.response?.data) {
        addLog(`Response: ${JSON.stringify(error.response.data)}`);
      }
      
      setStatus({
        type: 'error',
        message: '❌ Ошибка выполнения',
        error: error.message,
        details: error.response?.data?.error || ''
      });
    }
    setLoading(false);
  };

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
        <h3 className="font-bold text-blue-900">Google Sheets Диагностика</h3>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={checkStatus} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Проверить статус
        </Button>

        <Button 
          onClick={createSheet}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Создать/Обновить Google Sheet
        </Button>

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mt-2 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        {status && (
          <div className={`p-3 rounded-lg mt-3 ${
            status.type === 'success' ? 'bg-green-100 border border-green-300' :
            status.type === 'warning' ? 'bg-yellow-100 border border-yellow-300' :
            'bg-red-100 border border-red-300'
          }`}>
            <div className="flex items-start gap-2">
              {status.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> : 
               status.type === 'warning' ? <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" /> :
               <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
              <div className="flex-1 text-xs break-words">
                <p className="font-semibold">{status.message}</p>
                {status.details && <p className="mt-1">{status.details}</p>}
                {status.error && (
                  <p className="mt-1 text-red-700 whitespace-pre-wrap">{status.error}</p>
                )}
                {status.spreadsheetId && (
                  <p className="mt-1 font-mono break-all">ID: {status.spreadsheetId}</p>
                )}
                {status.url && (
                  <a 
                    href={status.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-1 block"
                  >
                    Открыть таблицу →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}