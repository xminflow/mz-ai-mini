/** 使用矢量轮廓保持图标在不同系统上的形状一致，避免 Unicode 字符随字体变化。 */
export function SocialIcons() {
  return <><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.8-9L1.8 2h6.5l4.5 6.7L18.9 2ZM17.8 20h1.8L7.2 4H5.3l12.5 16Z" /></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.6 19.3c0-.8 0-1.7.2-2.5l1.3-5.5s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.3.7 1.3 1.5 0 .9-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.5-4.6-4.5-3.2 0-5 2.4-5 4.8 0 1 .4 2 1 2.6l.2.6-.3 1c0 .2-.2.3-.5.2-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.4-6.9 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.5 7.1-5.9 7.1-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.2 1-.9 2-1.3 2.8A10 10 0 1 0 12 2Z" /></svg><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="2" width="18" height="20" rx="4" /><text x="12" y="17" textAnchor="middle" fill="white" fontSize="18">@</text></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8V12h2.4V9.8c0-2.4 1.4-3.8 3.6-3.8l2.2.2v2.4H15c-1.2 0-1.5.7-1.5 1.5V12H16l-.4 2.9h-2.1v7A10 10 0 0 0 22 12Z" /></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 2c.3 3 1.9 4.7 4.5 4.9v3.2a9.5 9.5 0 0 1-4.5-1.4v7.1a6 6 0 1 1-5.2-5.9v3.3a2.8 2.8 0 1 0 2 2.6V2h3.2Z" /></svg></>
}

export function StepIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 40 40" aria-hidden="true">{index === 0 ? <g transform="rotate(45 20 20)">{[[7,7],[21,7],[7,21],[21,21]].map(([x,y]) => <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" rx="2" />)}</g> : index === 1 ? <><rect x="9" y="2" width="22" height="36" rx="4" /><circle cx="20" cy="32" r="2" fill="white" /></> : <><rect x="2" y="2" width="36" height="36" rx="4" /><path d="M8 13h24M12 20h16M17 27h6" fill="none" stroke="white" strokeWidth="2" /></>}</svg>
}

export function Mark({ className = '' }: { className?: string }) {
  return <span className={`vl-mark ${className}`} aria-hidden="true"><img src="/logo/weiyu-logo-web-light.svg" alt="" /></span>
}

export function BrandLogos() {
  return <div className="vl-logo-track">{[0,1].map(repeat => <div className="vl-logo-group" key={repeat} aria-hidden={repeat === 1}>{['theo','amsterdam','milano','venice'].map(brand => <img key={brand} src={`/templates/viral/assets/logo-${brand}.svg`} alt={repeat ? '' : brand} />)}</div>)}</div>
}
