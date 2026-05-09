const posts = [
  {
    category: "2022 RECAP",
    title: "State of the Ledger",
    author: "Timothy Guo, Sid Sharma",
    img: "/blog-1.jpg",
  },
  {
    category: "THE RACE AGAINST TIME",
    title: "Blockchain vs. Quantum Computing",
    author: "Riteka Murugesh",
    img: "/blog-2.jpg",
  },
  {
    category: "Connecting the DOTs",
    title: "",
    author: "Tiffany Liu",
    img: "/blog-3.jpg",
  },
]

export function BlogPosts() {
  return (
    <section className="border-t border-[rgba(255,255,255,0.07)]">
      <div className="px-[48px] py-12">
        <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase mb-8">Blog</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.category}
              className="flex flex-col overflow-hidden border border-[rgba(255,255,255,0.07)] group cursor-pointer"
            >
              <div className="aspect-[16/9] relative bg-[#111]">
                <img src={post.img} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 gap-4 bg-[#0a0a0a]">
                <div className="flex flex-col gap-1.5">
                  <p className="font-sans text-white/40 text-[9px] tracking-[0.2em] uppercase">{post.category}</p>
                  {post.title && (
                    <h3 className="font-serif text-white text-xl leading-[1.3] tracking-[-0.016em]">{post.title}</h3>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-sans text-white/60 text-xs">{post.author}</p>
                  <button className="font-sans text-white text-xs flex items-center gap-1.5 border-b border-white/30 pb-0.5 hover:opacity-70 transition-opacity shrink-0 ml-2">
                    Read more{" "}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14m-7-7 7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
