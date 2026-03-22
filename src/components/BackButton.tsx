import { useNavigate } from 'react-router-dom';

export default function BackButton({ to }: { to?: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => to ? nav(to) : nav(-1)}
      className="flex items-center gap-1 text-primary text-sm font-medium py-2"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      Back
    </button>
  );
}
