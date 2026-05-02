import React from 'react';
import {
  FiHash, FiCreditCard, FiCheckCircle, FiAlertCircle,
  FiDownload, FiRefreshCw, FiLoader,
} from 'react-icons/fi';
import { useRazorpayPayment } from '../hooks/useRazorpayPayment';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* ── tiny sub-components ──────────────────────────────────────────────────── */

function MetaGrid({ member }) {
  const statusMap = {
    completed: { dot: '#639922', label: 'Active' },
    failed:    { dot: '#E24B4A', label: 'Failed' },
  };
  const s = statusMap[member.paymentStatus] ?? { dot: '#EF9F27', label: 'Pending' };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        paddingBottom: '1rem',
        borderBottom: '0.5px solid rgba(78,174,229,0.12)',
        marginBottom: '1rem',
      }}
    >
      <MetaCell label="Member ID"  value={member.memberId} />
      <MetaCell label="Joined"     value={fmtDate(member.createdAt)} />
      <MetaCell
        label="Status"
        value={
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {s.label}
          </span>
        }
      />
    </div>
  );
}

function MetaCell({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'rgba(78,174,229,0.7)', marginBottom: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'inherit' }}>{value || '—'}</p>
    </div>
  );
}

/* ── payment states ───────────────────────────────────────────────────────── */

function PendingPayment({ mongoId }) {
  const { openPayment, isPaymentLoading } = useRazorpayPayment();

  return (
    <div
      style={{
        background: 'rgba(250,199,117,0.12)',
        border: '1px solid rgba(250,199,117,0.5)',
        borderRadius: 16,
        padding: '1rem 1.25rem',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(250,199,117,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 18,
          }}
        >
          ⏳
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#633806', marginBottom: 3 }}>
            Payment required to activate membership
          </p>
          <p style={{ fontSize: 12, color: '#854F0B', lineHeight: 1.5 }}>
            Your profile is saved. Complete payment to unlock your membership card, campaign poster, and all member benefits.
          </p>

          {/* Amount row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 10,
              marginTop: '0.875rem', paddingTop: '0.875rem',
              borderTop: '0.5px solid rgba(250,199,117,0.5)',
            }}
          >
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#633806', lineHeight: 1 }}>
                ₹100{' '}
                <span style={{ fontSize: 12, fontWeight: 400, color: '#854F0B' }}>one-time</span>
              </p>
              <div style={{ display: 'flex', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
                {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: 11, padding: '2px 9px', borderRadius: 20,
                      background: 'rgba(250,199,117,0.3)',
                      border: '0.5px solid rgba(250,199,117,0.7)',
                      color: '#854F0B', fontWeight: 600,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => openPayment(mongoId)}
              disabled={isPaymentLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#633806', color: '#FAEEDA',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                padding: '10px 20px', cursor: 'pointer',
                opacity: isPaymentLoading ? 0.7 : 1,
              }}
            >
              {isPaymentLoading
                ? <><FiLoader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Opening…</>
                : <><FiCreditCard size={13} /> Pay now</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaidBadge({ member }) {
  const shortPaymentId = member.razorpayPaymentId    ? member.razorpayPaymentId
    : '—';
  return (
    <div
      style={{
        background: 'rgba(151,196,89,0.1)',
        border: '1px solid rgba(151,196,89,0.4)',
        borderRadius: 16,
        padding: '1rem 1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(151,196,89,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FiCheckCircle size={17} style={{ color: '#27500A' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#173404' }}>Payment complete</p>
          <p style={{ fontSize: 12, color: '#3B6D11' }}>USRA Membership 2026 · ₹100</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          borderTop: '0.5px solid rgba(151,196,89,0.35)', paddingTop: '0.75rem',
        }}
      >
        <div>
          <p style={{ fontSize: 10, color: '#3B6D11', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment ID</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#173404', fontFamily: 'var(--font-mono)' }}>{shortPaymentId}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#3B6D11', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#173404' }}>{fmtDate(member.paidAt || member.updatedAt)}</p>
        </div>
      </div>

      {member.paymentId && (
        <button
          style={{
            marginTop: 10, fontSize: 12, fontWeight: 600,
            color: '#3B6D11',
            background: 'rgba(151,196,89,0.18)',
            border: '0.5px solid rgba(151,196,89,0.4)',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <FiDownload size={12} /> Download receipt
        </button>
      )}
    </div>
  );
}

function FailedPayment({ mongoId }) {
  const { openPayment, isPaymentLoading } = useRazorpayPayment();

  return (
    <div
      style={{
        background: 'rgba(240,149,123,0.08)',
        border: '1px solid rgba(240,149,123,0.4)',
        borderRadius: 16,
        padding: '1rem 1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(240,149,123,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <FiAlertCircle size={16} style={{ color: '#791F1F' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#501313' }}>Payment failed or cancelled</p>
          <p style={{ fontSize: 12, color: '#A32D2D' }}>Your profile is saved — no data was lost.</p>
        </div>
      </div>

      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
          borderTop: '0.5px solid rgba(240,149,123,0.35)', paddingTop: '0.75rem',
        }}
      >
        <p style={{ fontSize: 12, color: '#A32D2D', fontWeight: 600 }}>₹100 · USRA Membership 2026</p>
        <button
          onClick={() => openPayment(mongoId)}
          disabled={isPaymentLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#A32D2D', color: '#FCEBEB',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700,
            padding: '9px 18px', cursor: 'pointer',
            opacity: isPaymentLoading ? 0.7 : 1,
          }}
        >
          {isPaymentLoading
            ? <><FiLoader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Opening…</>
            : <><FiRefreshCw size={13} /> Retry payment</>}
        </button>
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */

/**
 * MembershipPaymentSection
 *
 * Drop-in replacement for the "Membership Info" section card in ProfilePage.
 * Renders a membership meta grid fused with a contextual payment block:
 *   - paymentStatus === 'completed' → green "Payment complete" summary
 *   - paymentStatus === 'failed'    → red "Retry payment" block
 *   - anything else                 → amber "Pay now" CTA
 *
 * Props:
 *   member {object} – the full member document from the backend
 */
export default function MembershipPaymentSection({ member }) {
  const isPaid   = member.paymentStatus === 'completed';
  const isFailed = member.paymentStatus === 'failed';

  return (
    <div
      id="section-membership"
      className="scroll-mt-36"
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        border: '1.5px solid rgba(78,174,229,0.14)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(78,174,229,0.06)',
      }}
    >
      {/* Top meta row — always visible */}
      <div
        style={{
          background: 'rgba(255,255,255,0.88)',
          padding: '1.25rem 1.5rem 0',
        }}
      >
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(78,174,229,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FiHash size={16} style={{ color: '#4EAEE5' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Membership Info</h2>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Read-only · contact admin to update</p>
          </div>
        </div>

        <MetaGrid member={member} />
      </div>

      {/* Payment block — state-driven */}
      <div style={{ background: 'rgba(255,255,255,0.88)', padding: '0 1.5rem 1.5rem' }}>
        {isPaid   && <PaidBadge member={member} />}
        {isFailed && <FailedPayment mongoId={member._id} />}
        {!isPaid && !isFailed && <PendingPayment mongoId={member._id} />}
      </div>
    </div>
  );
}