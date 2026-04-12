import { useMemo, useState } from 'react';

const GammaLogo = ({ size = 32 }) => {
  const logoCandidates = useMemo(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const firstPathSegment = window.location.pathname.split('/').filter(Boolean)[0];
    const fromBase = `${baseUrl}logo.png`;
    const fromRepoRoot = firstPathSegment ? `/${firstPathSegment}/logo.png` : null;

    return [fromBase, fromRepoRoot, '/logo.png', 'logo.png'].filter(
      (path, index, arr) => path && arr.indexOf(path) === index,
    );
  }, []);

  const [candidateIndex, setCandidateIndex] = useState(0);

  return (
    <img
      src={logoCandidates[candidateIndex]}
      alt="Gamma Index"
      width={size}
      height={size}
      className="rounded-lg object-contain"
      onError={() => {
        setCandidateIndex((current) =>
          current < logoCandidates.length - 1 ? current + 1 : current,
        );
      }}
    />
  );
};

export default GammaLogo;
