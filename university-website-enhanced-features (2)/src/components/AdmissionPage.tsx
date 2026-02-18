import { useState, useMemo } from 'react';
import type { AdmissionTab, BrowseMode, Department, StarAdmission, RoundResult, DeptGroup, University } from '../types/university';
import { universities, getAllCities } from '../data/universities';

interface AdmissionPageProps {
  channel: AdmissionTab;
  onBack: () => void;
}

const groupColors: Record<DeptGroup, { bg: string; text: string; dot: string; darkBg: string; darkText: string }> = {
  '一': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', darkBg: 'dark:bg-amber-900/40', darkText: 'dark:text-amber-300' },
  '二': { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500', darkBg: 'dark:bg-sky-900/40', darkText: 'dark:text-sky-300' },
  '三': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', darkBg: 'dark:bg-emerald-900/40', darkText: 'dark:text-emerald-300' },
};

const standardColors: Record<string, string> = {
  '頂': 'bg-red-500 text-white',
  '前': 'bg-orange-500 text-white',
  '均': 'bg-yellow-500 text-white',
  '後': 'bg-green-500 text-white',
  '底': 'bg-blue-500 text-white',
  'A': 'bg-red-500 text-white',
  'B': 'bg-orange-500 text-white',
};

function formatStandard(s: string): string {
  const map: Record<string, string> = { '頂': '頂標', '前': '前標', '均': '均標', '後': '後標', '底': '底標' };
  return map[s] || s;
}

function GroupBadge({ group }: { group: DeptGroup }) {
  const c = groupColors[group];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${c.bg} ${c.text} ${c.darkBg} ${c.darkText}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {group}
    </span>
  );
}

// Detail views
interface SingleDeptDetail {
  type: 'single';
  university: University;
  department: Department;
}

interface GroupedDeptDetail {
  type: 'grouped';
  groupName: string;
  group: DeptGroup;
  entries: { university: University; departments: Department[] }[];
  totalQuota: number;
}

type DetailView = SingleDeptDetail | GroupedDeptDetail;

interface GroupedByDeptName {
  groupName: string;
  group: DeptGroup;
  entries: { university: University; departments: Department[] }[];
  totalQuota: number;
}

