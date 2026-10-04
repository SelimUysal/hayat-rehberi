import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Namaz Vakitleri Uygulama Hatası Yakalandı:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('namaz_hero_template');
      localStorage.removeItem('namaz_month_format');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 text-slate-800">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-200 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-black text-slate-900">
              Uygulama Yüklenirken Bir Sorun Oluştu
            </h2>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Hesaplama veya görünüm sırasında beklenmeyen bir hata algılandı. Sayfayı yenileyerek veya varsayılan ayarlara dönerek devam edebilirsiniz.
            </p>

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeniden Başlat & Sıfırla</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
