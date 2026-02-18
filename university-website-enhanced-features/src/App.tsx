import { useState, useEffect } from 'react';
import { AdmissionPage } from './components/AdmissionPage';
import type { AdmissionTab, PageView } from './types/university';

export function App() {
  const [pageView, setPageView] = useState<PageView>('home');
  const [admissionTab, setAdmissionTab] = useState<AdmissionTab>('繁星推薦');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const openAdmission = (tab: AdmissionTab) => {
    setAdmissionTab(tab);
    setPageView('admission');
  };

  if (pageView === 'admission') {
    return (
      <div className="relative">
        {/* Dark mode toggle floating */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-3 right-4 z-[100] flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 border border-slate-200 dark:border-gray-700 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform"
          title={darkMode ? '切換淺色模式' : '切換深色模式'}
        >
          {darkMode ? (
            <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
        <AdmissionPage channel={admissionTab} onBack={() => setPageView('home')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-200 dark:shadow-blue-900/30">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">大學入學篩選平台</h1>
                <p className="text-xs text-slate-500 dark:text-gray-500 -mt-0.5">113-114 學年度</p>
              </div>
            </div>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:scale-110 transition-transform"
              title={darkMode ? '切換淺色模式' : '切換深色模式'}
            >
              {darkMode ? (
                <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-10 sm:py-16 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">大學入學篩選平台</h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              完整收錄各大學校系繁星推薦與個人申請之檢定標準、比序、名額及錄取結果，幫助你快速查詢與比較。
            </p>
          </div>

          {/* Admission Channel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <button onClick={() => openAdmission('繁星推薦')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-6 text-left shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative">
                <h3 className="text-xl font-bold text-white mb-3">繁星推薦</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  由高中推薦在校成績優異學生，以在校排名百分比及學測成績為主要篩選依據，不需面試。
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">不需面試</span>
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">在校成績</span>
                </div>
                <div className="flex items-center gap-1 text-white/70 group-hover:text-white font-medium text-sm transition-colors">
                  進入查看
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button onClick={() => openAdmission('個人申請')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 p-6 text-left shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative">
                <h3 className="text-xl font-bold text-white mb-3">個人申請</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  學生自行選擇志願校系報名，經學測成績篩選後進入第二階段甄試，可展現個人特色與多元能力。
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">備審資料</span>
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">面試甄試</span>
                </div>
                <div className="flex items-center gap-1 text-white/70 group-hover:text-white font-medium text-sm transition-colors">
                  進入查看
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">大學入學篩選平台</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-500">提供完整的大學入學資訊查詢與比較功能。</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">入學管道</h4>
              <ul className="space-y-1.5 text-sm text-slate-500 dark:text-gray-400">
                <li onClick={() => openAdmission('繁星推薦')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">繁星推薦</li>
                <li onClick={() => openAdmission('個人申請')} className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">個人申請</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">資料說明</h4>
              <p className="text-sm text-slate-500 dark:text-gray-500">
                本站資料僅供參考，實際資訊請以各校官方公告為準。目前收錄國立臺灣大學之繁星推薦資料。
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800 text-center text-xs text-slate-400 dark:text-gray-600">
            大學入學篩選平台 — 本站為範例展示網站，資料僅供參考。
          </div>
        </div>
      </footer>
    </div>
  );
}