export function AdmissionPage({ channel, onBack }: AdmissionPageProps) {
  const [browseMode, setBrowseMode] = useState<BrowseMode>('bySchool');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<DetailView | null>(null);

  const cities = getAllCities();
  const isStarRecommendation = channel === '繁星推薦';

  const allDeptsBySchool = useMemo(() => {
    const results: { university: University; department: Department }[] = [];
    universities.forEach((uni) => {
      uni.departments.forEach((dept) => {
        if (dept.admissions.some(a => a.channel === channel)) {
          results.push({ university: uni, department: dept });
        }
      });
    });
    return results;
  }, [channel]);

  const filtered = useMemo(() => {
    let results = allDeptsBySchool;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(item =>
        item.university.name.toLowerCase().includes(q) ||
        item.university.shortName.toLowerCase().includes(q) ||
        item.department.name.toLowerCase().includes(q) ||
        item.department.groupName.toLowerCase().includes(q) ||
        item.department.id.includes(q)
      );
    }
    if (selectedCity) results = results.filter(i => i.university.location.city === selectedCity);
    if (selectedType) results = results.filter(i => i.university.type === selectedType);
    if (selectedGroup) results = results.filter(i => i.department.group === selectedGroup);
    return results;
  }, [allDeptsBySchool, searchQuery, selectedCity, selectedType, selectedGroup]);

  const schoolMap = useMemo(() => {
    const map = new Map<string, { university: University; departments: Department[] }>();
    filtered.forEach(({ university, department }) => {
      if (!map.has(university.id)) map.set(university.id, { university, departments: [] });
      map.get(university.id)!.departments.push(department);
    });
    return map;
  }, [filtered]);

  const deptNameGroups = useMemo(() => {
    const map = new Map<string, GroupedByDeptName>();
    filtered.forEach(({ university, department }) => {
      const gn = department.groupName;
      if (!map.has(gn)) {
        map.set(gn, { groupName: gn, group: department.group, entries: [], totalQuota: 0 });
      }
      const g = map.get(gn)!;
      let entry = g.entries.find(e => e.university.id === university.id);
      if (!entry) { entry = { university, departments: [] }; g.entries.push(entry); }
      entry.departments.push(department);
      g.totalQuota += department.admissions
        .filter(a => a.channel === channel)
        .reduce((s, a) => s + a.quota, 0);
    });
    return map;
  }, [filtered, channel]);

  const clearFilters = () => { setSearchQuery(''); setSelectedCity(''); setSelectedType(''); setSelectedGroup(''); };
  const hasFilters = searchQuery || selectedCity || selectedType || selectedGroup;

  // Detail view
  if (detailView) {
    return (
      <DetailPage detail={detailView} channel={channel} isStarRecommendation={isStarRecommendation} onBack={() => setDetailView(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3">
            <button onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              返回首頁
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-gray-700" />
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              {isStarRecommendation ? '⭐ ' : '📋 '}{channel}
            </h1>
          </div>
        </div>
      </header>

      <div className="h-1" />

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex rounded-lg bg-slate-200/70 dark:bg-gray-800 p-0.5">
              <button onClick={() => { setBrowseMode('bySchool'); setSelectedSchool(null); }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${browseMode === 'bySchool' ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}`}>
                依學校瀏覽
              </button>
              <button onClick={() => { setBrowseMode('byDepartment'); setSelectedSchool(null); }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${browseMode === 'byDepartment' ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}`}>
                依科系瀏覽
              </button>
            </div>
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="搜尋學校、科系、代碼..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 outline-none focus:border-blue-400">
              <option value="">全部類型</option>
              <option value="國立">國立</option>
              <option value="私立">私立</option>
            </select>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 outline-none focus:border-blue-400">
              <option value="">全部地區</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 outline-none focus:border-blue-400">
              <option value="">全部類組</option>
              <option value="一">一類</option>
              <option value="二">二類</option>
              <option value="三">三類</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters}
                className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                清除篩選
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">

        {/* 依學校 - 學校列表 */}
        {browseMode === 'bySchool' && !selectedSchool && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(schoolMap.entries()).map(([uniId, { university: uni }]) => (
                <button key={uniId} onClick={() => setSelectedSchool(uniId)}
                  className="group text-left rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${uni.type === '國立' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'}`}>{uni.type}</span>
                    <span className="text-xs text-slate-400 dark:text-gray-500">代碼 {uni.code}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{uni.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500 dark:text-gray-500">{uni.location.city} {uni.location.district}</p>
                    <span className="text-xs font-medium text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5">{schoolMap.get(uniId)!.departments.length} 個科系</span>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* 依學校 - 科系列表 */}
        {browseMode === 'bySchool' && selectedSchool && schoolMap.has(selectedSchool) && (() => {
          const { university: uni, departments: depts } = schoolMap.get(selectedSchool)!;
          const sortedDepts = [...depts].sort((a, b) => a.id.localeCompare(b.id));
          return (
            <div>
              <button onClick={() => setSelectedSchool(null)}
                className="flex items-center gap-1.5 mb-4 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                返回學校列表
              </button>
              <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${uni.type === '國立' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'}`}>{uni.type}</span>
                  <span className="text-xs text-slate-400 dark:text-gray-500">代碼 {uni.code}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{uni.name}</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{uni.location.city} {uni.location.district}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-bold text-slate-600 dark:text-gray-300 w-24">代碼</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600 dark:text-gray-300">科系名稱</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-600 dark:text-gray-300 w-16">類組</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {sortedDepts.map((dept) => (
                      <tr key={dept.id}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                        onClick={() => setDetailView({ type: 'single', university: uni, department: dept })}>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 rounded px-2 py-1">{dept.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-800 dark:text-gray-200">{dept.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <GroupBadge group={dept.group} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* 依科系瀏覽 */}
        {browseMode === 'byDepartment' && (
          <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-bold text-slate-600 dark:text-gray-300 w-28">代碼</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 dark:text-gray-300">科系名稱</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-600 dark:text-gray-300 w-16">類組</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {Array.from(deptNameGroups.values())
                  .sort((a, b) => {
                    const order: DeptGroup[] = ['一', '二', '三'];
                    return order.indexOf(a.group) - order.indexOf(b.group);
                  })
                  .map((g) => {
                    const allCodes = g.entries.flatMap(e => e.departments.map(d => d.id)).sort();
                    const codeDisplay = allCodes.length === 1 ? allCodes[0] : `${allCodes[0]}~${allCodes[allCodes.length - 1]}`;
                    const totalSubDepts = g.entries.reduce((s, e) => s + e.departments.length, 0);
                    return (
                      <tr key={g.groupName}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                        onClick={() => setDetailView({ type: 'grouped', ...g })}>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 rounded px-2 py-1">{codeDisplay}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-800 dark:text-gray-200">{g.groupName}</span>
                          {totalSubDepts > 1 && (
                            <span className="ml-2 text-xs text-slate-400 dark:text-gray-500">({totalSubDepts} 組)</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <GroupBadge group={g.group} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center">
            <h3 className="text-base font-semibold text-slate-700 dark:text-gray-300 mb-1">沒有找到符合條件的結果</h3>
            <p className="text-sm text-slate-500 dark:text-gray-500 mb-4">請嘗試調整篩選條件</p>
            <button onClick={clearFilters}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              清除篩選
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Detail Page - shows ALL years stacked
// ===========================================
function DetailPage({ detail, channel, isStarRecommendation, onBack }: {
  detail: DetailView;
  channel: AdmissionTab;
  isStarRecommendation: boolean;
  onBack: () => void;
}) {
  const entries: { university: University; departments: Department[] }[] =
    detail.type === 'single'
      ? [{ university: detail.university, departments: [detail.department] }]
      : detail.entries;

  const detailName = detail.type === 'single' ? detail.department.name : detail.groupName;
  const detailGroup = detail.type === 'single' ? detail.department.group : detail.group;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3">
            <button onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              返回列表
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-gray-700" />
            <h1 className="text-base font-bold text-slate-900 dark:text-white">{detailName}</h1>
            <GroupBadge group={detailGroup} />
          </div>
        </div>
      </header>

      <div className={`${isStarRecommendation ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} px-4 py-6`}>
        <div className="mx-auto max-w-7xl text-center text-white">
          <h2 className="text-2xl font-bold mb-2">{detailName}</h2>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-bold">{detailGroup}類</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {entries.map(({ university: uni, departments: depts }) => (
          <div key={uni.id}>
            <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 mb-4">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-400">
                <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${uni.type === '國立' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'}`}>{uni.type}</span>
                <span className="font-bold text-slate-900 dark:text-white">{uni.name}</span>
                <span className="text-slate-300 dark:text-gray-600">|</span>
                <span>{uni.location.city} {uni.location.district}</span>
                <span className="text-slate-300 dark:text-gray-600">|</span>
                <span>代碼 {uni.code}</span>
              </div>
            </div>

            {depts.map((d) => {
              // Get all star admissions for this department, sorted by year desc
              const allStarAdmissions = d.admissions
                .filter(a => a.channel === channel) as StarAdmission[];
              const sortedByYear = [...allStarAdmissions].sort((a, b) => b.year - a.year);
              // Get unique years
              const years = [...new Set(sortedByYear.map(a => a.year))].sort((a, b) => b - a);

              return (
                <div key={d.id} className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm mb-4">
                  {/* Department header */}
                  <div className="bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400 dark:text-gray-500">{d.id}</span>
                      <h4 className="font-bold text-slate-800 dark:text-gray-200">{d.name}</h4>
                    </div>
                    <GroupBadge group={d.group} />
                  </div>

                  {/* Each year as a separate block */}
                  {years.map((year, yearIdx) => {
                    const yearAdmissions = sortedByYear.filter(a => a.year === year);
                    return (
                      <div key={year}>
                        {/* Year divider */}
                        {yearIdx > 0 && (
                          <div className="border-t-2 border-dashed border-slate-300 dark:border-gray-600" />
                        )}

                        {/* Year header */}
                        <div className={`px-5 py-3 flex items-center gap-3 ${yearIdx === 0 ? '' : ''} ${yearIdx === 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-gray-800/50'}`}>
                          <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold ${yearIdx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-400 dark:bg-gray-600 text-white'}`}>
                            📅 {year} 學年度
                          </span>
                        </div>

                        {yearAdmissions.map((adm, admIdx) => (
                          <div key={admIdx} className={`px-5 py-4 ${admIdx > 0 ? 'border-t border-slate-100 dark:border-gray-800' : ''}`}>
                            {/* 名額 */}
                            <div className="mb-4">
                              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 mr-2">招生名額</span>
                              <span className="inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-base font-bold text-amber-700 dark:text-amber-300">
                                {adm.quota} 人
                              </span>
                            </div>

                            {/* 檢定標準 */}
                            <div className="mb-4">
                              <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-slate-100 dark:bg-gray-800 px-4 py-2 border-b border-slate-200 dark:border-gray-700">
                                  <h5 className="text-xs font-bold text-slate-600 dark:text-gray-300">學測檢定標準</h5>
                                </div>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-100 dark:border-gray-800">
                                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 dark:text-gray-400">科目</th>
                                      <th className="px-3 py-2 text-center text-xs font-bold text-slate-500 dark:text-gray-400">標準</th>
                                      <th className="px-3 py-2 text-center text-xs font-bold text-slate-500 dark:text-gray-400">級分</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                                    {adm.requirements.map((r, i) => (
                                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
                                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-gray-300">{r.subject}</td>
                                        <td className="px-3 py-2 text-center">
                                          <span className={`inline-flex rounded px-2 py-0.5 text-xs font-bold ${standardColors[r.standard] || 'bg-slate-200 text-slate-700'}`}>
                                            {formatStandard(r.standard)}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold text-slate-700 dark:text-gray-300">{r.level > 0 ? r.level : '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* 錄取結果 */}
                            <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
                              <div className="bg-slate-100 dark:bg-gray-800 px-4 py-2 border-b border-slate-200 dark:border-gray-700">
                                <h5 className="text-xs font-bold text-slate-600 dark:text-gray-300">錄取結果</h5>
                              </div>
                              <ResultTable adm={adm} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// 錄取結果表格
// ===========================================
function ResultTable({ adm }: { adm: StarAdmission }) {
  const { comparisonOrder, round1, round2 } = adm;

  function getThreshold(round: RoundResult | null, item: string): string | null {
    if (!round) return null;
    const found = round.thresholds.find(t => t.item === item);
    return found ? found.value : null;
  }

  function shortName(name: string): string {
    return name.replace('學測', '').replace('在校學業', '在校學業');
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-gray-700">
            <th className="px-3 py-2.5 text-center text-xs font-bold text-slate-500 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10 min-w-[64px]">輪次</th>
            <th className="px-3 py-2.5 text-center text-xs font-bold text-slate-500 dark:text-gray-400 min-w-[56px]">錄取</th>
            {comparisonOrder.map((item, i) => {
              const r1Val = getThreshold(round1, item);
              const r2Val = getThreshold(round2, item);
              const hasData = r1Val || r2Val;
              return (
                <th key={i} className={`px-2 py-2.5 text-center text-xs font-bold min-w-[56px] ${hasData ? 'text-slate-700 dark:text-gray-200 bg-amber-50/50 dark:bg-amber-900/20' : 'text-slate-400 dark:text-gray-500'}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-200 dark:bg-gray-700 text-[10px] font-bold text-slate-500 dark:text-gray-400">{i + 1}</span>
                    <span className="leading-tight">{shortName(item)}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr className={`border-b border-slate-100 dark:border-gray-800 ${round1 ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
            <td className="px-3 py-3 text-center sticky left-0 bg-inherit z-10">
              <span className="inline-flex rounded px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">第一輪</span>
            </td>
            <td className="px-3 py-3 text-center">
              {round1 ? <span className="font-bold text-slate-800 dark:text-gray-200">{round1.count}人</span> : <span className="text-slate-300 dark:text-gray-600">—</span>}
            </td>
            {comparisonOrder.map((item, i) => {
              const val = getThreshold(round1, item);
              return (
                <td key={i} className="px-2 py-3 text-center">
                  {val ? (
                    <span className="inline-flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300 min-w-[32px]">{val}</span>
                  ) : (
                    <span className="text-slate-200 dark:text-gray-700">—</span>
                  )}
                </td>
              );
            })}
          </tr>
          <tr className={`${round2 ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
            <td className="px-3 py-3 text-center sticky left-0 bg-inherit z-10">
              <span className="inline-flex rounded px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">第二輪</span>
            </td>
            <td className="px-3 py-3 text-center">
              {round2 ? <span className="font-bold text-slate-800 dark:text-gray-200">{round2.count}人</span> : <span className="text-slate-300 dark:text-gray-600">—</span>}
            </td>
            {comparisonOrder.map((item, i) => {
              const val = getThreshold(round2, item);
              return (
                <td key={i} className="px-2 py-3 text-center">
                  {val ? (
                    <span className="inline-flex items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 min-w-[32px]">{val}</span>
                  ) : (
                    <span className="text-slate-200 dark:text-gray-700">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
