import React from 'react';
import { recordPrayerIssue } from '../../utils/prayerDiagnostics';

type Props = { children: React.ReactNode };
type State = { failed: boolean };
/** Catches unexpected render errors without taking down the rest of Hayat Rehberi. */
export class PrayerErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  componentDidCatch(error: Error): void {
    recordPrayerIssue('view', 'render', error);
  }
  retry = () => this.setState({ failed: false });
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-6 text-slate-900">
        <h2 className="font-bold">Namaz Vakitleri ekranında bir hata oluştu.</h2>
        <p className="mt-2 text-sm">Diğer uygulama bölümleri çalışmaya devam eder. Hata bu tarayıcıda kaydedildi.</p>
        <button type="button" onClick={this.retry}
          className="mt-4 min-h-[44px] rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white">
          Ekranı yeniden dene
        </button>
      </section>
    );
  }
}
