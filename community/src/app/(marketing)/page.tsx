export default function HomePage() {
  return (
    <section className="relative flex flex-col items-center py-20 text-center">
      <span className="glass mb-6 rounded-pill px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-2">
        通用知识问答社区
      </span>
      <h1 className="max-w-2xl font-display text-5xl font-medium leading-[1.1] tracking-tight text-ink sm:text-6xl">
        把每一个问题，
        <br className="hidden sm:block" />
        聊到<span className="text-fusion">通透</span>
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-mute">
        在这里提问、分享见解、沉淀知识，与好奇的人一起寻找答案。
      </p>
      <div className="mt-9 flex items-center gap-3">
        <button className="btn-fusion px-6 py-2.5 text-sm font-semibold">开始提问</button>
        <button className="glass rounded-btn px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/8">
          浏览内容
        </button>
      </div>
      <div className="glass glow-sky mt-20 w-full max-w-xl rounded-card p-10 text-sm text-mute">
        首页内容流（Feed）占位 —— 后续在此展示最新提问与热门分享。
      </div>
    </section>
  )
}
