// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import {
  FiShield, FiZap, FiUsers, FiArrowRight,
  FiCheckCircle, FiDollarSign, FiStar
} from 'react-icons/fi';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/formatters';

/* ── Stats data ── */
const STATS = [
  { value: '2,400+', label: 'Projects Posted' },
  { value: '840+',   label: 'Freelancers' },
  { value: '$1.2M',  label: 'Paid Out' },
  { value: '99%',    label: 'Success Rate' },
];

/* ── Features data ── */
const FEATURES = [
  {
    icon: <FiShield size={22} />,
    title: 'Smart Contract Escrow',
    desc: 'Funds are locked on-chain and released only when you approve the work. Zero trust required.',
  },
  {
    icon: <FiZap size={22} />,
    title: 'Instant Payments',
    desc: 'No bank delays. Payment hits your wallet the moment work is approved.',
  },
  {
    icon: <FiUsers size={22} />,
    title: 'No Middlemen',
    desc: 'Direct client-to-freelancer relationships. No platform fees eating your earnings.',
  },
];

/* ── Sample projects ── */
const SAMPLE_PROJECTS = [
  {
    title: 'DeFi Dashboard UI',
    budget: '2 MATIC',
    category: 'React',
    proposals: 12,
    desc: 'Build a responsive dashboard for token swaps and liquidity pools.',
  },
  {
    title: 'NFT Smart Contract',
    budget: '5 MATIC',
    category: 'Solidity',
    proposals: 8,
    desc: 'ERC-721 contract with minting, royalties, and IPFS metadata.',
  },
  {
    title: 'Wallet Connect UI',
    budget: '1.5 MATIC',
    category: 'Web3',
    proposals: 5,
    desc: 'MetaMask + WalletConnect integration for existing TrustLance.',
  },
];

const Home = () => {
  const { isConnected, account, connectWallet } = useWallet();

  return (
    <div>

      {/* ── HERO SECTION ── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="section-container py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12">

            {/* Left — text */}
            <div className="flex-1">
              {/* Cyan pill tag */}
              <div className="tag-cyan mb-5 w-fit">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Powered by Polygon Network
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-ink-900
                             leading-tight mb-5">
                Work smarter with{' '}
                <span className="bg-ink-900 text-cyan-400 px-2 rounded-lg">
                  blockchain
                </span>{' '}
                escrow
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
                Hire top Web3 talent and get paid — all secured by smart contracts
                on Polygon. No middlemen, no trust issues.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/explore" className="btn-primary flex items-center gap-2">
                  Explore Projects <FiArrowRight />
                </Link>
                {isConnected ? (
                  <Link to="/post-job" className="btn-secondary">
                    Post a Job
                  </Link>
                ) : (
                  <button onClick={connectWallet} className="btn-secondary">
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {['No Middlemen', 'Instant Escrow', 'On-chain Verified', 'Low Gas Fees'].map(b => (
                  <div key={b} className="badge">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating card */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="card">
                {/* Card header */}
                <div className="flex items-center justify-between mb-4 pb-4
                                border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ink-900 rounded-full flex
                                    items-center justify-center font-bold
                                    text-cyan-400 text-sm">
                      AK
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">Alex Kim</p>
                      <p className="text-gray-400 text-xs">Solidity Developer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <FiStar size={12} />
                    <span className="font-semibold">4.9</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Solidity', 'React', 'ethers.js', 'Hardhat'].map(s => (
                    <span key={s}
                      className="px-2.5 py-1 bg-gray-100 text-gray-600
                                 rounded-lg text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Escrow block */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">
                      Escrow locked
                    </span>
                    <span className="text-xs text-emerald-600 bg-emerald-50
                                     px-2 py-0.5 rounded-full font-semibold">
                      Active
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full w-3/4 bg-ink-900 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-ink-900">2.5 MATIC</span>
                    <span className="text-xs text-gray-400">75% milestone</span>
                  </div>
                </div>

                {/* Connected wallet display */}
                {isConnected && (
                  <div className="mt-3 flex items-center gap-2 text-xs
                                  text-gray-400 font-mono">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full
                                    animate-pulse" />
                    {formatAddress(account)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-ink-900">
        <div className="section-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-cyan-400">
                  {s.value}
                </p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-white">
        <div className="section-container py-20">
          <div className="text-center mb-12">
            <div className="tag-cyan mb-4 mx-auto w-fit">Why TrustLance</div>
            <h2 className="text-3xl font-extrabold text-ink-900">
              Built for the Web3 era
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Everything you need to hire or freelance — secured by code, not companies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card group">
                <div className="w-12 h-12 bg-ink-900 rounded-xl flex items-center
                                justify-center text-cyan-400 mb-4
                                group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-bold text-ink-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50">
        <div className="section-container py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-ink-900">How it works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Sign in with MetaMask — no password needed.', icon: <FiZap /> },
              { step: '02', title: 'Post or Browse', desc: 'Post a job or explore open projects.', icon: <FiUsers /> },
              { step: '03', title: 'Lock Escrow',    desc: 'Client locks payment in smart contract.', icon: <FiShield /> },
              { step: '04', title: 'Get Paid',       desc: 'Approve work, funds release instantly.', icon: <FiDollarSign /> },
            ].map((item, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-full
                                  w-full h-px bg-gray-200 -translate-x-1/2 z-0" />
                )}
                <div className="card relative z-10 text-center">
                  <div className="w-12 h-12 bg-ink-900 rounded-full flex
                                  items-center justify-center text-cyan-400
                                  mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-cyan-500 mb-1">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-ink-900 mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ── */}
      <section className="bg-white">
        <div className="section-container py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-ink-900">
              Featured Projects
            </h2>
            <Link to="/explore"
              className="flex items-center gap-1 text-sm text-cyan-600
                         hover:text-ink-900 font-semibold transition-colors">
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {SAMPLE_PROJECTS.map((p, i) => (
              <div key={i} className="card group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-ink-900 group-hover:text-cyan-600
                                 transition-colors">
                    {p.title}
                  </h3>
                  <span className="budget-tag">{p.budget}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {p.desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600
                                   rounded-lg text-xs font-medium">
                    {p.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {p.proposals} proposals
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-ink-900">
        <div className="section-container py-16 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join hundreds of freelancers and clients already using
            blockchain-secured payments.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore" className="btn-primary">
              Find Work
            </Link>
            <Link to="/post-job"
              className="px-6 py-3 border-2 border-gray-600 text-gray-300
                         hover:border-cyan-400 hover:text-cyan-400 rounded-xl
                         font-semibold transition-all duration-200">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;