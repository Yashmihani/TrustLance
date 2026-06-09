// frontend/src/pages/EscrowPage.jsx
import { useState, useEffect }  from 'react';
import { useParams, Link }      from 'react-router-dom';
import {
  FiLock, FiUnlock, FiRefreshCw,
  FiAlertTriangle, FiCheckCircle,
  FiClock, FiDollarSign, FiArrowLeft,
  FiExternalLink,
} from 'react-icons/fi';
import { useAuth }       from '../context/AuthContext';
import { useWallet }     from '../context/WalletContext';
import useContract       from '../hooks/useContract';
import projectService    from '../services/projectService';
import Spinner           from '../components/common/Spinner';
import Avatar            from '../components/common/Avatar';
import { formatDate }    from '../utils/formatters';
import toast             from 'react-hot-toast';

const STEPS = [
  { status: 0, label: 'Escrow Created',  icon: <FiLock /> },
  { status: 1, label: 'Funds Deposited', icon: <FiDollarSign /> },
  { status: 2, label: 'Work Complete',   icon: <FiCheckCircle /> },
];

const EscrowPage = () => {
  const { projectId }       = useParams();
  const { user }            = useAuth();
  const { account }         = useWallet();
  const {
    isLoading,
    createEscrow,
    depositToEscrow,
    releasePayment,
    refundClient,
    raiseDispute,
    getEscrowDetails,
    getProjectEscrowAddress,
    ESCROW_STATUS,
  } = useContract();

  const [project,       setProject]       = useState(null);
  const [escrowAddress, setEscrowAddress] = useState(null);
  const [escrowDetails, setEscrowDetails] = useState(null);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [depositAmount, setDepositAmount] = useState('');

  const isClient     = project?.client?.walletAddress?.toLowerCase() === account?.toLowerCase();
  const isFreelancer = project?.freelancer?.walletAddress?.toLowerCase() === account?.toLowerCase();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setPageLoading(true);
    try {
      const projectData = await projectService.getById(projectId);
      setProject(projectData.project);

      const existingEscrow = await getProjectEscrowAddress(projectId);
      if (existingEscrow) {
        setEscrowAddress(existingEscrow);
        const details = await getEscrowDetails(existingEscrow);
        setEscrowDetails(details);
        if (details) setDepositAmount(details.amount);
      } else {
        setDepositAmount(projectData.project?.budget || '');
      }
    } catch (error) {
      console.error('Failed to load escrow data:', error);
      toast.error('Failed to load project data');
    } finally {
      setPageLoading(false);
    }
  };

  const handleCreateEscrow = async () => {
    if (!project?.freelancer) {
      toast.error('No freelancer hired yet');
      return;
    }
    const result = await createEscrow(
      project.freelancer.walletAddress,
      projectId,
      project.deadline
    );
    if (result?.escrowAddress) {
      await projectService.update(projectId, {
        escrowAddress: result.escrowAddress,
        escrowTxHash:  result.txHash,
      });
      setEscrowAddress(result.escrowAddress);
      const details = await getEscrowDetails(result.escrowAddress);
      setEscrowDetails(details);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const txHash = await depositToEscrow(escrowAddress, depositAmount, projectId);
    if (txHash) {
      const details = await getEscrowDetails(escrowAddress);
      setEscrowDetails(details);
    }
  };

  const handleRelease = async () => {
    const confirmed = window.confirm('Release payment to freelancer? This cannot be undone.');
    if (!confirmed) return;
    const txHash = await releasePayment(
      escrowAddress,
      project.freelancer.walletAddress,
      projectId
    );
    if (txHash) {
      await projectService.update(projectId, { status: 'completed' });
      const details = await getEscrowDetails(escrowAddress);
      setEscrowDetails(details);
      setProject(prev => ({ ...prev, status: 'completed' }));
    }
  };

  const handleRefund = async () => {
    const confirmed = window.confirm('Refund full amount back to your wallet?');
    if (!confirmed) return;
    const txHash = await refundClient(escrowAddress, projectId, escrowDetails?.amount);
    if (txHash) {
      await projectService.update(projectId, { status: 'cancelled' });
      const details = await getEscrowDetails(escrowAddress);
      setEscrowDetails(details);
    }
  };

  const handleDispute = async () => {
    const confirmed = window.confirm('Raise a dispute? Platform will review and resolve.');
    if (!confirmed) return;
    const txHash = await raiseDispute(escrowAddress, projectId);
    if (txHash) {
      await projectService.update(projectId, { status: 'disputed' });
      const details = await getEscrowDetails(escrowAddress);
      setEscrowDetails(details);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="dark" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900 mb-4">Project not found</h2>
        <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  const currentStatus = escrowDetails?.status ?? -1;
  const statusInfo    = ESCROW_STATUS[currentStatus];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Back */}
      <Link
        to={`/projects/${projectId}`}
        className="flex items-center gap-2 text-gray-400 hover:text-ink-900
                   mb-6 transition-colors text-sm"
      >
        <FiArrowLeft size={16} /> Back to Project
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-ink-900 rounded-xl flex items-center justify-center">
            <FiLock className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">Escrow Payment</h1>
            <p className="text-gray-400 text-sm">{project.title}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* ── Left col ── */}
        <div className="md:col-span-2 space-y-6">

          {/* Progress Steps */}
          <div className="card">
            <h2 className="font-bold text-ink-900 mb-6">Escrow Progress</h2>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-0" />
              <div className="flex justify-between relative">
                {STEPS.map((step, i) => {
                  const done    = currentStatus >= step.status;
                  const current = currentStatus === step.status;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center
                                      justify-center z-10 transition-all ${
                        done
                          ? 'bg-ink-900 text-cyan-400'
                          : 'bg-gray-100 text-gray-400'
                      } ${current ? 'ring-4 ring-cyan-100' : ''}`}>
                        {step.icon}
                      </div>
                      <p className={`text-xs font-medium text-center ${
                        done ? 'text-ink-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {statusInfo && (
              <div className={`mt-6 px-4 py-3 rounded-xl text-sm font-medium
                              text-center ${statusInfo.color}`}>
                Current Status: {statusInfo.label}
              </div>
            )}
          </div>

          {/* Step 1: Create Escrow */}
          {!escrowAddress && isClient && (
            <div className="card border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center
                                justify-center mx-auto mb-4">
                  <FiLock className="text-gray-400 text-xl" />
                </div>
                <h3 className="font-bold text-ink-900 mb-2">Create Escrow Contract</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Deploy a smart contract to securely hold the payment.
                  This happens once per project.
                </p>

                {project.freelancer ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50
                                    border border-gray-200 rounded-xl max-w-xs mx-auto">
                      <Avatar name={project.freelancer.name} size="sm" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-ink-900">
                          {project.freelancer.name}
                        </p>
                        <p className="text-xs text-gray-400">Hired Freelancer</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateEscrow}
                      disabled={isLoading}
                      className="btn-primary flex items-center gap-2 mx-auto"
                    >
                      {isLoading
                        ? <><Spinner size="sm" color="cyan" /> Creating...</>
                        : <><FiLock /> Create Escrow</>
                      }
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-amber-600 text-sm font-medium">
                      You need to hire a freelancer first
                    </p>
                    <Link
                      to={`/projects/${projectId}`}
                      className="btn-secondary mt-3 text-sm inline-block"
                    >
                      View Proposals
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Deposit */}
          {escrowAddress && currentStatus === 0 && isClient && (
            <div className="card">
              <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
                <FiDollarSign className="text-cyan-500" />
                Deposit Payment
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Lock the agreed payment in the escrow contract.
                Funds cannot be accessed by anyone until you approve.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    Amount (MATIC)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2
                                             -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="input-field pl-10"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Project budget: {project.budget} MATIC
                  </p>
                </div>

                {depositAmount && Number(depositAmount) > 0 && (
                  <div className="bg-gray-50 border border-gray-200
                                  rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deposit amount</span>
                      <span className="font-semibold">{depositAmount} MATIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Platform fee ({escrowDetails?.platformFee || 5}%)
                      </span>
                      <span className="text-gray-500">
                        -{(depositAmount * ((escrowDetails?.platformFee || 5) / 100)).toFixed(4)} MATIC
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-semibold text-ink-900">
                        Freelancer receives
                      </span>
                      <span className="font-bold text-ink-900">
                        {(depositAmount * (1 - (escrowDetails?.platformFee || 5) / 100)).toFixed(4)} MATIC
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDeposit}
                  disabled={isLoading || !depositAmount}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading
                    ? <><Spinner size="sm" color="cyan" /> Depositing...</>
                    : <><FiLock /> Lock Funds in Escrow</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Release or Refund */}
          {escrowAddress && currentStatus === 1 && (
            <div className="card">
              <h3 className="font-bold text-ink-900 mb-2 flex items-center gap-2">
                <FiCheckCircle className="text-cyan-500" />
                Funds Locked — {escrowDetails?.amount} MATIC
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Payment is secured in the smart contract.
                Review the work and take action below.
              </p>

              <div className="grid md:grid-cols-2 gap-4">

                {/* Release */}
                {isClient && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <FiCheckCircle className="text-green-500 mb-2" size={20} />
                    <p className="font-semibold text-ink-900 text-sm mb-1">
                      Approve and Release
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Work looks good? Release payment to the freelancer.
                    </p>
                    <button
                      onClick={handleRelease}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2
                                 bg-green-600 hover:bg-green-700 text-white
                                 py-2.5 rounded-xl text-sm font-semibold
                                 transition-colors disabled:opacity-50"
                    >
                      {isLoading
                        ? <Spinner size="sm" color="white" />
                        : <><FiUnlock size={14} /> Release Payment</>
                      }
                    </button>
                  </div>
                )}

                {/* Refund */}
                {isClient && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <FiRefreshCw className="text-gray-500 mb-2" size={20} />
                    <p className="font-semibold text-ink-900 text-sm mb-1">
                      Request Refund
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Work not delivered? Get your funds back.
                    </p>
                    <button
                      onClick={handleRefund}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2
                                 border border-gray-300 text-gray-600
                                 hover:border-red-300 hover:text-red-500
                                 py-2.5 rounded-xl text-sm font-semibold
                                 transition-colors disabled:opacity-50"
                    >
                      {isLoading
                        ? <Spinner size="sm" color="gray" />
                        : <><FiRefreshCw size={14} /> Refund Me</>
                      }
                    </button>
                  </div>
                )}

                {/* Dispute */}
                {(isClient || isFreelancer) && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl md:col-span-2">
                    <FiAlertTriangle className="text-red-500 mb-2" size={20} />
                    <p className="font-semibold text-ink-900 text-sm mb-1">
                      Raise a Dispute
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Cannot agree? Raise a dispute and the platform will resolve it.
                    </p>
                    <button
                      onClick={handleDispute}
                      disabled={isLoading}
                      className="flex items-center gap-2 border border-red-300
                                 text-red-500 hover:bg-red-500 hover:text-white
                                 py-2 px-4 rounded-xl text-sm font-semibold
                                 transition-colors disabled:opacity-50"
                    >
                      <FiAlertTriangle size={14} /> Raise Dispute
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Completed */}
          {currentStatus === 2 && (
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex
                              items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-500 text-2xl" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Payment Released!</h3>
              <p className="text-gray-400 text-sm mb-4">
                {escrowDetails?.amount} MATIC has been sent to the freelancer.
              </p>
              <Link to="/dashboard" className="btn-primary text-sm">
                Back to Dashboard
              </Link>
            </div>
          )}

          {/* Refunded */}
          {currentStatus === 3 && (
            <div className="card text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex
                              items-center justify-center mx-auto mb-4">
                <FiRefreshCw className="text-gray-500 text-2xl" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Refund Processed</h3>
              <p className="text-gray-400 text-sm mb-4">
                {escrowDetails?.amount} MATIC has been returned to your wallet.
              </p>
              <Link to="/dashboard" className="btn-primary text-sm">
                Back to Dashboard
              </Link>
            </div>
          )}

          {/* Disputed */}
          {currentStatus === 4 && (
            <div className="card text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex
                              items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-red-500 text-2xl" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Dispute In Progress</h3>
              <p className="text-gray-400 text-sm mb-4">
                The platform is reviewing this dispute.
                Funds are locked until resolved.
              </p>
              <div className="flex items-center justify-center gap-2
                              text-xs text-gray-400">
                <FiClock size={12} />
                Usually resolved within 48 hours
              </div>
            </div>
          )}

          {/* Freelancer funded view */}
          {isFreelancer && currentStatus === 1 && (
            <div className="card">
              <h3 className="font-bold text-ink-900 mb-2">Payment Secured</h3>
              <p className="text-gray-400 text-sm mb-4">
                {escrowDetails?.amount} MATIC is locked in escrow.
                Complete the work and the client will release the payment.
              </p>
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-sm">
                <p className="text-cyan-800 font-medium">Your payment is guaranteed</p>
                <p className="text-cyan-700 text-xs mt-1">
                  Funds are locked in a smart contract and cannot be withdrawn
                  by anyone except through approved actions.
                </p>
              </div>
            </div>
          )}

        </div>
        {/* End left col */}

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">

          {/* Escrow details */}
          <div className="card">
            <h3 className="font-bold text-ink-900 mb-4 text-sm">Escrow Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold text-ink-900">
                  {escrowDetails?.amount || project.budget} MATIC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="font-semibold">
                  {escrowDetails?.platformFee || 5}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                {statusInfo ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs
                                   font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Not created</span>
                )}
              </div>
              {escrowDetails?.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="font-semibold">
                    {formatDate(escrowDetails.createdAt)}
                  </span>
                </div>
              )}
              {escrowDetails?.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Deadline</span>
                  <span className="font-semibold">
                    {formatDate(escrowDetails.deadline)}
                  </span>
                </div>
              )}
            </div>

            {escrowAddress && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Contract Address</p>
                
                  href={`https://mumbai.polygonscan.com/address/${escrowAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-600
                             hover:underline font-mono break-all"
                
                  {escrowAddress.slice(0, 20)}...
                  <FiExternalLink size={10} />
                
              </div>
            )}
          </div>

          {/* Parties */}
          <div className="card">
            <h3 className="font-bold text-ink-900 mb-4 text-sm">Parties</h3>
            <div className="space-y-4">

              <div>
                <p className="text-xs text-gray-400 mb-1.5">Client</p>
                <div className="flex items-center gap-2">
                  <Avatar name={project.client?.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {project.client?.name || 'Anonymous'}
                    </p>
                    {isClient && (
                      <p className="text-xs text-cyan-600">(You)</p>
                    )}
                  </div>
                </div>
              </div>

              {project.freelancer && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Freelancer</p>
                  <div className="flex items-center gap-2">
                    <Avatar name={project.freelancer?.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {project.freelancer?.name || 'Anonymous'}
                      </p>
                      {isFreelancer && (
                        <p className="text-xs text-cyan-600">(You)</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Security info */}
          <div className="bg-ink-900 rounded-2xl p-4">
            <p className="text-cyan-400 font-semibold text-sm mb-2">
              Secured by Polygon
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Funds are held in a smart contract. No one — not even
              the platform — can access them without the correct
              action being triggered.
            </p>
          </div>

        </div>
        {/* End right sidebar */}

      </div>
      {/* End grid */}

    </div>
    // End page */}
  );
};

export default EscrowPage;